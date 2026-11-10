// Adaptador HTTP local: simula contratos del Panel, no la persistencia/seguridad de Oracle.
const http = require("node:http");
const { randomUUID, createHash } = require("node:crypto");
const { parse, getOperationAST, valueFromASTUntyped } = require("graphql");
const { State, definitions, clone, now } = require("./estado.cjs");
const ticketLabels = require('./ticket-labels.cjs');
const fail = (status, message) => {
  throw Object.assign(new Error(message), { status });
};
const stable = (v) =>
  JSON.stringify(
    v && typeof v === "object"
      ? Array.isArray(v)
        ? v.map((x) => JSON.parse(stable(x)))
        : Object.fromEntries(
            Object.keys(v)
              .sort()
              .map((k) => [k, JSON.parse(stable(v[k] ?? null))]),
          )
      : (v ?? null),
  );
const hash = (v) => createHash("sha256").update(stable(v)).digest("hex");
const page = (items, q) => {
  const offset = Math.max(0, Math.min(1000000, Number(q.get("offset")) || 0)),
    limit = Math.max(1, Math.min(100, Number(q.get("limit")) || 25));
  return {
    items: items.slice(offset, offset + limit),
    total: items.length,
    offset,
    limit,
  };
};
const statuses = [
  "",
  "Sin asignar",
  "Asignado",
  "En atención",
  "Cancelado",
  "Resuelto",
];
function effective(s, id) {
  const u = s.users.find((u) => u.id === Number(id));
  if (!u) fail(404, "Usuario ficticio no encontrado.");
  const roles = [
    ...new Set([
      ...s.catalog.profileRoles
        .filter((x) => x.perfilId === u.perfilId)
        .map((x) => x.rolId),
      ...u.roles,
    ]),
  ];
  const ids = new Set([
    ...s.catalog.rolePermissions
      .filter((x) => roles.includes(x.rolId))
      .map((x) => x.permisoId),
    ...u.permisos,
  ]);
  return {
    usuarioId: u.id,
    perfilId: u.perfilId,
    roles,
    rolesAdicionales: u.roles,
    permisosAdicionales: u.permisos,
    permisos: s.catalog.permissions.filter((p) => ids.has(p.id)),
  };
}
function actor(s, id) {
  const u = s.users.find((x) => x.id === Number(id));
  if (!u) fail(401, "Elige un perfil en el laboratorio.");
  const access = effective(s, u.id);
  return {
    ...u,
    permissions: new Set(access.permisos.map((p) => p.nombre)),
    admin: access.permisos.some((p) => p.nombre === "TICKETS_ADMINISTRAR"),
  };
}
const has = (a, p) => a.admin || a.permissions.has(p);
const manager = (a) => a.admin || a.mode === "JEFATURA";
function allowed(a, type, op) {
  const d = definitions[type];
  if (!d) return false;
  if (a.admin) return !(d.immutable && ["EDITAR", "ELIMINAR"].includes(op));
  if (d.adminOnly && op !== "LEER") return false;
  return (
    (d.audience === "everyone" && op === "LEER") ||
    (type === "solicitudes" && op === "INSERTAR" && manager(a)) ||
    has(a, d.permission + "_" + op)
  );
}
function visible(a, r) {
  return (
    !r.eliminadoEn &&
    (a.admin ||
      r.visibilidad === "EMPRESA" ||
      (r.visibilidad === "PRIVADA"
        ? r.usuarioId === a.id
        : r.equipoId === a.equipoId))
  );
}
function get(s, a, type, id, op = "LEER") {
  if (!allowed(a, type, op))
    fail(403, "Sin permiso para esta operación en el perfil de prueba.");
  const r = s.resources[type]?.find((x) => x.id === id);
  if (!r || !visible(a, r))
    fail(404, "Registro no disponible en el alcance del perfil de prueba.");
  return r;
}
function requireAdmin(a) {
  if (!a.admin) fail(403, "Administración requerida.");
}
function audit(s, a, tipo, registroId, accion, antes, despues, body, proof) {
  s.audit.unshift({
    id: randomUUID(),
    actor: a.nombre,
    actorId: a.id,
    tipo,
    registroId,
    accion,
    antes: clone(antes ?? null),
    despues: clone(despues ?? null),
    resultado: "CORRECTO",
    fecha: now(),
    solicitudId: body.requestId,
    revisadoEn: proof?.revisadoEn ?? null,
    confirmadoEn: proof?.confirmadoEn ?? null,
  });
}
function command(s, a, req, p, body, fn) {
  if (!/^[a-f0-9-]{36}$/i.test(body.requestId || ""))
    fail(400, "La acción requiere un requestId.");
  const digest = hash({ method: req.method, path: p, body }),
    prior = s.commands[body.requestId];
  if (prior) {
    if (prior.actor !== a.id || prior.hash !== digest)
      fail(409, "El identificador ya fue usado con otra acción.");
    return clone(prior.result);
  }
  const proof = s.confirmations[req.headers["x-ticket-confirmation"]];
  if (
    a.admin &&
    (!proof ||
      proof.actor !== a.id ||
      proof.hash !== digest ||
      proof.paso !== 2 ||
      proof.usado ||
      Date.now() > proof.expira)
  )
    fail(409, "Se requieren las dos confirmaciones vigentes para esta acción.");
  const result = fn(proof);
  if (result instanceof Promise)
    fail(500, "Acción local asíncrona no permitida.");
  if (proof) proof.usado = true;
  s.commands[body.requestId] = {
    actor: a.id,
    hash: digest,
    result: clone(result),
  };
  return result;
}
function verifyVersion(row, body) {
  if (Number(body.version) !== row.version)
    fail(409, "El registro cambió. Actualiza antes de guardar.");
}
function validate(type, data) {
  const d = definitions[type];
  if (!d) fail(404, "Recurso no encontrado.");
  if (
    !data ||
    typeof data !== "object" ||
    typeof data.nombre !== "string" ||
    !data.nombre.trim()
  )
    fail(400, "Nombre requerido.");
  if (
    data.nombre.length > 200 ||
    !data.datos ||
    typeof data.datos !== "object" ||
    Array.isArray(data.datos)
  )
    fail(400, "Registro inválido.");
  for (const f of d.fields) {
    const v = data.datos[f.key];
    if (f.required && (v === undefined || v === null || v === ""))
      fail(400, "Completa " + f.label + ".");
    if (v === undefined || v === null || v === "") continue;
    if (f.options && !f.options.includes(v))
      fail(400, "Opción inválida: " + f.label);
    if (
      f.type === "number" &&
      (!Number.isFinite(Number(v)) ||
        (f.min !== undefined && Number(v) < f.min) ||
        (f.max !== undefined && Number(v) > f.max))
    )
      fail(400, "Valor inválido: " + f.label);
    if (["date", "datetime"].includes(f.type) && !Number.isFinite(+new Date(v)))
      fail(400, "Fecha inválida: " + f.label);
  }
  if (
    type === "actividades" &&
    new Date(data.datos.fin) <= new Date(data.datos.inicio)
  )
    fail(400, "El final debe ser posterior al inicio.");
}
function catalog(s) {
  return {
    ...s.catalog,
    users: s.users.map((u) => ({
      id: u.id,
      nombre: u.nombre,
      perfilId: u.perfilId,
    })),
    userRoles: s.users.flatMap((u) =>
      u.roles.map((rolId) => ({ usuarioId: u.id, rolId })),
    ),
    userPermissions: s.users.flatMap((u) =>
      u.permisos.map((permisoId) => ({ usuarioId: u.id, permisoId })),
    ),
    usersTruncated: false,
  };
}
function labels(s, r) {
  const result = {};
  for (const [k, v] of Object.entries(r.datos)) {
    const field = Object.values(definitions)
      .flatMap((d) => d.fields)
      .find((f) => f.key === k);
    if (field?.type === "user")
      result[k] = s.users.find((u) => u.id === Number(v))?.nombre;
    else if (field?.resource)
      result[k] = s.resources[field.resource]?.find((x) => x.id === v)?.nombre;
  }
  return result;
}
function ticketDto(s, t) {
  const n = (id) =>
    s.users.find((x) => x.id === id)?.nombre || "Usuario ficticio";
  return {
    ...t,
    id: String(t.id),
    creador: {
      id: String(t.usuarioCreadorId),
      nombre: n(t.usuarioCreadorId),
      avatar: null,
    },
    asignado: t.usuarioAsignadoId
      ? {
          id: String(t.usuarioAsignadoId),
          nombre: n(t.usuarioAsignadoId),
          avatar: null,
        }
      : null,
    usuarioCreadorNombre: n(t.usuarioCreadorId),
    usuarioAsignadoNombre: t.usuarioAsignadoId ? n(t.usuarioAsignadoId) : null,
    categoriaNombre: "Soporte local",
    prioridadNombre: "Normal",
    estadoNombre: statuses[t.estadoId],
    fechaCierre: t.estadoId >= 4 ? t.fechaActualizacion : null,
  };
}
const canTicket = (a, t, s) =>
  a.admin ||
  a.mode === "ASIGNACION" ||
  t.usuarioCreadorId === a.id ||
  t.usuarioAsignadoId === a.id ||
  (manager(a) &&
    s.users.some(
      (u) => u.id === t.usuarioCreadorId && u.equipoId === a.equipoId,
    ));
function requestPlan(s, r) {
  const d = r.datos,
    current = d.usuarioDestinoId
      ? effective(s, d.usuarioDestinoId)
      : { permisos: [] },
    target = d.copiarUsuarioId
      ? effective(s, d.copiarUsuarioId).permisos
      : s.catalog.permissions.filter(
          (p) =>
            (d.permisos || []).includes(p.id) ||
            s.catalog.rolePermissions.some(
              (x) =>
                x.permisoId === p.id &&
                [
                  ...(d.roles || []),
                  ...s.catalog.profileRoles
                    .filter((y) => y.perfilId === Number(d.perfilId))
                    .map((y) => y.rolId),
                ].includes(x.rolId),
            ),
        );
  return {
    accessVersion: s.catalog.version,
    agregar: target.filter((p) => !current.permisos.some((c) => c.id === p.id)),
    retirar: [],
    copiaIndependiente: !!d.copiarUsuarioId,
  };
}
async function createLab(file, options = {}) {
  const state = await new State(file).open(),
    sessions = new Map(),
    failures = [];
  function createSession(id) {
    actor(state.data, id);
    const token = "laboratorio-" + randomUUID();
    sessions.set(token, Number(id));
    return { token, user: userProfile(actor(state.data, id)) };
  }
  function userProfile(a) {
    return {
      id_usuario: String(a.id),
      nombre: a.nombre,
      email: a.email,
      rol: a.rol,
      permisos: [...a.permissions],
      departamento:
        a.equipoId === state.data.ids.it
          ? "Informática ficticia"
          : "Contabilidad ficticia",
      perfil: { id: a.perfilId, nombre: "Perfil de laboratorio" },
      roles: [],
      avatar: null,
    };
  }
  function bootstrap(s, a) {
    return {
      enabled: true,
      inventoryConnected: false,
      defaultTicketTeamId: s.ids.it,
      actor: { id: a.id, nombre: a.nombre, admin: a.admin, mode: a.mode },
      definitions: Object.fromEntries(
        Object.entries(definitions)
          .filter(([k]) => allowed(a, k, "LEER"))
          .map(([k, d]) => [
            k,
            {
              ...d,
              table: undefined,
              actions: Object.fromEntries(
                ["LEER", "INSERTAR", "EDITAR", "ELIMINAR"].map((o) => [
                  o,
                  allowed(a, k, o),
                ]),
              ),
            },
          ]),
      ),
      teams: s.resources.equipos
        .filter((r) => a.admin || r.id === a.equipoId)
        .map((r) => ({ id: r.id, nombre: r.nombre })),
      memberships: [
        {
          equipoId: a.equipoId,
          funcion: a.admin
            ? "JEFATURA"
            : a.mode === "ASIGNACION"
              ? "ASIGNADOR"
              : a.mode === "USUARIO"
                ? "MIEMBRO"
                : a.mode,
        },
      ],
      capabilities: {
        assign: a.admin || a.mode === "ASIGNACION",
        attend: has(a, "TICKETS_ATENDER"),
        audit: has(a, "TICKETS_AUDITORIA_LEER"),
        logs: has(a, "TICKETS_LOGS_LEER"),
        teamMetrics: manager(a),
      },
      timezone: "America/Guatemala",
    };
  }
  function dispatch(s, a, req, url, body, upload) {
    const p = url.pathname.replace(/^\/platform/, ""),
      parts = p.split("/").filter(Boolean),
      q = url.searchParams;
    if (p === "/bootstrap") return bootstrap(s, a);
    if (p === "/catalog") return s.applicationCatalog || {}; // Catálogo ficticio explícito de los recorridos; sin trámites externos.
    if (parts[0] === 'module-access') {
      const id = parts[1], custom = s.moduleAccess?.[a.id]?.[id];
      if (custom) return { moduloId:id, ...custom };
      const visible = Object.values(s.applicationCatalog || {}).some(app => Object.values(app.sections || {}).some(section => (section.modules || []).some(module => module.id===id)));
      const actions = { LEER:!!(a.admin || visible), INSERTAR:!!a.admin, EDITAR:!!a.admin, ELIMINAR:!!a.admin };
      return { moduloId:id, allowed:actions.LEER && (!['proc01','mod01','mod10'].includes(id) || actions.INSERTAR), actions };
    }
    if (p === "/people")
      return s.users
        .filter(
          (u) =>
            (a.admin ||
              manager(a) ||
              u.equipoId === a.equipoId ||
              u.id === a.id) &&
            u.nombre.toLowerCase().includes((q.get("q") || "").toLowerCase()),
        )
        .map((u) => ({ id: u.id, nombre: u.nombre }));
    if (p === "/access-options") {
      if (!manager(a)) fail(403, "Jefatura requerida.");
      return catalog(s);
    }
    if (p === "/confirmations/review") {
      requireAdmin(a);
      const id = randomUUID();
      s.confirmations[id] = {
        actor: a.id,
        hash: hash({
          method: body.method,
          path: body.path,
          body: body.body,
        }),
        paso: 1,
        expira: Date.now() + 600000,
        revisadoEn: now(),
      };
      return { id, paso: 1 };
    }
    if (parts[0] === "confirmations" && parts[2] === "confirm") {
      const f = s.confirmations[parts[1]];
      if (
        !a.admin ||
        !f ||
        f.actor !== a.id ||
        f.paso !== 1 ||
        Date.now() > f.expira
      )
        fail(409, "La revisión no está vigente.");
      f.paso = 2;
      f.confirmadoEn = now();
      return { id: parts[1], paso: 2 };
    }
    if (p === "/audit") {
      if (!has(a, "TICKETS_AUDITORIA_LEER"))
        fail(403, "Sin acceso a auditoría.");
      return page(
        s.audit.filter(
          (r) =>
            (a.admin || r.actorId === a.id) &&
            (!q.get("tipo") || q.get("tipo") === r.tipo) &&
            (!q.get("resultado") || q.get("resultado") === r.resultado),
        ),
        q,
      );
    }
    if (p === "/metrics") {
      const team = q.get("equipoId");
      if (team && (!manager(a) || (!a.admin && team !== a.equipoId)))
        fail(403, "Sin acceso al equipo.");
      const people = team
          ? s.users.filter((u) => u.equipoId === team).map((u) => u.id)
          : [a.id],
        inDate = (date) => {
          const day = new Intl.DateTimeFormat("fr-CA", {
            timeZone: "America/Guatemala",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).format(new Date(date));
          return (
            (!q.get("desde") || day >= q.get("desde")) &&
            (!q.get("hasta") || day <= q.get("hasta"))
          );
        };
      const ts = s.tickets.filter(
          (t) => people.includes(t.usuarioCreadorId) && inDate(t.fechaCreacion),
        ),
        events = s.events.filter(
          (e) => people.includes(e.usuarioId) && inDate(e.fecha),
        ),
        groups = {};
      for (const e of events) {
        const key = e.aplicacionId + e.operacion;
        groups[key] ??= {
          aplicacionId: e.aplicacionId,
          aplicacionNombre: e.aplicacionNombre,
          operacion: e.operacion,
          eventos: 0,
          cantidad: 0,
        };
        groups[key].eventos++;
        groups[key].cantidad += e.cantidad;
      }
      return {
        tickets: {
          total: ts.length,
          resueltos: ts.filter((t) => t.estadoId === 5).length,
          enTrabajo: ts.filter((t) => t.estadoId === 3).length,
          asignados: ts.filter((t) => t.estadoId === 2).length,
          pendientesRespuesta: ts.filter((t) => [1,2].includes(t.estadoId) && !t.atendidoEn).length,
          sinAsignar: ts.filter((t) => t.estadoId === 1 && !t.usuarioAsignadoId).length,
          sinPrimeraAtencion: ts.filter((t) => t.estadoId === 2 && !t.atendidoEn).length,
        },
        aplicaciones: Object.values(groups),
        registros: page(events, q).items,
        totalRegistros: events.length,
        limiteDetalle: 100,
        actividadTickets: q.get("inicio") === "true" && !team ? s.tickets.filter(t=>t.usuarioCreadorId===a.id).sort((a,b)=>+new Date(b.fechaCreacion)-+new Date(a.fechaCreacion)).slice(0,3).map(t=>({id:String(t.id),codigo:t.codigo,fecha:t.fechaCreacion})) : [],
      };
    }
    if (parts[0] === "search")
      return {
        consulta: q.get("q"),
        grupos: Object.entries(definitions)
          .filter(([type]) => allowed(a, type, "LEER"))
          .map(([type, d]) => {
            const items = s.resources[type].filter(
              (r) =>
                visible(a, r) &&
                r.nombre
                  .toLowerCase()
                  .includes((q.get("q") || "").toLowerCase()),
            );
            return {
              tipo: type,
              titulo: d.title,
              grupo: d.group,
              items: items.slice(0, 10),
              total: items.length,
            };
          })
          .filter((g) => g.total),
        limitePorGrupo: 10,
      };
    if (parts[0] === "network") {
      const site = get(s, a, "instalaciones", parts[1]);
      if (!allowed(a, "dispositivos", "LEER"))
        fail(403, "Sin permiso para la red.");
      const nodes = s.resources.dispositivos.filter(
        (r) => visible(a, r) && r.datos.instalacionId === site.id,
      );
      return {
        instalacion: site,
        dispositivos: nodes,
        conexiones: s.resources.conexiones.filter(
          (r) =>
            visible(a, r) &&
            nodes.some((n) => n.id === r.datos.origenId) &&
            nodes.some((n) => n.id === r.datos.destinoId),
        ),
      };
    }
    if (parts[0] === "monitor") {
      get(s, a, "servidores", parts[1]);
      if (q.get("logs") === "1" && !has(a, "TICKETS_LOGS_LEER"))
        fail(403, "Sin acceso a logs.");
      return {
        disponible: true,
        estado: q.get("obsoleto") === "1" ? "DESACTUALIZADO" : "ACTUAL",
        observadoEn: now(),
        metricas: {
          cpuPorcentaje: 18,
          memoriaTotalBytes: 8589934592,
          memoriaUsadaBytes: 2147483648,
          discoTotalBytes: 100000000000,
          discoUsadoBytes: 36000000000,
          uptimeSegundos: 86400,
        },
        contenedores: [
          {
            nombre: "servicio-ficticio",
            estado: "running",
            salud: null,
            imagen: "imagen-ficticia:lab",
            ...(q.get("logs") === "1"
              ? {
                  logs: "[SIMULADO] Inicio de servicio ficticio. No se consultó ningún servidor.",
                }
              : {}),
          },
        ],
      };
    }
    if (parts[0] === "objects") {
      const r = get(s, a, "esquemas", parts[1]);
      return {
        owner: r.datos.owner,
        consultadoEn: now(),
        objects: [
          {
            nombre: "TB_EJEMPLO_FICTICIO",
            tipo: "TABLE",
            estado: "VALID",
          },
          {
            nombre: "TR_EJEMPLO_FICTICIO",
            tipo: "TRIGGER",
            estado: "VALID",
          },
        ],
        constraints: [
          {
            tabla: "TB_EJEMPLO_FICTICIO",
            nombre: "PK_EJEMPLO_FICTICIO",
            tipo: "P",
            estado: "ENABLED",
            validado: "VALIDATED",
          },
        ],
        limite: 500,
      };
    }
    if (parts[0] === "rbac") {
      requireAdmin(a);
      if (parts.length === 1) return catalog(s);
      if (parts[1] === "effective") return effective(s, q.get("user"));
      if (parts[1] === "preview") {
        const origen = effective(s, q.get("source")),
          target = q.get("target")
            ? effective(s, q.get("target"))
            : { permisos: [] };
        return {
          origen,
          agregar: origen.permisos.filter(
            (p) => !target.permisos.some((t) => t.id === p.id),
          ),
          retirar: target.permisos.filter(
            (p) => !origen.permisos.some((t) => t.id === p.id),
          ),
        };
      }
      return command(s, a, req, p, body, (proof) => {
        if (body.version !== s.catalog.version)
          fail(409, "El catálogo cambió; actualiza antes de guardar.");
        const before = clone(catalog(s)),
          data = body.data || {},
          action = parts[1];
        let result;
        if (action === "user-access") {
          const u = s.users.find((u) => u.id === Number(data.usuarioId));
          if (!u) fail(404, "Usuario no encontrado.");
          u.perfilId = data.perfilId ? Number(data.perfilId) : null;
          u.roles = (data.roles || []).map(Number);
          u.permisos = (data.permisos || []).map(Number);
          if (data.copiarUsuarioId) {
            u.perfilId = null;
            u.roles = [];
            u.permisos = effective(s, data.copiarUsuarioId).permisos.map(
              (p) => p.id,
            );
          }
          result = effective(s, u.id);
        } else if (action === "profile-roles") {
          s.catalog.profileRoles = s.catalog.profileRoles.filter(
            (x) => x.perfilId !== Number(data.perfilId),
          );
          s.catalog.profileRoles.push(
            ...(data.roles || []).map((rolId) => ({
              perfilId: Number(data.perfilId),
              rolId: Number(rolId),
            })),
          );
          result = { aplicado: true };
        } else if (action === "role-permissions") {
          s.catalog.rolePermissions = s.catalog.rolePermissions.filter(
            (x) => x.rolId !== Number(data.rolId),
          );
          s.catalog.rolePermissions.push(
            ...(data.permisos || []).map((permisoId) => ({
              rolId: Number(data.rolId),
              permisoId: Number(permisoId),
            })),
          );
          result = { aplicado: true };
        } else {
          const key = {
            profiles: "profiles",
            roles: "roles",
            permissions: "permissions",
          }[action];
          if (!key) fail(501, "Operación de accesos no simulada.");
          const list = s.catalog[key];
          if (data.eliminar) {
            const i = list.findIndex((x) => x.id === Number(data.id));
            if (i < 0) fail(404, "Entrada no encontrada.");
            list.splice(i, 1);
            result = { eliminado: true };
          } else {
            if (!data.nombre) fail(400, "Nombre requerido.");
            let r = list.find((x) => x.id === Number(data.id));
            if (!r) {
              r = {
                id: Math.max(0, ...list.map((x) => x.id)) + 1,
              };
              list.push(r);
            }
            Object.assign(r, {
              nombre: data.nombre,
              descripcion: data.descripcion || "",
            });
            result = r;
          }
        }
        if (!s.users.some((u) => actor(s, u.id).admin))
          fail(409, "No se puede retirar al último administrador.");
        s.catalog.version++;
        audit(
          s,
          a,
          "accesos",
          String(data.usuarioId || data.id || ""),
          action,
          before,
          catalog(s),
          body,
          proof,
        );
        return result;
      });
    }
    if (parts[0] === "tickets") {
      if(p==='/tickets/reports/labels') return ticketLabels.report(s,a,q);
      if (parts.length === 1) {
        const scope = q.get("scope") || "creados";
        if (scope === "cola" && !a.admin && a.mode !== "ASIGNACION")
          fail(403, "Sin permiso para asignar.");
        let rows = s.tickets.filter((t) =>
          scope === "cola"
            ? true
            : scope === "asignados"
              ? t.usuarioAsignadoId === a.id
              : scope === "equipo"
                ? manager(a) &&
                  s.users.some(
                    (u) =>
                      u.id === t.usuarioCreadorId &&
                      u.equipoId === (q.get("equipoId") || a.equipoId),
                  )
                : t.usuarioCreadorId === a.id,
        );
        if (q.get("estado") === "sin-asignar")
          rows = rows.filter((t) => !t.usuarioAsignadoId);
        if (q.get("estado") === "sin-atencion")
          rows = rows.filter((t) => t.usuarioAsignadoId && !t.atendidoEn);
        return page(
          rows.map((t) => ({
            ...t,
            estado: t.estadoId,
            creador: s.users.find((u) => u.id === t.usuarioCreadorId)?.nombre,
            asignado:
              s.users.find((u) => u.id === t.usuarioAsignadoId)?.nombre || null,
            asignadoId: t.usuarioAsignadoId,
            equipoId: s.ids.it,
            minutosAlerta: 60,
            fechaAsignacionConocida: !!t.asignadoEn,
            alerta:
              t.estadoId === 2 && !t.atendidoEn ? "SIN_PRIMERA_ATENCION" : null,
          })),
          q,
        );
      }
      const t = s.tickets.find((t) => t.id === Number(parts[1]));
      if (!t || !canTicket(a, t, s)) fail(404, "Ticket no disponible.");
      if (parts[2] === "assignees") {
        if (!a.admin && a.mode !== "ASIGNACION")
          fail(403, "Sin permiso para asignar.");
        return s.users
          .filter((u) =>
            ["TECNICO", "DESARROLLADOR", "DEVOPS"].includes(u.mode),
          )
          .map((u) => ({ id: u.id, nombre: u.nombre }));
      }
      if (parts.length === 2) return { ...t, id: t.id, estado: t.estadoId };
      if(parts[2]==='tags') {
        if(req.method==='GET')return {id:t.id,version:t.version,puedeEditar:ticketLabels.canEdit(a,t),etiquetas:ticketLabels.labels(t).map(tag=>({...tag,id:Number(tag.id)}))};
        return command(s,a,req,p,body,proof=>{
          verifyVersion(t,body);
          if(!ticketLabels.canEdit(a,t))fail(403,'Solo el responsable o el administrador puede clasificar un ticket abierto y asignado.');
          if(!Array.isArray(body.tagIds)||body.tagIds.length>10||new Set(body.tagIds).size!==body.tagIds.length||body.tagIds.some(id=>!ticketLabels.catalog.some(tag=>Number(tag.id)===id)))fail(400,'Etiquetas inválidas.');
          const before=ticketLabels.labels(t);t.tagIds=[...body.tagIds];t.version++;const after=ticketLabels.labels(t);
          s.ticketHistory.push({id:randomUUID(),ticketId:t.id,usuarioId:a.id,accion:'ETIQUETAS',valorAnterior:before.map(x=>x.nombre).join(', ')||'Sin etiquetas',valorNuevo:after.map(x=>x.nombre).join(', ')||'Sin etiquetas',tag:after.map(x=>x.nombre).join(', '),fecha:now()});
          audit(s,a,'tickets',String(t.id),'ETIQUETAS',{etiquetas:before},{etiquetas:after},body,proof);
          return {id:t.id,version:t.version,etiquetas:after.map(tag=>({...tag,id:Number(tag.id)}))};
        });
      }
      return command(s, a, req, p, body, (proof) => {
        verifyVersion(t, body);
        const before = clone(t),
          action = parts[2];
        if (action === "assign") {
          if (!a.admin && a.mode !== "ASIGNACION")
            fail(403, "Sin permiso para asignar.");
          const u = s.users.find((u) => u.id === Number(body.usuarioId));
          if (
            !u ||
            (!["TECNICO", "DESARROLLADOR", "DEVOPS"].includes(u.mode) &&
              !(a.admin && u.id === a.id && t.usuarioCreadorId === a.id))
          )
            fail(400, "Responsable no elegible.");
          t.usuarioAsignadoId = u.id;
          t.estadoId = 2;
          t.asignadoEn = now();
        } else if (action === "start" || action === "resolve") {
          if (!a.admin && t.usuarioAsignadoId !== a.id)
            fail(403, "El ticket corresponde a otro responsable.");
          if((action==='start'&&t.estadoId!==2)||(action==='resolve'&&t.estadoId!==3))fail(409,'El estado no permite esta acción.');
          if(action==='resolve'){
            const tags=ticketLabels.labels(t);
            if(!t.usuarioAsignadoId||!tags.length)fail(409,'Asigna al menos una etiqueta antes de resolver el ticket.');
            t.clasificacionCierre={clasificacionVersion:1,usuarioAsignadoId:t.usuarioAsignadoId,etiquetas:tags.map(tag=>({...tag,id:Number(tag.id)}))};t.fechaCierre=now();
          }
          t.estadoId = action === "start" ? 3 : 5;
          t.atendidoEn ??= now();
        } else if (action === "cancel") {
          if (!a.admin && t.usuarioCreadorId !== a.id)
            fail(403, "No puedes cancelar este ticket.");
          t.estadoId = 4;
        } else fail(501, "Acción no simulada.");
        t.version++;
        t.fechaActualizacion = now();
        s.ticketHistory.push({
          id: randomUUID(),
          ticketId: t.id,
          usuarioId: a.id,
          accion: action,
          valorAnterior: statuses[before.estadoId],
          valorNuevo: statuses[t.estadoId],
          fecha: now(),
        });
        audit(s, a, "tickets", String(t.id), action, before, t, body, proof);
        return { ...t, estado: t.estadoId };
      });
    }
    if (parts[0] === "requests") {
      requireAdmin(a);
      const r = get(s, a, "solicitudes", parts[1]);
      if (parts[2] === "preview") return requestPlan(s, r);
      return command(s, a, req, p, body, (proof) => {
        verifyVersion(r, body);
        const before = clone(r);
        if (parts[2] === "decision") {
          if (r.estado !== "PENDIENTE")
            fail(409, "La solicitud ya fue resuelta.");
          const d = r.datos;
          if (body.decision === "RECHAZAR") r.estado = "RECHAZADA";
          else if (d.tipo === "USUARIO_NUEVO")
            r.estado = "APROBADA_PENDIENTE_CUENTA";
          else {
            const u = s.users.find((x) => x.id === Number(d.usuarioDestinoId));
            if (!u) fail(400, "Usuario destino requerido.");
            if (d.perfilId) u.perfilId = Number(d.perfilId);
            u.roles = [
              ...new Set([...u.roles, ...(d.roles || []).map(Number)]),
            ];
            u.permisos = [
              ...new Set([...u.permisos, ...(d.permisos || []).map(Number)]),
            ];
            r.estado = "ATENDIDA";
            s.catalog.version++;
          }
        } else if (parts[2] === "provision") {
          if (r.estado !== "APROBADA_PENDIENTE_CUENTA")
            fail(409, "Primero aprueba la solicitud.");
          const id = Math.max(...s.users.map((u) => u.id)) + 1;
          s.users.push({
            id,
            nombre: r.nombre + " · cuenta ficticia",
            alias: "nuevo-" + id,
            email: r.datos.correo || "nuevo@laboratorio.invalid",
            mode: "USUARIO",
            rol: "USUARIO",
            equipoId: r.equipoId,
            perfilId: Number(r.datos.perfilId) || null,
            roles: [],
            permisos: [],
          });
          r.datos.usuarioCreadoId = id;
          r.estado = "ATENDIDA";
          r.invitacion = {
            estado: "SIMULADA_SIN_ENVIO",
            intentadoEn: null,
            enviadoEn: null,
          };
        } else fail(501, "Acción no simulada.");
        r.version++;
        audit(s, a, "solicitudes", r.id, parts[2], before, r, body, proof);
        return r;
      });
    }
    if (parts[0] === "files") {
      const f = s.files.find((f) => f.id === parts[1]);
      if (!f) fail(404, "Documento no encontrado.");
      get(s, a, f.tipo, f.registroId);
      return {
        binary: Buffer.from(f.base64, "base64"),
        mime: f.mime,
        nombre: f.nombre,
      };
    }
    if (parts[0] === "records") {
      const type = parts[1],
        id = parts[2],
        sub = parts[3],
        def = definitions[type];
      if (!def) fail(404, "Recurso no encontrado.");
      if (type === "dispositivos" && id === "layout")
        return command(s, a, req, p, body, (proof) => {
          for (const pos of body.placements || []) {
            const r = get(s, a, type, pos.id, "EDITAR");
            verifyVersion(r, pos);
            const before = clone(r);
            Object.assign(
              r.datos,
              pos.planoX !== undefined
                ? { planoX: pos.planoX, planoY: pos.planoY }
                : { x: pos.x, y: pos.y },
            );
            r.version++;
            audit(s, a, type, r.id, "POSICION", before, r, body, proof);
          }
          return {
            items: s.resources.dispositivos.filter((r) => visible(a, r)),
          };
        });
      if (sub === "history") {
        get(s, a, type, id);
        return s.audit.filter((r) => r.tipo === type && r.registroId === id);
      }
      if (sub === "files") {
        const row = get(s, a, type, id);
        if (req.method === "GET")
          return s.files
            .filter((f) => f.tipo === type && f.registroId === id)
            .map(({ base64, ...f }) => f);
        return command(s, a, req, p, body, (proof) => {
          if (!allowed(a, type, "EDITAR") && !allowed(a, type, "INSERTAR"))
            fail(403, "Sin permiso para adjuntar.");
          verifyVersion(row, body);
          if (
            !upload ||
            !["image/jpeg", "image/png", "application/pdf"].includes(
              upload.mime,
            ) ||
            upload.buffer.length > 2 * 1024 * 1024
          )
            fail(400, "El laboratorio admite PDF/JPEG/PNG de hasta 2 MB.");
          const digest = createHash("sha256")
            .update(upload.buffer)
            .digest("hex");
          if (
            body.data?.hash !== digest ||
            Number(body.data?.bytes) !== upload.buffer.length ||
            body.data?.mime !== upload.mime
          )
            fail(400, "El contenido no coincide con el documento confirmado.");
          const f = {
            id: randomUUID(),
            tipo: type,
            registroId: id,
            nombre: upload.nombre,
            mime: upload.mime,
            bytes: upload.buffer.length,
            fecha: now(),
            creadoEn: now(),
            base64: upload.buffer.toString("base64"),
          };
          s.files.push(f);
          audit(
            s,
            a,
            type,
            id,
            "ADJUNTAR",
            null,
            { nombre: f.nombre },
            body,
            proof,
          );
          return { id: f.id };
        });
      }
      if (req.method === "GET") {
        if (id) {
          const r = get(s, a, type, id);
          return { ...r, labels: labels(s, r) };
        }
        if (!allowed(a, type, "LEER")) fail(403, "Sin permiso para leer.");
        let items = s.resources[type].filter((r) => visible(a, r));
        const term = (q.get("q") || "").toLowerCase();
        if (term)
          items = items.filter((r) => r.nombre.toLowerCase().includes(term));
        if (q.get("equipoId"))
          items = items.filter((r) => r.equipoId === q.get("equipoId"));
        if (type === "actividades")
          items = items.filter(
            (r) =>
              (!q.get("desde") || r.datos.fin >= q.get("desde")) &&
              (!q.get("hasta") || r.datos.inicio < q.get("hasta")),
          );
        return page(items, q);
      }
      return command(s, a, req, p, body, (proof) => {
        const op =
          req.method === "DELETE" ? "ELIMINAR" : id ? "EDITAR" : "INSERTAR";
        if (!allowed(a, type, op))
          fail(403, "Sin permiso para " + op.toLowerCase() + ".");
        let r = id ? get(s, a, type, id, op) : null;
        const before = clone(r);
        if (r) verifyVersion(r, body);
        if (req.method === "DELETE") {
          r.eliminadoEn = now();
          r.version++;
          audit(s, a, type, id, "RETIRAR", before, r, body, proof);
          return { id, retirado: true };
        }
        const data = clone(body.data);
        validate(type, data);
        if (
          !a.admin &&
          (data.equipoId !== a.equipoId ||
            data.visibilidad === "EMPRESA" ||
            ((type === "actividades" || type === "solicitudes") && !manager(a)))
        )
          fail(403, "El registro está fuera del alcance de tu perfil.");
        if (type === "conexiones")
          for (const [nodeKey, portKey] of [
            ["origenId", "puertoOrigen"],
            ["destinoId", "puertoDestino"],
          ]) {
            const device = get(s, a, "dispositivos", data.datos[nodeKey]);
            const port = Number(data.datos[portKey]);
            if (port < 1 || port > Number(device.datos.puertos))
              fail(400, "Puerto fuera de rango.");
            if (
              s.resources.conexiones.some(
                (c) =>
                  !c.eliminadoEn &&
                  c.id !== id &&
                  [
                    ["origenId", "puertoOrigen"],
                    ["destinoId", "puertoDestino"],
                  ].some(
                    ([n, p]) =>
                      c.datos[n] === device.id && Number(c.datos[p]) === port,
                  ),
              )
            )
              fail(409, "Ese puerto ya está ocupado.");
          }
        if (type === "activos" || type === "dispositivos") {
          const num = data.datos.numeroInventario?.trim().toUpperCase();
          data.datos.numeroInventario = num;
          if (
            s.resources[type].some(
              (r) =>
                !r.eliminadoEn &&
                r.id !== id &&
                r.datos.numeroInventario === num,
            )
          )
            fail(409, "El número de inventario ya existe.");
        }
        if (!r) {
          r = {
            id: randomUUID(),
            usuarioId: a.id,
            creadoEn: now(),
            version: 0,
          };
          s.resources[type].unshift(r);
        }
        Object.assign(r, data, {
          id: r.id,
          usuarioId:
            type === "miembros" ? Number(data.datos.usuarioId) : r.usuarioId,
          version: r.version + 1,
          actualizadoEn: now(),
        });
        r.estado ??= type === "solicitudes" ? "PENDIENTE" : "ACTIVO";
        if (type === "movimientos-activos") {
          const target = get(s, a, "activos", r.datos.activoId),
            prior = clone(target);
          target.estado = {
            BAJA: "BAJA",
            SALIDA: "FUERA",
            RETORNO: "ACTIVO",
          }[r.datos.tipo];
          target.version++;
          audit(
            s,
            a,
            "activos",
            target.id,
            "MOVIMIENTO",
            prior,
            target,
            body,
            proof,
          );
        }
        audit(s, a, type, r.id, op, before, r, body, proof);
        return r;
      });
    }
    fail(
      501,
      "Esta operación está fuera del laboratorio. No se consultó un servicio externo.",
    );
  }
  function graphql(s, a, req, raw) {
    // Límite de servicios sustituible para recorridos de contratos de módulos.
    // Solo existe en este laboratorio de loopback; no forma parte del Panel.
    const custom = options.graphql?.({ state: s, actor: a, request: req, ...raw });
    if (custom !== undefined) return custom;
    const op = getOperationAST(parse(raw.query || ""));
    if (!op) fail(400, "Consulta inválida.");
    const fields = op.selectionSet.selections;
    if (op.operation === "mutation" && fields.length !== 1)
      fail(400, "Una acción por solicitud.");
    const out = {};
    for (const field of fields) {
      if (field.kind !== "Field") fail(501, "Fragmento no simulado.");
      const name = field.name.value,
        args = Object.fromEntries(
          (field.arguments || [])
            .filter((x) => x.name.value !== "files")
            .map((x) => [
              x.name.value,
              valueFromASTUntyped(x.value, raw.variables || {}),
            ]),
        );
      let result;
      const reads = {
        usuario: () => userProfile(a),
        perfilequipo: () => [
          { id_departamento: "1", nombre: "Equipo ficticio" },
        ],
        ticketCategories: () => [
          {
            id: "1",
            nombre: "Soporte local",
            descripcion: "Solo laboratorio",
            activo: 1,
          },
        ],
        ticketPriorities: () =>
          [1, 2, 3].map((id, i) => ({
            id: String(id),
            nombre: ["Baja", "Normal", "Alta"][i],
            nivel: id,
            color: "#4560ee",
          })),
        ticketStatuses: () =>
          statuses.slice(1).map((nombre, i) => ({
            id: String(i + 1),
            nombre,
            esFinal: i >= 3 ? 1 : 0,
          })),
        ticketTagCatalog: () => ticketLabels.catalog,
        ticketTags: () => ticketLabels.labels(s.tickets.find(t=>t.id===Number(args.ticketId))||{}),
        ticketAttachments: () => [],
        ticketComments: () =>
          s.comments.filter((r) => r.ticketId === Number(args.ticketId)),
        ticketMessages: () =>
          s.messages.filter((r) => r.ticketId === Number(args.ticketId)),
        ticketHistory: () =>
          s.ticketHistory.filter((r) => r.ticketId === Number(args.ticketId)),
        tickets: () =>
          s.tickets
            .filter((t) => canTicket(a, t, s))
            .map((t) => ticketDto(s, t)),
        ticket: () => {
          const t = s.tickets.find((t) => t.id === Number(args.id));
          if (!t || !canTicket(a, t, s)) fail(404, "Ticket no disponible.");
          return ticketDto(s, t);
        },
        myActivity: () => [],
        myStats: () => ({
          tickets: {
            ingresados: 0,
            resueltos: 0,
            cerrados: 0,
            asignados: 0,
          },
          vacaciones: { dias_disponibles: 0, dias_usados: 0 },
          zonas_a_cargo: [],
          grafico_mensual: [],
        }),
      };
      if (op.operation === "query") {
        if (!Object.hasOwn(reads, name))
          fail(501, "Consulta heredada no simulada: " + name);
        if (
          [
            "ticketComments",
            "ticketMessages",
            "ticketHistory",
            "ticketAttachments",
            "ticketTags",
          ].includes(name)
        ) {
          const t = s.tickets.find((t) => t.id === Number(args.ticketId));
          if (!t || !canTicket(a, t, s)) fail(404, "Ticket no disponible.");
        }
        result = reads[name]();
      } else {
        const body = {
          requestId: req.headers["x-ticket-request-id"],
          args,
        };
        result = command(
          s,
          a,
          { headers: req.headers, method: "POST" },
          "/graphql/" + name,
          body,
          (proof) => {
            const input = args.input || {};
            if (name === "createTicket") {
              if (!input.titulo || !input.descripcion)
                fail(400, "Completa el ticket.");
              if (
                input.usuarioAsignadoId &&
                (!a.admin || Number(input.usuarioAsignadoId) !== a.id)
              )
                fail(
                  400,
                  "Solo el administrador puede autoasignarse su propio ticket.",
                );
              const id = Math.max(0, ...s.tickets.map((t) => t.id)) + 1,
                t = {
                  ...input,
                  id,
                  codigo: "LAB-" + String(id).padStart(4, "0"),
                  usuarioCreadorId: a.id,
                  usuarioAsignadoId: input.usuarioAsignadoId
                    ? Number(input.usuarioAsignadoId)
                    : null,
                  estadoId: input.usuarioAsignadoId ? 2 : 1,
                  version: 1,
                  fechaCreacion: now(),
                  fechaActualizacion: now(),
                };
              s.tickets.unshift(t);
              audit(s, a, "tickets", String(id), "CREAR", null, t, body, proof);
              return {
                ticket: ticketDto(s, t),
                adjuntos: [],
                departamentoCreador: {
                  id_departamento: "1",
                  nombre: "Equipo ficticio",
                },
              };
            }
            if (name === "sendTicketMessage" || name === "addTicketComment") {
              const t = s.tickets.find((t) => t.id === Number(input.ticketId));
              if (!t || !canTicket(a, t, s)) fail(404, "Ticket no disponible.");
              const row =
                name === "sendTicketMessage"
                  ? {
                      ticketId: t.id,
                      usuario: a.id,
                      nombre_usuario: a.nombre,
                      fechaEnvio: now(),
                      textoMensaje: input.textoMensaje,
                      archivos: [],
                    }
                  : {
                      id: randomUUID(),
                      ticketId: t.id,
                      usuarioId: a.id,
                      comentario: input.comentario,
                      esInterno: 0,
                      fecha: now(),
                    };
              s[name === "sendTicketMessage" ? "messages" : "comments"].push(
                row,
              );
              audit(
                s,
                a,
                "tickets",
                String(t.id),
                name,
                null,
                row,
                body,
                proof,
              );
              return row;
            }
            fail(501, "Escritura heredada no simulada: " + name);
          },
        );
      }
      out[field.alias?.value || name] = result;
    }
    return { data: out };
  }
  const server = http.createServer(async (req, res) => {
    const reply = (value, status = 200) => {
      res.writeHead(status, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "X-Tickets-Laboratorio": "datos-ficticios",
      });
      res.end(JSON.stringify(value));
    };
    try {
      const url = new URL(req.url, "http://127.0.0.1");
      if (url.pathname === "/health")
        return reply({
          laboratorio: true,
          persistencia: "JSON local",
          usuarios: state.data.users.length,
        });
      const id = sessions.get(
          (req.headers.authorization || "").replace(/^Bearer\s+/i, ""),
        ),
        a = actor(state.data, typeof options.incident === 'function' && url.pathname === '/platform/integrations/panel-errors' && options.incidentToken && req.headers.authorization === 'Bearer '+options.incidentToken ? 1 : id);
      const injected = failures.find(
        (f) => f.restantes > 0 && url.pathname.startsWith(f.ruta),
      );
      if (injected) {
        injected.restantes--;
        fail(503, "Fallo simulado para comprobar el reintento.");
      }
      let buffer = Buffer.alloc(0);
      for await (const chunk of req) {
        buffer = Buffer.concat([buffer, chunk]);
        if (buffer.length > 3 * 1024 * 1024)
          fail(413, "Solicitud demasiado grande para el laboratorio.");
      }
      let body = {},
        upload;
      if ((req.headers["content-type"] || "").includes("multipart/form-data")) {
        const form = await new Request("http://127.0.0.1/", {
          method: "POST",
          headers: req.headers,
          body: buffer,
        }).formData();
        if (url.pathname === "/graphql") {
          if (
            [...form.values()].some(
              (value) => typeof value !== "string" && value.size > 0,
            )
          )
            fail(
              501,
              "Los adjuntos de tickets quedan fuera de este laboratorio; puedes probar documentos desde las fichas técnicas.",
            );
          body = JSON.parse(form.get("operations") || "{}");
        } else {
          body = JSON.parse(form.get("command") || "{}");
          const f = form.get("file");
          if (f && typeof f !== "string")
            upload = {
              nombre: f.name,
              mime: f.type,
              buffer: Buffer.from(await f.arrayBuffer()),
            };
        }
      } else if (buffer.length) body = JSON.parse(buffer.toString("utf8"));
      const fn = (s) =>
        typeof options.incident === 'function' && ['/platform/integrations/panel-errors','/platform/client-errors'].includes(url.pathname) ? options.incident(s,body,url.pathname) :
        url.pathname === "/graphql"
          ? graphql(s, a, req, body)
          : dispatch(s, a, req, url, body, upload);
      const mutates =
        !["GET", "HEAD"].includes(req.method) &&
        (url.pathname !== "/graphql" ||
          getOperationAST(parse(body.query || ""))?.operation === "mutation");
      const value = mutates ? await state.change(fn) : fn(state.data);
      if (value?.binary) {
        res.writeHead(200, {
          "Content-Type": value.mime,
          "Cache-Control": "no-store",
          "Content-Disposition":
            "attachment; filename*=UTF-8''" + encodeURIComponent(value.nombre),
          "X-Tickets-Laboratorio": "datos-ficticios",
        });
        return res.end(value.binary);
      }
      return reply(value);
    } catch (e) {
      return reply(
        {
          codigo:
            e.status === 409
              ? "CONFLICTO"
              : e.status === 403
                ? "SIN_PERMISO"
                : "LABORATORIO",
          message: e.status
            ? e.message
            : "No se pudo procesar la solicitud en el laboratorio.",
        },
        e.status || 500,
      );
    }
  });
  return { server, state, createSession, failures, sessions };
}
module.exports = { createLab, effective, actor, allowed, validate, hash };
