const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { once } = require("node:events");
const { randomUUID, createHash } = require("node:crypto");
const {
  createLab,
  validate,
} = require("../../scripts/laboratorio/servidor.cjs");
const { State, seed } = require("../../scripts/laboratorio/estado.cjs");
async function fixture(t) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "tickets-lab-")),
    file = path.join(dir, "estado.json"),
    lab = await createLab(file);
  lab.server.listen(0, "127.0.0.1");
  await once(lab.server, "listening");
  const base = "http://127.0.0.1:" + lab.server.address().port;
  const tokens = new Map();
  const session = (id) => {
    if (!tokens.has(id)) tokens.set(id, lab.createSession(id).token);
    return tokens.get(id);
  };
  const call = async (
    p,
    { id = 1, method = "GET", body, proof, form, token, requestId } = {},
  ) => {
    const r = await fetch(base + p, {
      method,
      headers: {
        ...(requestId ? { "X-Ticket-Request-Id": requestId } : {}),
        ...(token === null
          ? {}
          : { Authorization: "Bearer " + (token || session(id)) }),
        ...(proof ? { "X-Ticket-Confirmation": proof } : {}),
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: form || (body ? JSON.stringify(body) : undefined),
    });
    const data = r.headers.get("content-type")?.includes("application/json")
      ? await r.json()
      : Buffer.from(await r.arrayBuffer());
    return { status: r.status, data };
  };
  const proof = async (p, body, id = 1, method = "POST") => {
    const review = await call("/platform/confirmations/review", {
      id,
      method: "POST",
      body: { method, path: p.replace("/platform", ""), body },
    });
    assert.equal(review.status, 200);
    assert.equal(
      (
        await call("/platform/confirmations/" + review.data.id + "/confirm", {
          id,
          method: "POST",
        })
      ).status,
      200,
    );
    return review.data.id;
  };
  const command = async (p, payload, { id = 1, method = "POST" } = {}) => {
    const body = { ...payload, requestId: randomUUID() },
      a = lab.state.data.users.find((u) => u.id === id),
      proofId =
        a.mode === "ADMINISTRADOR"
          ? await proof(p, body, id, method)
          : undefined;
    return call(p, { id, method, body, proof: proofId });
  };
  t.after(async () => {
    lab.server.closeAllConnections();
    await new Promise((resolve) => lab.server.close(resolve));
    await lab.state.pending;
    await fs.rm(dir, { recursive: true, force: true });
  });
  return { lab, file, call, command, proof };
}
test("el estado inicial ficticio cumple los campos requeridos del contrato", () => {
  const s = seed();
  for (const [type, rows] of Object.entries(s.resources))
    for (const r of rows) validate(type, r);
  assert.equal(s.users.length, 7);
});
test("persiste cambios, no reemplaza silenciosamente archivos inválidos y no necesita Oracle", async (t) => {
  const { lab, file } = await fixture(t);
  await lab.state.change((s) => {
    s.resources.instalaciones[0].nombre = "Cambio local";
    return { guardado: true };
  });
  const other = await new State(file).open();
  assert.equal(other.data.resources.instalaciones[0].nombre, "Cambio local");
  await fs.writeFile(file, "{invalido");
  await assert.rejects(new State(file).open());
});
test("sesiones locales, visibilidad privada y operaciones por perfil", async (t) => {
  const { call, lab } = await fixture(t);
  assert.equal(
    (await call("/platform/bootstrap", { token: null })).status,
    401,
  );
  const user = await call("/platform/bootstrap", { id: 7 });
  assert.equal(user.data.actor.admin, false);
  assert.equal(user.data.definitions.servidores, undefined);
  assert.equal(
    (
      await call("/platform/monitor/" + lab.state.data.ids.servidor, {
        id: 7,
      })
    ).status,
    403,
  );
  const activities = await call("/platform/records/actividades", { id: 7 });
  assert.ok(activities.data.items.some((r) => r.visibilidad === "EMPRESA"));
  assert.ok(!activities.data.items.some((r) => r.visibilidad === "PRIVADA"));
  assert.equal((await call("/platform/rbac", { id: 7 })).status, 403);
});
test("dos confirmaciones, contenido vinculado, idempotencia y conflictos de versión", async (t) => {
  const { call, command, proof, lab } = await fixture(t),
    p = "/platform/records/instalaciones",
    body = {
      requestId: randomUUID(),
      data: {
        nombre: "Instalación de prueba",
        equipoId: lab.state.data.ids.it,
        visibilidad: "EQUIPO",
        estado: "ACTIVO",
        datos: { direccion: "Ficticia", responsableId: 4 },
      },
    };
  assert.equal((await call(p, { method: "POST", body })).status, 409);
  const confirmed = await proof(p, body);
  assert.equal(
    (
      await call(p, {
        method: "POST",
        body: {
          ...body,
          data: { ...body.data, nombre: "Otro contenido" },
        },
        proof: confirmed,
      })
    ).status,
    409,
  );
  const saved = await call(p, { method: "POST", body, proof: confirmed });
  assert.equal(saved.status, 200);
  const repeated = await call(p, { method: "POST", body, proof: confirmed });
  assert.equal(repeated.data.id, saved.data.id);
  assert.equal(
    lab.state.data.resources.instalaciones.filter(
      (r) => r.nombre === body.data.nombre,
    ).length,
    1,
  );
  const stale = await command(
    p + "/" + saved.data.id,
    { version: 9, data: body.data },
    { method: "PATCH" },
  );
  assert.equal(stale.status, 409);
  assert.equal(lab.state.data.audit.length, 1);
});
test("asignación por Secretaría, primera atención y resolución por Técnico", async (t) => {
  const { command, call } = await fixture(t);
  assert.equal(
    (
      await command(
        "/platform/tickets/1/assign",
        { version: 1, usuarioId: 4 },
        { id: 7 },
      )
    ).status,
    403,
  );
  const assigned = await command(
    "/platform/tickets/1/assign",
    { version: 1, usuarioId: 4 },
    { id: 2 },
  );
  assert.equal(assigned.status, 200);
  assert.equal(assigned.data.estado, 2);
  assert.equal(
    (await command("/platform/tickets/1/start", { version: 2 }, { id: 4 })).data
      .estado,
    3,
  );
  assert.equal(
    (await command("/platform/tickets/1/resolve", { version: 3 }, { id: 4 }))
      .data.estado,
    5,
  );
  assert.equal((await call("/platform/tickets/1", { id: 7 })).data.estado, 5);
});
test("el mapa guarda posiciones y rechaza un puerto ocupado", async (t) => {
  const { command, call, lab } = await fixture(t),
    s = lab.state.data;
  const layout = await command("/platform/records/dispositivos/layout", {
    placements: [{ id: s.ids.switch, version: 1, x: 350, y: 400 }],
  });
  assert.equal(layout.status, 200);
  const graph = await call("/platform/network/" + s.ids.sitio);
  assert.equal(
    graph.data.dispositivos.find((r) => r.id === s.ids.switch).datos.x,
    350,
  );
  const collision = await command("/platform/records/conexiones", {
    data: {
      nombre: "Puerto repetido",
      equipoId: s.ids.it,
      visibilidad: "EQUIPO",
      estado: "ACTIVO",
      datos: {
        origenId: s.ids.switch,
        puertoOrigen: 1,
        destinoId: s.ids.router,
        puertoDestino: 2,
        medio: "UTP",
      },
    },
  });
  assert.equal(collision.status, 409);
});
test("aprobación y alta simulan resultados sin SMTP ni cuentas institucionales", async (t) => {
  const { command, call, lab } = await fixture(t);
  const created = await command(
    "/platform/records/solicitudes",
    {
      data: {
        nombre: "Cuenta ficticia",
        equipoId: lab.state.data.ids.finanzas,
        visibilidad: "EQUIPO",
        estado: "PENDIENTE",
        datos: {
          tipo: "USUARIO_NUEVO",
          justificacion: "Prueba",
          correo: "nuevo@laboratorio.invalid",
          dpi: "FICTICIO",
          perfilId: 7,
        },
      },
    },
    { id: 3 },
  );
  assert.equal(created.status, 200);
  const id = created.data.id,
    approved = await command("/platform/requests/" + id + "/decision", {
      version: 1,
      decision: "APROBAR",
    });
  assert.equal(approved.data.estado, "APROBADA_PENDIENTE_CUENTA");
  assert.equal(
    (
      await command("/platform/requests/" + id + "/provision", {
        version: 2,
      })
    ).data.invitacion.estado,
    "SIMULADA_SIN_ENVIO",
  );
  assert.equal(
    (await call("/platform/records/solicitudes/" + id)).data.estado,
    "ATENDIDA",
  );
});
test("archivos privados se conservan localmente y requieren alcance", async (t) => {
  const { call, proof, lab } = await fixture(t),
    p = "/platform/records/activos/" + lab.state.data.ids.activo + "/files",
    buffer = Buffer.from("%PDF-1.4\nDocumento ficticio"),
    body = {
      requestId: randomUUID(),
      version: 1,
      data: {
        nombre: "prueba.pdf",
        mime: "application/pdf",
        bytes: buffer.length,
        hash: createHash("sha256").update(buffer).digest("hex"),
      },
    },
    confirmed = await proof(p, body),
    form = new FormData();
  form.set("command", JSON.stringify(body));
  form.set(
    "file",
    new Blob([buffer], { type: "application/pdf" }),
    "prueba.pdf",
  );
  const saved = await call(p, { method: "POST", proof: confirmed, form });
  assert.equal(saved.status, 200);
  const download = await call("/platform/files/" + saved.data.id);
  assert.equal(download.data.toString(), buffer.toString());
  assert.equal(
    (await call("/platform/files/" + saved.data.id, { id: 7 })).status,
    403,
  );
});
test("fallos controlados y límites de integraciones no aparentan éxito", async (t) => {
  const { call, lab } = await fixture(t);
  lab.failures.push({ ruta: "/platform/metrics", restantes: 1 });
  assert.equal((await call("/platform/metrics")).status, 503);
  assert.equal((await call("/platform/metrics")).status, 200);
  assert.equal(
    (
      await call("/platform/integrations/observer/no-existe", {
        method: "POST",
        body: {},
      })
    ).status,
    501,
  );
  const logs = await call(
    "/platform/monitor/" + lab.state.data.ids.servidor + "?logs=1",
    { id: 5 },
  );
  assert.equal(logs.status, 403);
});

test("crear y conversar en un ticket usa el contrato GraphQL sin efectos externos", async (t) => {
  const { call, lab } = await fixture(t);
  const input = {
    titulo: "Ticket ficticio creado por GraphQL",
    descripcion: "Recorrido local",
    categoriaId: 1,
    prioridadId: 2,
    estadoId: 1,
    usuarioCreadorId: 1,
  };
  const body = {
    query:
      "mutation($input: CreateTicketInput!){createTicket(input:$input){ticket{id}}}",
    variables: { input },
  };
  const result = await call("/graphql", {
    id: 7,
    method: "POST",
    body,
    requestId: randomUUID(),
  });
  assert.equal(result.status, 200);
  const id = Number(result.data.data.createTicket.ticket.id);
  assert.equal(
    lab.state.data.tickets.find((t) => t.id === id).usuarioCreadorId,
    7,
  );
  const message = await call("/graphql", {
    id: 7,
    method: "POST",
    requestId: randomUUID(),
    body: {
      query:
        "mutation($input: SendTicketMessageInput!){sendTicketMessage(input:$input){textoMensaje}}",
      variables: {
        input: {
          ticketId: id,
          textoMensaje: "Mensaje ficticio",
          usuarioId: 1,
        },
      },
    },
  });
  assert.equal(message.status, 200);
  assert.equal(message.data.data.sendTicketMessage.usuario, 7);
  const before = lab.state.data.tickets.length;
  const form = new FormData();
  form.set("operations", JSON.stringify(body));
  form.set("map", JSON.stringify({ 0: ["variables.files.0"] }));
  form.set(
    "0",
    new Blob(["%PDF-1.4 ficticio"], { type: "application/pdf" }),
    "prueba.pdf",
  );
  assert.equal(
    (
      await call("/graphql", {
        id: 7,
        method: "POST",
        form,
        requestId: randomUUID(),
      })
    ).status,
    501,
  );
  assert.equal(lab.state.data.tickets.length, before);
  assert.equal(
    (
      await call("/graphql", {
        id: 7,
        method: "POST",
        body: {
          query:
            "query($ticketId:ID!){ticketMessages(ticketId:$ticketId){textoMensaje}}",
          variables: { ticketId: String(id) },
        },
      })
    ).data.data.ticketMessages.length,
    1,
  );
});
