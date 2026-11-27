#!/usr/bin/env node
// Valida cada consulta y mutación GraphQL del front contra el esquema del API (api-tickets: src/schema.gql).
//   node scripts/contrato-graphql.cjs <ruta-api-tickets>
// Detecta campos, argumentos o tipos que el API ya no tiene (en QA serían errores en tiempo de ejecución).
const fs = require("node:fs");
const path = require("node:path");
const { buildSchema, parse, validate, Kind } = require("graphql");

const root = path.resolve(__dirname, "..");
const api = path.resolve(process.argv[2] || "");
const schema = buildSchema(fs.readFileSync(path.join(api, "src/schema.gql"), "utf8"));

const walk = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) return e.name === "node_modules" ? [] : walk(p);
        return /\.(ts|tsx)$/.test(p) && !/\.(stories|spec|test)\./.test(p) ? [p] : [];
    });

// Plantillas y cadenas que empiezan con «query» o «mutation» (sin interpolaciones).
const RE = /(`|")\s*((?:query|mutation)\b[\s\S]*?)\1/g;
const fragments = new Map(); // fragmentos definidos aparte, por nombre
const docs = [];
for (const file of walk(path.join(root, "src"))) {
    const text = fs.readFileSync(file, "utf8");
    for (const m of text.matchAll(/(`)\s*(fragment\s+\w+[\s\S]*?)\1/g)) {
        try {
            for (const d of parse(m[2]).definitions)
                if (d.kind === Kind.FRAGMENT_DEFINITION) fragments.set(d.name.value, m[2]);
        } catch {
            /* no es GraphQL */
        }
    }
    for (const m of text.matchAll(RE)) {
        if (m[2].includes("${")) continue; // documentos armados dinámicamente: fuera de alcance
        docs.push({ file: path.relative(root, file), source: m[2] });
    }
}

const { excepciones } = JSON.parse(
    fs.readFileSync(path.join(__dirname, "contrato-graphql.excepciones.json"), "utf8"),
);
let errors = 0,
    checked = 0,
    known = 0;
for (const { file, source } of docs) {
    let doc;
    try {
        doc = parse(source);
    } catch {
        continue; // texto que empieza con «query» pero no es GraphQL
    }
    // Agrega fragmentos usados y definidos en otros archivos.
    const used = new Set();
    JSON.stringify(doc, (k, v) => (v && v.kind === Kind.FRAGMENT_SPREAD && used.add(v.name.value), v));
    const extra = [...used].filter((n) => fragments.has(n) && !source.includes("fragment " + n));
    if (extra.length) doc = parse(source + "\n" + extra.map((n) => fragments.get(n)).join("\n"));
    checked++;
    for (const e of validate(schema, doc)) {
        const op = doc.definitions.find((d) => d.kind === Kind.OPERATION_DEFINITION);
        if (excepciones.some((x) => x.operacion === op?.name?.value && x.mensaje === e.message)) {
            known++;
            continue;
        }
        errors++;
        console.log(`✗ ${file} · ${op?.name?.value || "(sin nombre)"}: ${e.message}`);
    }
}
console.log(
    `\n${checked} operaciones validadas contra src/schema.gql · ${errors} errores` +
        (known ? ` · ${known} diferencia(s) conocida(s) del API (scripts/contrato-graphql.excepciones.json)` : ""),
);
process.exitCode = errors ? 1 : 0;
