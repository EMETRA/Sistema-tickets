// Activos de ejemplo para el laboratorio: fichas, mantenimientos, ubicaciones,
// movimientos y una simulación de Activos Fijos. Todo es ficticio y solo se
// activa desde «Cambiar perfil / controles»; el laboratorio por defecto no cambia.
const { randomUUID } = require("node:crypto");

const DAY = 86400000;
const iso = (days) => new Date(Date.now() + days * DAY).toISOString();
const day = (days) => iso(days).slice(0, 10);

// Bienes en Activos Fijos (origen oficial). fichaId se completa al sembrar.
const SOURCE = [
  ["61148", "1802", 9000101, "Personal ficticio de ventanilla", "Computadora de ventanilla 2", "DEM-0148", "ThinkCentre M70", "COMPUTADORA"],
  ["61147", "1803", 9000102, "Coordinación ficticia", "Portátil de coordinación", "DEM-0147", "Latitude 5450", "PORTATIL"],
  ["61146", "1804", 9000103, "Recepción ficticia", "Impresora de recepción", "DEM-0146", "LaserJet Pro", "IMPRESORA"],
  ["61145", "1805", 9000104, "Mesa de ayuda ficticia", "Monitor de mesa de ayuda", "DEM-0145", "P24h", null],
  ["61144", "1806", 9000101, "Personal ficticio de ventanilla", "Computadora de ventanilla 1", "DEM-0144", "ThinkCentre M70", "COMPUTADORA"],
  ["61143", "1807", 9000105, "Archivo ficticio", "Escáner de archivo", "DEM-0143", "ScanJet 3000", null],
  ["61142", "1808", 9000106, "Informática ficticia", "Servidor de respaldo", "DEM-0142", "PowerEdge T150", "SERVIDOR"],
  ["61141", "1809", 9000102, "Coordinación ficticia", "Impresora de coordinación", "DEM-0141", "LaserJet M404", "IMPRESORA"],
];

function seedAssets(s, ids) {
  if (s.assetExample) return;
  const rows = { activos: [], intervenciones: [], instalaciones: [], "movimientos-activos": [], dispositivos: [], conexiones: [], servidores: [], aplicaciones: [], repositorios: [], despliegues: [], incidencias: [], esquemas: [], actividades: [] };
  const rec = (type, nombre, datos, extra = {}) => {
    const row = {
      id: randomUUID(),
      nombre,
      equipoId: ids.it,
      usuarioId: 1,
      visibilidad: "EQUIPO",
      estado: "ACTIVO",
      version: 1,
      creadoEn: iso(-40),
      actualizadoEn: iso(-2),
      datos,
      ejemploActivos: true,
      ...extra,
    };
    s.resources[type].push(row);
    rows[type].push(row);
    return row;
  };
  const sede = rec("instalaciones", "Sede central · Nivel 2", { direccion: "Dirección ficticia, zona 1", nivel: "2", responsableId: 4 });
  const ventanillas = rec("instalaciones", "Agencia de ventanillas · Nivel 1", { direccion: "Dirección ficticia, zona 4", nivel: "1", responsableId: 4 });
  const fichas = {};
  for (const [numero, , , , descripcion, serie, modelo, clase] of SOURCE.slice(0, 5)) {
    if (!clase) continue;
    fichas[numero] = rec("activos", descripcion, {
      numeroInventario: numero,
      clase,
      marca: modelo.split(" ")[0],
      modelo,
      serie,
      instalacionId: numero === "61147" ? sede.id : ventanillas.id,
      responsableId: 4,
      detalle: "Ficha técnica de ejemplo.",
    });
  }
  fichas["61142"] = rec("activos", "Servidor de respaldo", {
    numeroInventario: "61142", clase: "SERVIDOR", marca: "PowerEdge", modelo: "PowerEdge T150", serie: "DEM-0142",
    instalacionId: sede.id, responsableId: 6, detalle: "Respaldo nocturno de archivos.",
  });
  s.assetFichas = Object.fromEntries(Object.entries(fichas).map(([n, r]) => [n, r.id]));
  const work = [
    ["Limpieza y revisión preventiva", "PREVENTIVO", "61148", -60, -30],
    ["Cambio de fusor", "CORRECTIVO", "61146", -12, 20],
    ["Visita técnica por lentitud", "VISITA_TECNICA", "61147", -3, 45],
    ["Revisión de baterías UPS", "PREVENTIVO", "61142", -95, -5],
    ["Actualización de firmware", "PREVENTIVO", "61144", -20, 10],
    ["Reemplazo de disco", "CORRECTIVO", "61142", -1, 90],
  ];
  for (const [nombre, tipo, numero, fecha, proxima] of work)
    rec("intervenciones", nombre, {
      tipo,
      activoId: fichas[numero]?.id,
      instalacionId: numero === "61147" || numero === "61142" ? sede.id : ventanillas.id,
      fecha: iso(fecha),
      responsableId: 4,
      detalle: "Trabajo de ejemplo registrado en el laboratorio.",
      proximaRevision: day(proxima),
    }, { creadoEn: iso(fecha), actualizadoEn: iso(fecha) });
  rec("movimientos-activos", "Traslado a coordinación", {
    tipo: "SALIDA", activoId: fichas["61147"].id, fecha: iso(-8), destino: "Sede central · Nivel 2", motivo: "Reasignación de puesto.", referencia: "OF-118",
  });
  rec("movimientos-activos", "Baja de monitor dañado", {
    tipo: "BAJA", activoId: fichas["61148"].id, fecha: iso(-25), destino: "Bodega", motivo: "Pantalla dañada sin reparación.", referencia: "OF-097",
  });
  // Red de ejemplo en la sede central: núcleo, acceso, router, puntos de acceso y panel.
  const dev = (nombre, clase, numero, puertos, x, y, planoX, planoY, revision) =>
    rec("dispositivos", nombre, {
      clase, numeroInventario: numero, instalacionId: sede.id, puertos, x, y, planoX, planoY,
      direccion: clase === "EQUIPO" ? "" : "10.10.2." + Math.round(x / 10), ultimaRevision: day(revision),
    });
  const router = dev("Router de borde", "ROUTER", "61201", 8, 540, 40, 560, 90, -40);
  const core = dev("Switch núcleo", "SWITCH", "61202", 48, 540, 200, 560, 260, -20);
  const accA = dev("Switch acceso · Ala norte", "SWITCH", "61203", 24, 240, 380, 220, 420, -200);
  const accB = dev("Switch acceso · Ala sur", "SWITCH", "61204", 24, 840, 380, 880, 420, -15);
  const panel = dev("Panel de parcheo A", "PANEL", "61205", 24, 240, 540, 200, 600, -60);
  const ap1 = dev("Punto de acceso · Recepción", "ACCESS_POINT", "61206", 1, 720, 560, 760, 610, -10);
  const ap2 = dev("Punto de acceso · Sala de juntas", "ACCESS_POINT", "61207", 1, 960, 560, 1000, 610, -230);
  const srv = dev("Servidor de respaldo", "EQUIPO", "61142", 2, 380, 120, 360, 160, -5);
  const link = (nombre, a, pa, b, pb, medio, estado = "ACTIVO") =>
    rec("conexiones", nombre, { origenId: a.id, puertoOrigen: pa, destinoId: b.id, puertoDestino: pb, medio, detalle: "Enlace de ejemplo." }, { estado });
  link("Enlace de salida", router, 2, core, 1, "FIBRA");
  link("Troncal ala norte", core, 2, accA, 24, "FIBRA");
  link("Troncal ala sur", core, 3, accB, 24, "FIBRA");
  link("Respaldo a núcleo", srv, 1, core, 10, "UTP");
  link("Panel A", accA, 1, panel, 1, "UTP");
  for (let p = 2; p <= 9; p++) link("Puesto " + p, accA, p, panel, p, "UTP");
  // Portafolio de sistemas de ejemplo: los sistemas migrados al panel y su operación.
  const prod = rec("servidores", "Servidor de aplicaciones · Producción", { identificador: "app-prod-ficticio", entorno: "PRODUCCION", responsableId: 6 });
  const app = (nombre, codigo, responsableId, servidorId, descripcion) =>
    rec("aplicaciones", nombre, {
      codigo, responsableId, servidorId, descripcion,
      frontUrl: "https://" + codigo.toLowerCase().replaceAll("_", "-") + ".ejemplo.invalid",
      backUrl: "https://api-" + codigo.toLowerCase().replaceAll("_", "-") + ".ejemplo.invalid",
    });
  const tickets = app("Sistema Tickets", "TICKETS", 5, prod.id, "Panel institucional: soporte, aplicaciones e Informática.");
  const recaudacion = app("Recaudación", "RECAUDACION", 5, prod.id, "Cobro de multas y cierre de caja.");
  const personal = app("Gestión de personal", "RRHH", 1, ids.servidor, "Expedientes, campañas y entregas de RRHH.");
  const juzgado = app("Consulta de casos", "JUZGADO", 5, prod.id, "Consulta y reimpresión de boletas del Juzgado.");
  const financiero = app("Reportes financieros", "FINANCIERO", 1, ids.servidor, "Recibos y tickets anulados.");
  const repo = (a, nombre, componente) =>
    rec("repositorios", nombre, { aplicacionId: a.id, url: "https://example.invalid/emetra/" + nombre, rama: "main", componente });
  const repos = {};
  for (const [a, base] of [[tickets, "sistema-tickets"], [recaudacion, "recaudacion"], [personal, "gestion-personal"], [juzgado, "consulta-casos"], [financiero, "reportes-financieros"]]) {
    repos[a.id] = [repo(a, base + "-web", "FRONT"), repo(a, base + "-api", "BACK")];
  }
  const deploy = (a, revision, entorno, dias, resultado) =>
    rec("despliegues", `${a.nombre} ${revision}`, {
      aplicacionId: a.id, repositorioId: repos[a.id][1].id, revision, entorno, fecha: iso(dias), resultado,
      detalle: "Despliegue de ejemplo.",
    }, { creadoEn: iso(dias), actualizadoEn: iso(dias) });
  deploy(tickets, "v2.8.0", "PRODUCCION", -6, "CORRECTO");
  deploy(tickets, "v2.9.0-rc1", "QA", -1, "CORRECTO");
  deploy(recaudacion, "v4.2.1", "PRODUCCION", -14, "CORRECTO");
  deploy(recaudacion, "v4.3.0", "PRODUCCION", -2, "REVERTIDO");
  deploy(recaudacion, "v4.3.0", "QA", -4, "CORRECTO");
  deploy(personal, "v1.12.0", "PRODUCCION", -30, "CORRECTO");
  deploy(personal, "v1.13.0", "QA", -3, "FALLIDO");
  deploy(juzgado, "v3.0.4", "PRODUCCION", -9, "CORRECTO");
  deploy(financiero, "v0.9.2", "PRODUCCION", -60, "CORRECTO");
  const incident = (a, nombre, severidad, estado, dias, ticketId) =>
    rec("incidencias", nombre, { aplicacionId: a.id, severidad, detalle: "Incidente de ejemplo.", ticketId, referencia: "INC-" + Math.abs(dias) }, { estado, creadoEn: iso(dias), actualizadoEn: iso(dias) });
  incident(recaudacion, "Cierre de caja duplica recibos tras v4.3.0", "CRITICA", "ACTIVO", -2, 148);
  incident(recaudacion, "Lentitud al consultar multas por placa", "MEDIA", "ACTIVO", -7);
  incident(personal, "Error al generar reporte de campañas", "ALTA", "ACTIVO", -3, 146);
  incident(tickets, "Adjuntos grandes tardan en cargar", "BAJA", "ACTIVO", -10);
  incident(juzgado, "Reimpresión sin logotipo", "MEDIA", "INACTIVO", -20);
  rec("esquemas", "Esquema de Recaudación", { owner: "RECAUDA", aplicacionId: recaudacion.id, descripcion: "Multas, recibos y caja." });
  // Agenda de ejemplo de Informática (hora de Guatemala, alrededor de hoy).
  const gtDay = (offset) => new Date(Date.now() - 6 * 3600000 + offset * DAY).toISOString().slice(0, 10);
  const at = (offset, h, m = 0) => new Date(`${gtDay(offset)}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00-06:00`).toISOString();
  const act = (nombre, offset, h, m, minutos, visibilidad, lugar, equipoId = ids.it, usuarioId = 1, participantes) =>
    rec("actividades", nombre, { inicio: at(offset, h, m), fin: new Date(Date.parse(at(offset, h, m)) + minutos * 60000).toISOString(), lugar, descripcion: "Actividad de ejemplo.", ...(participantes ? { participantes } : {}) }, { visibilidad, equipoId, usuarioId });
  const team = s.users.filter((u) => u.equipoId === ids.it).map((u) => u.id).slice(0, 4);
  // Reuniones virtuales de ejemplo: el enlace va en «lugar» (sin cambiar el esquema).
  act("Reunión virtual con Financiero", 0, 15, 0, 45, "EQUIPO", "https://teams.microsoft.com/l/meetup-join/ejemplo-financiero", ids.it, 1, team);
  act("Seguimiento con Recaudación", 2, 11, 0, 45, "EQUIPO", "Sala de juntas · https://meet.google.com/abc-defg-hij", ids.it, 1, team.slice(0, 2));
  act("Revisión diaria de la mesa de servicio", 0, 8, 0, 30, "EQUIPO", "Sala de Informática");
  act("Comité de cambios", 0, 10, 30, 60, "EQUIPO", "Sala de juntas");
  act("Ventana de despliegue · Recaudación v4.3.1", 0, 18, 0, 90, "EMPRESA", "Remoto");
  act("Revisión diaria de la mesa de servicio", 1, 8, 0, 30, "EQUIPO", "Sala de Informática");
  act("Capacitación: nuevo Panel institucional", 1, 14, 0, 120, "EMPRESA", "Auditorio");
  act("Mantenimiento de red · Ala norte", 2, 7, 0, 120, "EMPRESA", "Sede central · Nivel 2");
  act("Preparar informe mensual", 3, 9, 0, 120, "PRIVADA", "Escritorio");
  act("Revisión de accesos pendientes", -1, 15, 0, 60, "EQUIPO", "Sala de Informática");
  act("Cierre de caja asistido", -2, 16, 0, 60, "EMPRESA", "Agencia de ventanillas");
  rec("esquemas", "Esquema de Tickets", { owner: "ADMEMETRAIT", aplicacionId: tickets.id, descripcion: "Tickets y panel." });
  link("AP recepción", accB, 1, ap1, 1, "UTP");
  link("AP sala de juntas", accB, 2, ap2, 1, "UTP", "INACTIVO");
  s.assetExample = true;
}

function removeAssets(s) {
  for (const type of ["activos", "intervenciones", "instalaciones", "movimientos-activos", "dispositivos", "conexiones", "servidores", "aplicaciones", "repositorios", "despliegues", "incidencias", "esquemas", "actividades"])
    s.resources[type] = s.resources[type].filter((r) => !r.ejemploActivos);
  delete s.assetFichas;
  s.assetExample = false;
}

/** Respuesta simulada de Activos Fijos con el mismo contrato que el Panel consume. */
function inventory(s, q) {
  const text = (q.get("q") || "").toLowerCase();
  const items = SOURCE.map(([numero, tarjeta, empleado, nombre, descripcion, serie, modelo]) => ({
    referencia: `97:97:${tarjeta}:${numero}`,
    numeroInventario: numero,
    tarjeta,
    empleado,
    nombreEmpleado: nombre,
    descripcion,
    serie,
    modelo,
    entrada: Number(numero) - 61000,
    fichaCompleta: numero !== "61145",
    fichaId: s.assetFichas?.[numero] || null,
  })).filter(
    (i) =>
      (!q.get("numero") || i.numeroInventario.includes(q.get("numero"))) &&
      (!q.get("tarjeta") || i.tarjeta.includes(q.get("tarjeta"))) &&
      (!q.get("empleado") || String(i.empleado) === q.get("empleado")) &&
      (!text || `${i.descripcion} ${i.serie} ${i.modelo}`.toLowerCase().includes(text)),
  );
  return { items, hayMas: false };
}

// Personal de RRHH adicional (sin cuenta en el panel o sin unidad) para el directorio.
function people() {
  const row = (empleado, nombre, puesto, unidadCodigo, unidad, cuentas = 0) => ({
    empresa: 97, empleado, nombre, puesto, unidadCodigo, unidad, sinUnidad: !unidad, cuentasHabilitadas: cuentas, usuariosIds: [],
  });
  return [
    row(9000101, "Personal ficticio de ventanilla", "Cajero", 3, "Recaudación ficticia"),
    row(9000102, "Coordinación ficticia", "Coordinador de agencias", 3, "Recaudación ficticia"),
    row(9000103, "Recepción ficticia", "Recepcionista", 4, "Atención al vecino ficticia"),
    row(9000104, "Mesa de ayuda ficticia", "Auxiliar de soporte", 1, "Informática ficticia"),
    row(9000105, "Archivo ficticio", "Archivista", null, null),
    row(9000106, "Operación de respaldo ficticia", "Operador de centro de datos", 1, "Informática ficticia"),
    row(9000107, "Juez ficticio de asuntos municipales", "Juez", 5, "Juzgado ficticio"),
    row(9000108, "Secretaría ficticia del juzgado", "Secretaria", 5, "Juzgado ficticio"),
    row(9000109, "Notificador ficticio", "Notificador", 5, "Juzgado ficticio"),
    row(9000110, "Analista ficticia de cobro", "Analista", 3, "Recaudación ficticia"),
  ];
}

module.exports = { seedAssets, removeAssets, inventory, people };
