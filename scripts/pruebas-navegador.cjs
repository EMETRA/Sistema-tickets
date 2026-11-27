#!/usr/bin/env node
/**
 * Pruebas de navegador por flujo (`test/integracion/*-browser.cjs`).
 *
 * Cada script levanta Next compilado (`pnpm build` antes) con un API simulado propio y recorre un
 * flujo completo con Playwright. Complementan `e2e/` (accesibilidad y experiencia sobre el
 * laboratorio) con escenarios de negocio que necesitan respuestas controladas del API.
 *
 *   pnpm test:navegador                 → todas
 *   pnpm test:navegador cct juzgado     → solo las que contienen esos nombres
 */
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const dir = path.join(root, "test/integracion");
const filtros = process.argv.slice(2);
const scripts = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith("-browser.cjs"))
    .filter((f) => !filtros.length || filtros.some((x) => f.includes(x)))
    .sort();

if (!fs.existsSync(path.join(root, ".next/BUILD_ID"))) {
    console.error("Falta el build de producción: ejecuta `pnpm build` antes de las pruebas de navegador.");
    process.exit(1);
}

const LIMITE = Number(process.env.TICKETS_BROWSER_TIMEOUT || 300) * 1000;

function correr(file) {
    return new Promise((resolve) => {
        const inicio = Date.now();
        const salida = [];
        const child = spawn(process.execPath, [path.join(dir, file)], {
            cwd: root,
            env: { ...process.env, FORCE_COLOR: "0" },
            detached: true,
        });
        const guardar = (b) => salida.push(String(b));
        child.stdout.on("data", guardar);
        child.stderr.on("data", guardar);
        const reloj = setTimeout(() => {
            salida.push(`\nSe superó el límite de ${LIMITE / 1000} s.`);
            try {
                process.kill(-child.pid, "SIGKILL");
            } catch {
                child.kill("SIGKILL");
            }
        }, LIMITE);
        child.on("exit", (code) => {
            clearTimeout(reloj);
            resolve({ file, ok: code === 0, segundos: Math.round((Date.now() - inicio) / 1000), salida: salida.join("") });
        });
    });
}

(async () => {
    const resultados = [];
    for (const file of scripts) {
        const r = await correr(file);
        resultados.push(r);
        console.log(`${r.ok ? "✓" : "✗"} ${file} (${r.segundos} s)`);
        if (!r.ok) console.log(r.salida.trim().split("\n").slice(-25).map((l) => "    " + l).join("\n"));
    }
    const fallidas = resultados.filter((r) => !r.ok);
    console.log(`\n${resultados.length - fallidas.length} de ${resultados.length} pruebas de navegador pasaron.`);
    process.exit(fallidas.length ? 1 : 0);
})();
