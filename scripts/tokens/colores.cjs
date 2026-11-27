#!/usr/bin/env node
/**
 * Colores escritos a mano en los estilos (SCSS fuera de src/theme).
 *
 * Los colores deben salir de los tokens (`var(--tickets-…)`), que siguen al tema oscuro y al alto
 * contraste. Quedan algunos heredados (gráficas, transparencias, módulos antiguos): este script
 * guarda cuántos tiene cada archivo y falla si alguno suma colores nuevos.
 *
 *   node scripts/tokens/colores.cjs           → lista los archivos con colores escritos a mano
 *   node scripts/tokens/colores.cjs --check   → falla si algún archivo supera su base
 *   node scripts/tokens/colores.cjs --base    → reescribe la base (solo después de quitar colores)
 */
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const baseFile = path.join(__dirname, "colores-base.json");
const HEX = /(?<![\w-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g;

function walk(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full, out);
        else if (entry.name.endsWith(".scss")) out.push(full);
    }
    return out;
}

const counts = {};
for (const file of walk(path.join(root, "src"))) {
    const rel = path.relative(root, file).split(path.sep).join("/");
    if (rel.startsWith("src/theme/")) continue;
    const text = fs.readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "");
    const n = (text.match(HEX) || []).length;
    if (n) counts[rel] = n;
}
const total = Object.values(counts).reduce((a, b) => a + b, 0);

if (process.argv.includes("--base")) {
    fs.writeFileSync(baseFile, JSON.stringify(Object.fromEntries(Object.entries(counts).sort()), null, 2) + "\n");
    console.log(`Base actualizada: ${total} colores en ${Object.keys(counts).length} archivos.`);
} else if (process.argv.includes("--check")) {
    const base = JSON.parse(fs.readFileSync(baseFile, "utf8"));
    const over = Object.entries(counts).filter(([f, n]) => n > (base[f] || 0));
    if (over.length) {
        for (const [f, n] of over) console.error(`${f}: ${n} colores escritos a mano (base ${base[f] || 0}).`);
        console.error("Usa un token del tema (var(--tickets-…)); ver docs/arquitectura/README.md.");
        process.exit(1);
    }
    const baseTotal = Object.values(base).reduce((a, b) => a + b, 0);
    console.log(`Colores escritos a mano: ${total} (base ${baseTotal}).`);
    if (total < baseTotal) console.log("Bajaron: ejecuta `node scripts/tokens/colores.cjs --base` para fijar la nueva base.");
} else {
    for (const [f, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) console.log(String(n).padStart(4), f);
    console.log(`Total: ${total}`);
}
