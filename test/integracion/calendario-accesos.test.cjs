const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const load = require("./load-ts.cjs")(path.resolve(__dirname, "../.."));
const c = load("src/platform/calendar.ts");
const access = load("src/platform/access-navigation.ts");
const activity = (id, inicio, fin, extra = {}) => ({
  id,
  nombre: id,
  equipoId: "equipo",
  usuarioId: 1,
  visibilidad: "EQUIPO",
  estado: "ACTIVO",
  version: 1,
  creadoEn: inicio,
  actualizadoEn: inicio,
  datos: { inicio, fin },
  ...extra,
});

test("la semana empieza en lunes y consulta siete días completos en Guatemala", () => {
  assert.equal(c.startOfCalendarWeek("2026-11-08"), "2026-11-02");
  assert.deepEqual(c.calendarPeriod("2026-11-05", "week"), {
    first: "2026-11-02",
    until: "2026-11-09",
    from: "2026-11-02T06:00:00.000Z",
    to: "2026-11-09T06:00:00.000Z",
  });
  assert.equal(c.weekDays("2026-11-05")[6], "2026-11-08");
});
test("navegar por semanas conserva el día y cruza año sin depender de la zona del navegador", () => {
  assert.equal(c.moveCalendar("2026-12-31", "week", 1), "2027-01-07");
  assert.equal(c.moveCalendar("2027-01-01", "agenda", -1), "2026-12-25");
});
test("navegar meses desde un día 31 no salta febrero y conserva su último día en el rango", () => {
  assert.equal(c.moveCalendar("2026-01-31", "month", 1), "2026-02-01");
  assert.equal(
    c.calendarPeriod("2028-02-15", "month").to,
    "2028-03-01T06:00:00.000Z",
  );
  assert.equal(c.monthCells("2028-02-01").filter(Boolean).length, 29);
  assert.equal(c.monthCells("2026-11-01")[6], "2026-11-01");
});
test("una actividad que termina a medianoche no ocupa el día siguiente", () => {
  const row = activity(
    "medianoche",
    "2026-11-05T23:00:00-06:00",
    "2026-11-06T00:00:00-06:00",
  );
  assert.equal(c.activitiesForDay([row], "2026-11-05").length, 1);
  assert.equal(c.activitiesForDay([row], "2026-11-06").length, 0);
});
test("una actividad de varios días aparece en cada día que realmente intersecta", () => {
  const row = activity(
    "varios",
    "2026-11-05T18:00:00-06:00",
    "2026-11-07T09:00:00-06:00",
  );
  assert.equal(c.activitiesForDay([row], "2026-11-04").length, 0);
  for (const day of ["2026-11-05", "2026-11-06", "2026-11-07"])
    assert.equal(c.activitiesForDay([row], day)[0].multipleDays, true);
  assert.equal(c.activitiesForDay([row], "2026-11-08").length, 0);
});
test("fechas inválidas y actividades canceladas no rompen ni contaminan el calendario", () => {
  const rows = [
    activity("invalida", "no-fecha", "otra"),
    activity("invertida", "2026-11-05T18:00:00Z", "2026-11-05T17:00:00Z"),
    activity("cancelada", "2026-11-05T15:00:00Z", "2026-11-05T16:00:00Z", {
      estado: "CANCELADO",
    }),
  ];
  assert.deepEqual(c.activitiesForDay(rows, "2026-11-05"), []);
});
test("las actividades simultáneas se distribuyen en columnas y las posteriores recuperan el ancho", () => {
  const items = [
    { record: { id: "A" }, start: 540, end: 720 },
    { record: { id: "B" }, start: 570, end: 660 },
    { record: { id: "C" }, start: 630, end: 780 },
    { record: { id: "D" }, start: 840, end: 900 },
  ];
  const placed = c.placeActivities(items);
  assert.deepEqual(
    placed.map((item) => item.lanes),
    [3, 3, 3, 1],
  );
  assert.equal(new Set(placed.slice(0, 3).map((item) => item.lane)).size, 3);
});
test("la altura mínima legible también evita tapar actividades muy cortas", () => {
  const placed = c.placeActivities([
    { start: 540, end: 545, record: { id: "A" } },
    { start: 550, end: 555, record: { id: "B" } },
  ]);
  assert.deepEqual(
    placed.map((item) => item.lanes),
    [2, 2],
  );
});
test("el horario se amplía para citas tempranas o nocturnas y no se estira por las de varios días", () => {
  assert.deepEqual(c.activityHours([]), { first: 9, last: 17 });
  assert.deepEqual(
    c.activityHours([
      { start: 480, end: 1170 },
      { start: 0, end: 1440, multipleDays: true },
    ]),
    { first: 8, last: 20 },
  );
});
test("las etiquetas horarias y ámbitos respetan Guatemala y la privacidad del registro", () => {
  assert.equal(c.activityTime("2026-11-05T15:30:00Z"), "09:30");
  for (const scope of ["EQUIPO", "EMPRESA", "PRIVADA"])
    assert.equal(c.activityScope({ visibilidad: scope }), scope);
});
test("administración tiene enlaces directos para los cinco catálogos y para solicitudes", () => {
  assert.deepEqual(
    access.accessNavigation(true).map((item) => item.id),
    ["users", "profiles", "roles", "modules", "permissions", "requests"],
  );
  assert.equal(
    access.accessNavigation(true).find((item) => item.id === "profiles").href,
    "/espacio/accesos?tab=profiles",
  );
});
test("solicitudes de un usuario no administrador no muestran enlaces de administración", () => {
  assert.deepEqual(access.accessNavigation(false), [
    {
      id: "requests",
      label: "Solicitudes de acceso",
      href: "/espacio/solicitudes",
    },
  ]);
});
test("un enlace directo válido conserva la pestaña y los valores desconocidos caen en Usuarios", () => {
  for (const tab of ["users", "profiles", "roles", "modules", "permissions"])
    assert.equal(access.accessTab(tab), tab);
  assert.equal(access.accessTab(null), "users");
  assert.equal(access.accessTab("requests"), "users");
  assert.equal(access.accessTab("https://otra.invalid"), "users");
});
