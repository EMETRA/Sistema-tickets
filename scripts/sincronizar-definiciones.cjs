#!/usr/bin/env node
// Copia las definiciones de recursos del API (api-tickets, src/platform/platform.definitions.ts)
// al fixture que usan el laboratorio y las pruebas: test/fixtures/platform-definitions.json.
//
//   node scripts/sincronizar-definiciones.cjs ../../apis/api-tickets           → actualiza el fixture
//   node scripts/sincronizar-definiciones.cjs ../../apis/api-tickets --check   → falla si difieren
//
// Usar la rama del API que corresponde (QA para Dev, main para main).
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const apiRoot = process.argv[2] && path.resolve(process.argv[2]);
if (!apiRoot) {
    console.error("Indica la carpeta de api-tickets: node scripts/sincronizar-definiciones.cjs <ruta>");
    process.exit(2);
}
const source = path.join(apiRoot, "src/platform/platform.definitions.ts");
const code = ts.transpileModule(fs.readFileSync(source, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const mod = { exports: {} };
// El archivo solo importa tipos; no necesita dependencias en tiempo de ejecución.
new Function("require", "module", "exports", code)(() => ({}), mod, mod.exports);
const definitions = mod.exports.DEFINITIONS;
if (!definitions || typeof definitions !== "object") throw new Error("No se encontró DEFINITIONS en " + source);

const target = path.join(root, "test/fixtures/platform-definitions.json");
const next = JSON.stringify(definitions, null, 2) + "\n";
const current = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : "";
if (process.argv.includes("--check")) {
    if (JSON.stringify(JSON.parse(current)) !== JSON.stringify(definitions)) {
        console.error("✗ El fixture no coincide con el API. Ejecuta: node scripts/sincronizar-definiciones.cjs " + process.argv[2]);
        process.exit(1);
    }
    console.log("✓ Definiciones al día con el API");
} else {
    fs.writeFileSync(target, next);
    console.log(`✓ ${Object.keys(definitions).length} recursos copiados del API a test/fixtures/platform-definitions.json`);
}
