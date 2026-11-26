#!/usr/bin/env node
// Compara las rutas del API del Panel que llama el front (platformFetch / platformCommand)
// con las que publica api-tickets (controladores Nest con prefijo «platform»).
//   node scripts/contrato-api.cjs <ruta-api-tickets>
// Lista las llamadas del front sin ruta equivalente en el API (en QA darían 404).
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const api = path.resolve(process.argv[2] || "");
const walk = (dir, filter) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) return ["node_modules", "dist", ".next"].includes(e.name) ? [] : walk(p, filter);
        return filter(p) ? [p] : [];
    });

// 1. Rutas del API: @Controller('x') + @Get('y') → /x/y (parámetros :id → comodín).
const routes = [];
for (const file of walk(path.join(api, "src"), (p) => /controller\.ts$/.test(p) && !/\.spec\./.test(p))) {
    const text = fs.readFileSync(file, "utf8");
    const prefix = (text.match(/@Controller\(\s*['"`]([^'"`]*)['"`]/) || [])[1] ?? "";
    for (const m of text.matchAll(/@(Get|Post|Put|Patch|Delete)\(\s*(?:['"`]([^'"`]*)['"`])?\s*\)/g)) {
        const full = "/" + [prefix, m[2] || ""].filter(Boolean).join("/");
        routes.push({ method: m[1].toUpperCase(), path: full.replace(/\/+/g, "/"), file: path.relative(api, file) });
    }
}
const toRegex = (p) => new RegExp("^" + p.replace(/:[^/]+/g, "[^/]+").replace(/\*/g, ".*") + "/?$");
const apiPlatform = routes.filter((r) => r.path.startsWith("/platform"));

// 2. Llamadas del front: primer argumento literal de platformFetch/platformCommand.
const calls = new Map();
for (const file of walk(path.join(root, "src"), (p) => /\.(ts|tsx)$/.test(p))) {
    const text = fs.readFileSync(file, "utf8");
    for (const m of text.matchAll(/platform(?:Fetch|Command)\s*(?:<[^>]*>)?\(/g)) {
        const p0 = argumentPath(text, m.index + m[0].length);
        if (!p0 || !p0.startsWith("/")) continue;
        const key = "/platform" + p0;
        if (!calls.has(key)) calls.set(key, new Set());
        calls.get(key).add(path.relative(root, file));
    }
}
/**
 * Reconstruye la ruta del primer argumento: literales y plantillas se conservan; cada expresión
 * concatenada (`"/records/" + type + "/" + id`) se vuelve un segmento comodín. Se descarta la query.
 */
function argumentPath(text, i) {
    let out = "", depth = 0;
    const skip = () => { while (/\s/.test(text[i])) i++; };
    for (;;) {
        skip();
        const q = text[i];
        if (q === '"' || q === "'" || q === "`") {
            let j = i + 1, lit = "";
            while (j < text.length && text[j] !== q) {
                if (q === "`" && text[j] === "$" && text[j + 1] === "{") {
                    let d = 1; j += 2;
                    while (d && j < text.length) { if (text[j] === "{") d++; else if (text[j] === "}") d--; j++; }
                    lit += ":x";
                    continue;
                }
                lit += text[j++];
            }
            out += lit; i = j + 1;
        } else {
            // Expresión: avanza hasta "+" , "," o ")" del mismo nivel.
            let j = i;
            while (j < text.length) {
                const c = text[j];
                if ("([{".includes(c)) depth++;
                else if (")]}".includes(c)) { if (!depth) break; depth--; }
                else if ((c === "+" || c === ",") && !depth) break;
                j++;
            }
            // Una expresión pegada a un segmento sin «/» es un sufijo o query opcional: se ignora.
            if (j > i && (out === "" || out.endsWith("/"))) out += ":x";
            i = j;
        }
        skip();
        if (text[i] === "+") { i++; continue; }
        break;
    }
    out = out.split("?")[0].replace(/(:x)+/g, ":x");
    return out.endsWith("/") ? out + ":x" : out;
}
const missing = [];
for (const [call, files] of calls) {
    const sample = call.replace(/:x/g, "seg");
    const callRegex = toRegex(call);
    // Coincide si la ruta del API acepta la llamada, o si la llamada (con variables) cubre una ruta fija del API.
    if (!apiPlatform.some((r) => toRegex(r.path).test(sample) || callRegex.test(r.path.replace(/:[^/]+/g, "seg"))))
        missing.push(`${call}  ←  ${[...files].slice(0, 3).join(", ")}`);
}
console.log(`API: ${apiPlatform.length} rutas /platform · Front: ${calls.size} rutas llamadas`);
console.log(missing.length ? `\nSin ruta equivalente en el API (${missing.length}):\n  ` + missing.sort().join("\n  ") : "\n✓ Todas las rutas del front existen en el API");
process.exitCode = missing.length ? 1 : 0;
