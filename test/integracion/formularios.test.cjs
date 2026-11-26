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

test("los nombres no aceptan solo espacios", () => {
    const r = texto("Nombre", { requerido: true }).safeParse("   ");
    assert.equal(r.success, false);
    assert.equal(r.error.issues[0].message, "Completa «Nombre».");
});
