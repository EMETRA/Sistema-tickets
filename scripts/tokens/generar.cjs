#!/usr/bin/env node
// Genera los estilos a partir de la fuente única src/theme/tokens.json.
//   pnpm tokens          → escribe src/theme/tokens.css y src/theme/colors.scss
//   pnpm tokens:check    → falla si los archivos generados no están al día (CI)
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "../..");
const tokens = JSON.parse(fs.readFileSync(path.join(root, "src/theme/tokens.json"), "utf8"));
const HEADER = "Generado por scripts/tokens/generar.cjs desde src/theme/tokens.json. No editar a mano.";

const decl = (obj) =>
    Object.entries(obj)
        .filter(([k]) => !k.startsWith("$"))
        .map(([k, v]) => `  ${k.startsWith("--") ? k : "--" + k}: ${v};`)
        .join("\n");

/** Paleta → { "--paleta-azul-1": "#…" } (listas numeradas desde 1; grupos con nombre). */
function paletteVars() {
    const out = {};
    for (const [group, values] of Object.entries(tokens.paleta)) {
        if (Array.isArray(values)) values.forEach((v, i) => (out[`--paleta-${group}-${i + 1}`] = v));
        else for (const [name, v] of Object.entries(values)) out[`--paleta-${name}`] = v;
    }
    return out;
}

function css() {
    return `/* ${HEADER} */

/* Tema claro (base) y paleta institucional. */
:root {
${decl(tokens.tema.claro)}

${decl(paletteVars())}
}

/* ── Tema oscuro ─────────────────────────────────────────────────────────
   Se activa con data-theme="dark" en <html> (Ajustes → Apariencia).
   Mismos nombres de tokens: los componentes no cambian, solo sus valores. */
:root[data-theme="dark"] {
  color-scheme: dark;
${decl(tokens.tema.oscuro)}
}

/* ── Alto contraste (Ajustes → Lectura y accesibilidad) ──────────────────
   Textos secundarios ≥ 7:1 sobre la superficie y bordes visibles. */
:root[data-contrast="more"] {
${decl(tokens.contraste.claro)}
}
:root[data-contrast="more"][data-theme="dark"] {
${decl(tokens.contraste.oscuro)}
}
`;
}

function scss() {
    const lines = [
        `// ${HEADER}`,
        "// Los valores viven en CSS (var(--…)): siguen al tema oscuro y al alto contraste.",
        "// Para aclarar, oscurecer o dar transparencia usa color-mix(), no las funciones de color de Sass.",
        "",
        "// Alias del tema",
    ];
    for (const [name, token] of Object.entries(tokens.sass)) {
        if (name.startsWith("$")) continue;
        lines.push(`$${name}: var(--tickets-${token}, ${tokens.tema.claro["tickets-" + token]});`);
    }
    for (const [group, values] of Object.entries(tokens.paleta)) {
        lines.push("", `// Paleta: ${group}`);
        if (Array.isArray(values))
            values.forEach((v, i) => lines.push(`$${group}-${i + 1}: var(--paleta-${group}-${i + 1}, ${v});`));
        else for (const [name, v] of Object.entries(values)) lines.push(`$${name}: var(--paleta-${name}, ${v});`);
    }
    return lines.join("\n") + "\n";
}

const outputs = { "src/theme/tokens.css": css(), "src/theme/colors.scss": scss() };
const check = process.argv.includes("--check");
let stale = 0;
for (const [file, content] of Object.entries(outputs)) {
    const full = path.join(root, file);
    const current = fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
    if (current === content) continue;
    if (check) {
        console.error(`✗ ${file} no está al día con tokens.json. Ejecuta: pnpm tokens`);
        stale++;
    } else {
        fs.writeFileSync(full, content);
        console.log(`✓ ${file}`);
    }
}
if (check && stale) process.exit(1);
if (check) console.log("✓ Tokens al día");
