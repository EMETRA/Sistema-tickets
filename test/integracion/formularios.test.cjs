// Validación de formularios (zod): mismas reglas que el API y mensajes claros.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const load = require("./load-ts.cjs")(path.resolve(__dirname, "../.."));
const { esquemaDatos, texto } = load("src/platform/forms.ts");

const campos = [
    { key: "inicio", label: "Inicio", type: "datetime", required: true },
    { key: "puertos", label: "Puertos", type: "number", min: 1, max: 48 },
    { key: "estado", label: "Estado", type: "select", options: ["ACTIVO", "INACTIVO"], required: true },
    { key: "repositorio", label: "Repositorio", type: "url" },
    { key: "participantes", label: "Participantes", type: "list" },
];
const mensajes = (datos) => {
    const r = esquemaDatos(campos).safeParse(datos);
    return r.success ? {} : Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message]));
};

test("un registro válido pasa, aunque los opcionales vengan vacíos", () => {
    assert.deepEqual(mensajes({ inicio: "2026-11-25T15:00:00Z", estado: "ACTIVO", puertos: "", repositorio: "" }), {});
});

test("los obligatorios vacíos piden completarse con el nombre del campo", () => {
    const m = mensajes({ inicio: "", estado: "" });
    assert.equal(m.inicio, "Completa «Inicio».");
    assert.equal(m.estado, "Completa «Estado».");
});

test("números fuera de rango, opciones y enlaces explican qué corregir", () => {
    const m = mensajes({ inicio: "2026-11-25T15:00:00Z", estado: "OTRO", puertos: 60, repositorio: "github.com/x" });
    assert.equal(m.puertos, "«Puertos» debe estar entre 1 y 48.");
    assert.equal(m.estado, "Elige una opción de la lista en «Estado».");
    assert.match(m.repositorio, /empieza con https:\/\//);
});

test("mismas reglas que el API: enteros desde 1, fechas exactas y enlaces sin credenciales", () => {
    const esquema = esquemaDatos([
        { key: "cantidad", label: "Cantidad", type: "number" },
        { key: "revision", label: "Revisión", type: "date" },
        { key: "sitio", label: "Sitio", type: "url" },
        { key: "equipo", label: "Equipo", type: "ref", required: true },
    ]);
    const r = esquema.safeParse({ cantidad: 2.5, revision: "2026-02-30", sitio: "https://a:b@x.gt", equipo: "abc" });
    const m = Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message]));
    assert.equal(m.cantidad, "Escribe un número en «Cantidad».");
    assert.equal(m.revision, "Escribe una fecha válida en «Revisión».");
    assert.match(m.sitio, /enlace completo/);
    assert.equal(m.equipo, "Elige una opción de la lista en «Equipo».");
    assert.equal(esquema.safeParse({ cantidad: 0, equipo: "6f1c2a1e-8a1b-4c2d-9e3f-1a2b3c4d5e6f" }).success, false);
    assert.equal(
        esquema.safeParse({ cantidad: 3, revision: "2026-02-28", sitio: "http://x.gt", equipo: "6f1c2a1e-8a1b-4c2d-9e3f-1a2b3c4d5e6f" }).success,
        true,
    );
});

test("los nombres no aceptan solo espacios", () => {
    const r = texto("Nombre", { requerido: true }).safeParse("   ");
    assert.equal(r.success, false);
    assert.equal(r.error.issues[0].message, "Completa «Nombre».");
});
