#!/usr/bin/env node
/**
 * Revisa .env y .env.tickets del Panel antes de construir o desplegar (pnpm entorno:check).
 * No imprime valores (pueden ser secretos), solo nombres de variables y problemas.
 *
 *   - .env se copia a la imagen y Next lo lee al compilar: sin secretos.
 *   - .env.tickets se excluye de la imagen: ahí van las variables privadas del servidor;
 *     un NEXT_PUBLIC_* en .env.tickets no llega al navegador (no existe al compilar).
 */
const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const leer = (nombre) => {
    const ruta = path.join(root, nombre);
    if (!fs.existsSync(ruta)) return null;
    const datos = {};
    for (const linea of fs.readFileSync(ruta, "utf8").split(/\r?\n/)) {
        const m = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(linea);
        if (m) datos[m[1]] = m[2].trim().replace(/^(['"])(.*)\1$/, "$2");
    }
    return datos;
};

const env = leer(".env"),
    privado = leer(".env.tickets");
const errores = [],
    avisos = [];
if (!env) errores.push("Falta .env (copiar .env.example).");
if (!privado) errores.push("Falta .env.tickets (copiar env.tickets.example).");
const todo = { ...(env || {}), ...(privado || {}) };

const SECRETO = /(TOKEN|PASS|PASSWORD|SECRET|CLAVE|PRIVATE|_KEY$)/;
for (const [nombre, datos] of [
    [".env", env],
    [".env.tickets", privado],
]) {
    if (!datos) continue;
    const plantilla = Object.keys(datos).filter((k) => /<[^>]+>/.test(datos[k]));
    if (plantilla.length) errores.push(`${nombre}: valores de plantilla sin reemplazar en ${plantilla.join(", ")}`);
}
if (env) {
    const secretos = Object.keys(env).filter((k) => !k.startsWith("NEXT_PUBLIC_") && SECRETO.test(k));
    if (secretos.length)
        errores.push(`.env se copia a la imagen: mueve a .env.tickets ${secretos.join(", ")}`);
}
if (privado) {
    const publicos = Object.keys(privado).filter((k) => k.startsWith("NEXT_PUBLIC_"));
    if (publicos.length)
        errores.push(`.env.tickets no existe al compilar: mueve a .env ${publicos.join(", ")} (son públicas)`);
}

const url = (clave, opcional = false) => {
    const valor = todo[clave];
    if (!valor) return opcional || errores.push(`Falta ${clave}.`);
    try {
        const u = new URL(valor);
        if (!["http:", "https:"].includes(u.protocol) || u.username || u.password)
            errores.push(`${clave} debe ser una URL http(s) sin usuario ni contraseña.`);
    } catch {
        errores.push(`${clave} no es una URL válida.`);
    }
};
if (todo.GRAPHQL_ENDPOINT) url("GRAPHQL_ENDPOINT");
else if (todo.TICKETS_API_URL) url("TICKETS_API_URL");
else if (todo.QA_GRAPHQL_ENDPOINT) url("QA_GRAPHQL_ENDPOINT");
else errores.push("Falta GRAPHQL_ENDPOINT (o TICKETS_API_URL) en .env.tickets.");
url("AUTH_RECOVERY_BASE_URL", true);
if (!todo.AUTH_RECOVERY_BASE_URL) avisos.push("Sin AUTH_RECOVERY_BASE_URL: la recuperación de contraseña aparecerá como no disponible.");

if (!["true", "false"].includes(todo.TICKETS_PLATFORM_ENABLED))
    errores.push("TICKETS_PLATFORM_ENABLED debe ser true o false (igual que en api-tickets).");
else if (todo.TICKETS_PLATFORM_ENABLED === "false")
    avisos.push("TICKETS_PLATFORM_ENABLED=false: los módulos que verifican acceso quedarán bloqueados.");

const token = todo.TICKETS_PANEL_ERROR_TOKEN;
if (!token) avisos.push("Sin TICKETS_PANEL_ERROR_TOKEN: los errores del Panel no se envían a api-tickets.");
else if (!/^\S{32,200}$/.test(token))
    errores.push("TICKETS_PANEL_ERROR_TOKEN debe tener entre 32 y 200 caracteres sin espacios.");

for (const clave of ["NEXT_PUBLIC_GRAPHQL_TIMEOUT_MS", "NEXT_PUBLIC_FETCH_TIMEOUT_MS", "GRAPHQL_PROXY_TIMEOUT_MS"])
    if (todo[clave] && !/^[1-9]\d{2,6}$/.test(todo[clave])) errores.push(`${clave} debe ser un número de milisegundos.`);
if (todo.NEXT_PUBLIC_AUTH_COOKIE_SECURE === "false")
    avisos.push("NEXT_PUBLIC_AUTH_COOKIE_SECURE=false: solo para probar por HTTP; en HTTPS quítala.");

const SIN_USO = {
    VIVI_API_URL: "ya no se usa",
    STORYBOOK_PORT: "ya no se usa",
    NEXT_PUBLIC_AUTH_API_URL: "ya no se usa",
    NEXT_PUBLIC_AUTH_LOGIN_PATH: "ya no se usa",
    NEXT_PUBLIC_TICKETS_API_URL: "usa TICKETS_API_URL/GRAPHQL_ENDPOINT en .env.tickets (privadas)",
    NEXT_PUBLIC_GRAPHQL_ENDPOINT: "usa GRAPHQL_ENDPOINT en .env.tickets (privada)",
};
for (const [clave, motivo] of Object.entries(SIN_USO)) if (clave in todo) avisos.push(`${clave}: ${motivo}.`);

for (const a of avisos) console.log("AVISO  " + a);
for (const e of errores) console.log("ERROR  " + e);
console.log(errores.length ? `\n${errores.length} error(es): corrige antes de construir.` : "\n✓ Entorno del Panel listo.");
process.exit(errores.length ? 1 : 0);
