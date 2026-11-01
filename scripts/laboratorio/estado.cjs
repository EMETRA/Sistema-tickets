// Datos exclusivamente ficticios. Este adaptador no sustituye Oracle ni la autorización del API.
const { randomUUID } = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const definitions = require("../../test/fixtures/platform-definitions.json");
const clone = (value) => structuredClone(value);
const now = () => new Date().toISOString();
const operations = ["LEER", "INSERTAR", "EDITAR", "ELIMINAR"];
function seed() {
  const ids = Object.fromEntries(
    [
      "it",
      "finanzas",
      "sitio",
      "activo",
      "switch",
      "router",
      "enlace",
      "app",
      "repo",
      "servidor",
      "esquema",
    ].map((k) => [k, randomUUID()]),
  );
  const permissions = [
    ...new Set([
      "TICKETS_ADMINISTRAR",
      "TICKETS_ASIGNAR",
      "TICKETS_ATENDER",
      "TICKETS_AUDITORIA_LEER",
      "TICKETS_LOGS_LEER",
      "TICKETS_METRICAS_EQUIPO",
      ...Object.values(definitions).flatMap((d) =>
        operations.map((o) => d.permission + "_" + o),
      ),
    ]),
  ].map((nombre, i) => ({
    id: i + 1,
    nombre,
    descripcion: nombre.replaceAll("_", " "),
  }));
  const people = [
    [
      "admin",
      "Administración ficticia",
      "ADMINISTRADOR",
      "ADMINISTRADOR",
      ids.it,
    ],
    ["secretaria", "Secretaría ficticia", "ASIGNACION", "USUARIO", ids.it],
    [
      "jefatura",
      "Jefatura ficticia de Contabilidad",
      "JEFATURA",
      "USUARIO",
      ids.finanzas,
    ],
    ["tecnico", "Técnico ficticio", "TECNICO", "TECNICO", ids.it],
    [
      "desarrollador",
      "Desarrolladora ficticia",
      "DESARROLLADOR",
      "DESARROLLADOR",
      ids.it,
    ],
    ["devops", "Operación ficticia", "DEVOPS", "TECNICO", ids.it],
    [
      "usuario",
      "Analista ficticio de Contabilidad",
      "USUARIO",
      "USUARIO",
      ids.finanzas,
    ],
  ];
  const users = people.map(([alias, nombre, mode, rol, equipoId], i) => ({
    id: i + 1,
    alias,
    nombre,
    mode,
    rol,
    equipoId,
    email: alias + "@laboratorio.invalid",
    perfilId: i + 1,
    roles: [],
    permisos: [],
  }));
  const catalog = {
    version: 1,
    profiles: users.map((u) => ({
      id: u.id,
      nombre: "Perfil local: " + u.alias,
      descripcion: "Solo laboratorio",
    })),
    roles: users.map((u) => ({
      id: u.id,
      nombre: "Rol local: " + u.alias,
      descripcion: "Solo laboratorio",
    })),
    permissions,
    profileRoles: users.map((u) => ({ perfilId: u.id, rolId: u.id })),
    rolePermissions: [],
  };
  for (const u of users) {
    const allowed = (p) =>
      u.mode === "ADMINISTRADOR"
        ? true
        : p === "TICKETS_ATENDER"
          ? ["TECNICO", "DESARROLLADOR", "DEVOPS"].includes(u.mode)
          : p === "TICKETS_ASIGNAR"
            ? u.mode === "ASIGNACION"
            : p === "TICKETS_LOGS_LEER"
              ? u.mode === "DEVOPS"
              : p === "TICKETS_METRICAS_EQUIPO"
                ? u.mode === "JEFATURA"
                : p === "TICKETS_AUDITORIA_LEER"
                  ? false
                  : u.mode === "JEFATURA"
                    ? /^TICKETS_(ACTIVIDADES|SOLICITUDES)_/.test(p)
                    : u.mode === "TECNICO"
                      ? /^TICKETS_(INSTALACIONES|ACTIVOS|INTERVENCIONES|MOVIMIENTOS|DISPOSITIVOS|CONEXIONES)_/.test(
                          p,
                        )
                      : ["DESARROLLADOR", "DEVOPS"].includes(u.mode)
                        ? /^TICKETS_(APLICACIONES|REPOSITORIOS|DESPLIEGUES|INCIDENCIAS|SERVIDORES|CONTENEDORES|ESQUEMAS)_/.test(
                            p,
                          )
                        : false;
    catalog.rolePermissions.push(
      ...permissions
        .filter((p) => allowed(p.nombre))
        .map((p) => ({ rolId: u.id, permisoId: p.id })),
    );
  }
  const resources = Object.fromEntries(
    Object.keys(definitions).map((k) => [k, []]),
  );
  const rec = (type, id, nombre, datos = {}, extra = {}) => {
    const row = {
      id,
      nombre,
      equipoId: ids.it,
      usuarioId: 1,
      visibilidad: "EQUIPO",
      estado: "ACTIVO",
      version: 1,
      creadoEn: now(),
      actualizadoEn: now(),
      datos,
      ...extra,
    };
    resources[type].push(row);
    return row;
  };
  rec("equipos", ids.it, "Informática · ficticio", {
    informatica: true,
    minutosAlerta: 60,
  });
  rec("equipos", ids.finanzas, "Contabilidad · ficticio", {
    informatica: false,
    minutosAlerta: 60,
  });
  for (const u of users)
    rec(
      "miembros",
      randomUUID(),
      u.nombre,
      {
        usuarioId: u.id,
        funcion:
          u.mode === "ADMINISTRADOR"
            ? "JEFATURA"
            : u.mode === "ASIGNACION"
              ? "ASIGNADOR"
              : u.mode === "USUARIO"
                ? "MIEMBRO"
                : u.mode,
      },
      { usuarioId: u.id, equipoId: u.equipoId },
    );
  rec("instalaciones", ids.sitio, "Edificio de prueba · Nivel 1", {
    direccion: "Dirección ficticia",
    nivel: "1",
    responsableId: 4,
  });
  rec("activos", ids.activo, "Computadora ficticia de soporte", {
    numeroInventario: "LAB-001",
    clase: "COMPUTADORA",
    marca: "Equipo de prueba",
    modelo: "Local",
    serie: "FICTICIA-001",
    instalacionId: ids.sitio,
    responsableId: 4,
  });
  rec("dispositivos", ids.switch, "Switch de prueba", {
    clase: "SWITCH",
    numeroInventario: "LAB-RED-001",
    puertos: 24,
    instalacionId: ids.sitio,
    x: 180,
    y: 160,
    planoX: 180,
    planoY: 160,
    responsableId: 4,
    ultimaRevision: new Date().toISOString().slice(0, 10),
  });
  rec("dispositivos", ids.router, "Router de prueba", {
    clase: "ROUTER",
    numeroInventario: "LAB-RED-002",
    puertos: 4,
    instalacionId: ids.sitio,
    x: 500,
    y: 220,
    planoX: 500,
    planoY: 220,
    responsableId: 4,
  });
  rec("conexiones", ids.enlace, "Enlace ficticio", {
    origenId: ids.switch,
    puertoOrigen: 1,
    destinoId: ids.router,
    puertoDestino: 1,
    medio: "UTP",
  });
  rec("servidores", ids.servidor, "Servidor simulado", {
    identificador: "servidor-local-ficticio",
    entorno: "QA",
    responsableId: 6,
  });
  rec("aplicaciones", ids.app, "Contabilidad de prueba", {
    codigo: "CONTABILIDAD_LAB",
    responsableId: 5,
    servidorId: ids.servidor,
    operacionesMetricas: "RECIBO_REVISADO,RECIBO_GRABADO",
    frontUrl: "http://127.0.0.1:3030",
    backUrl: "http://127.0.0.1:3032",
  });
  rec("repositorios", ids.repo, "Repositorio ficticio", {
    aplicacionId: ids.app,
    url: "https://example.invalid/repositorio-ficticio",
    rama: "pruebas",
    componente: "BACK",
  });
  rec("esquemas", ids.esquema, "Esquema ficticio", {
    owner: "ADMEMETRAINFORMATICA",
    aplicacionId: ids.app,
  });
  rec("contenedores", randomUUID(), "Contenedor ficticio", {
    servidorId: ids.servidor,
    identificador: "servicio-ficticio",
    aplicacionId: ids.app,
  });
  rec(
    "incidencias",
    randomUUID(),
    "Error de prueba con contexto",
    {
      aplicacionId: ids.app,
      severidad: "MEDIA",
      detalle: "Incidente ficticio para revisar el flujo.",
    },
    { estado: "ABIERTO" },
  );
  rec("despliegues", randomUUID(), "Despliegue ficticio", {
    aplicacionId: ids.app,
    repositorioId: ids.repo,
    revision: "lab-1",
    fecha: now(),
    entorno: "QA",
    resultado: "CORRECTO",
  });
  rec("intervenciones", randomUUID(), "Mantenimiento ficticio", {
    activoId: ids.activo,
    instalacionId: ids.sitio,
    tipo: "PREVENTIVO",
    fecha: now(),
    detalle: "Revisión ficticia de equipo.",
    responsableId: 4,
  });
  for (const [nombre, visibilidad, equipoId, usuarioId] of [
    ["Actividad general ficticia", "EMPRESA", ids.it, 1],
    ["Actividad de Contabilidad ficticia", "EQUIPO", ids.finanzas, 3],
    ["Actividad privada de ejemplo", "PRIVADA", ids.finanzas, 3],
  ])
    rec(
      "actividades",
      randomUUID(),
      nombre,
      {
        inicio: now(),
        fin: new Date(Date.now() + 3600000).toISOString(),
        lugar: "Sala ficticia",
        descripcion: "Solo datos de laboratorio",
      },
      { visibilidad, equipoId, usuarioId },
    );
  const tickets = [
    {
      id: 1,
      titulo: "Impresora de prueba sin conexión",
      usuarioCreadorId: 7,
      usuarioAsignadoId: null,
      estadoId: 1,
    },
    {
      id: 2,
      titulo: "Revisión ficticia de computadora",
      usuarioCreadorId: 7,
      usuarioAsignadoId: 4,
      estadoId: 2,
    },
    {
      id: 3,
      titulo: "Error de prueba en aplicación",
      usuarioCreadorId: 3,
      usuarioAsignadoId: 5,
      estadoId: 3,
    },
  ].map((t) => ({
    ...t,
    codigo: "LAB-" + String(t.id).padStart(4, "0"),
    descripcion: "Ticket ficticio. Puedes modificarlo para recorrer el flujo.",
    categoriaId: 1,
    prioridadId: 2,
    tiempoEstimado: 30,
    version: 1,
    fechaCreacion: now(),
    fechaActualizacion: now(),
    asignadoEn: t.usuarioAsignadoId
      ? new Date(Date.now() - 7200000).toISOString()
      : null,
    atendidoEn: t.estadoId === 3 ? now() : null,
  }));
  return {
    format: 1,
    ids,
    users,
    catalog,
    resources,
    tickets,
    files: [],
    audit: [],
    commands: {},
    confirmations: {},
    messages: [],
    comments: [],
    ticketHistory: [],
    events: [
      {
        id: randomUUID(),
        aplicacionId: ids.app,
        aplicacionNombre: "Contabilidad de prueba",
        usuarioId: 7,
        equipoId: ids.finanzas,
        operacion: "RECIBO_REVISADO",
        recurso: "FICTICIO-001",
        cantidad: 1,
        fecha: now(),
      },
      {
        id: randomUUID(),
        aplicacionId: ids.app,
        aplicacionNombre: "Contabilidad de prueba",
        usuarioId: 7,
        equipoId: ids.finanzas,
        operacion: "RECIBO_GRABADO",
        recurso: "FICTICIO-002",
        cantidad: 1,
        fecha: now(),
      },
    ],
  };
}
class State {
  constructor(file) {
    this.file = file;
    this.pending = Promise.resolve();
  }
  async open() {
    try {
      this.data = JSON.parse(await fs.readFile(this.file, "utf8"));
      if (this.data.format !== 1)
        throw Error(
          "Versión de estado no compatible; conserva el archivo y revisa la guía.",
        );
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
      this.data = seed();
      await this.save();
    }
    return this;
  }
  async save() {
    await fs.mkdir(path.dirname(this.file), { recursive: true, mode: 0o700 });
    await fs.writeFile(this.file + ".tmp", JSON.stringify(this.data), {
      mode: 0o600,
    });
    await fs.rename(this.file + ".tmp", this.file);
  }
  change(fn) {
    const task = this.pending.then(async () => {
      const before = clone(this.data);
      try {
        const result = await fn(this.data);
        await this.save();
        return clone(result);
      } catch (e) {
        this.data = before;
        throw e;
      }
    });
    this.pending = task.catch(() => {});
    return task;
  }
  reset() {
    return this.change(() => {
      this.data = seed();
      return { reiniciado: true };
    });
  }
}
module.exports = { State, seed, definitions, clone, now };
