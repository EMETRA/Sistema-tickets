#!/usr/bin/env node
// Solo laboratorio de loopback. No introduce rutas ni accesos alternativos en producción.
const http = require("node:http");
const net = require("node:net");
const path = require("node:path");
const fs = require("node:fs");
const { spawn } = require("node:child_process");
const { randomUUID } = require("node:crypto");
const { once } = require("node:events");
const { createLab } = require("./servidor.cjs");
const { page, sessionPage, banner } = require("./interfaz.cjs");
const root = path.resolve(__dirname, "../..");
const listen = async (server, port) => {
  server.listen(port, "127.0.0.1");
  await once(server, "listening");
};
async function start(options = {}) {
  const port = Number(options.port || process.env.TICKETS_LAB_PORT || 3030);
  if (!Number.isInteger(port) || port < 1024 || port > 65532)
    throw Error("TICKETS_LAB_PORT debe estar entre 1024 y 65532.");
  const apiPort = port + 2,
    nextPort = port + 1,
    base = "http://127.0.0.1:" + port;
  const file = options.file || path.join(root, ".laboratorio", "estado.json");
  const nextPath = path.join(root, "node_modules/next/dist/bin/next");
  if (!fs.existsSync(nextPath))
    throw Error("Primero ejecuta pnpm install --frozen-lockfile.");
  // Reservar los tres puertos antes de iniciar Next. Nunca detener un proceso ajeno.
  for (const p of [port, nextPort, apiPort]) {
    const check = net.createServer();
    await listen(check, p);
    await new Promise((resolve) => check.close(resolve));
  }
  const lab = await createLab(file, { graphql: options.graphql, incidentToken:options.incidentToken, incident:options.incident });
  await listen(lab.server, apiPort);
  const nonce = randomUUID(),
    apiBase = "http://127.0.0.1:" + apiPort;
  const compiled = options.compiled || process.argv.includes("--compilado");
  const child = spawn(
    process.execPath,
    [
      nextPath,
      compiled ? "start" : "dev",
      ...(!compiled ? ["--webpack"] : []),
      "-p",
      String(nextPort),
      "-H",
      "127.0.0.1",
    ],
    {
      cwd: root,
      env: {
        ...process.env,
        NODE_ENV: compiled ? "production" : "development",
        TICKETS_LOCAL_LAB: compiled ? "0" : "1",
        GRAPHQL_ENDPOINT: apiBase + "/graphql",
        TICKETS_API_URL: apiBase,
        NEXT_PUBLIC_TICKETS_API_URL: apiBase,
        NEXT_PUBLIC_AUTH_API_URL: apiBase,
        NEXT_PUBLIC_API_URL: apiBase,
        AUTH_RECOVERY_BASE_URL: apiBase,
        AUTH_API_URL: apiBase,
        TICKETS_PLATFORM_ENABLED: "true",
        TICKETS_PANEL_ERROR_TOKEN: options.incidentToken || '',
        TICKETS_ERROR_QUEUE_DIR: path.join(path.dirname(file),'incidents-pending'),
        NEXT_TELEMETRY_DISABLED: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  child.stdout.on("data", (b) => process.stdout.write(b));
  child.stderr.on("data", (b) => process.stderr.write(b));
  const sockets = new Set();
  const gateway = http.createServer(async (req, res) => {
    try {
      const host = req.headers.host || "";
      if (!/^127\.0\.0\.1:\d+$/.test(host)) {
        res.writeHead(403);
        return res.end("Abrir el laboratorio desde 127.0.0.1.");
      }
      const url = new URL(req.url, base),
        html = (value, status = 200) => {
          res.writeHead(status, {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store",
            "Referrer-Policy": "no-referrer",
          });
          res.end(value);
        };
      if (url.pathname.startsWith("/__laboratorio")) {
        if (req.method === "POST") {
          if (req.headers.origin && req.headers.origin !== base) {
            res.writeHead(403);
            return res.end("Origen inválido.");
          }
          let raw = "";
          for await (const b of req) {
            raw += b;
            if (raw.length > 5000) throw Error("Formulario demasiado grande.");
          }
          const form = new URLSearchParams(raw);
          if (form.get("nonce") !== nonce) {
            res.writeHead(403);
            return res.end("Control de laboratorio inválido.");
          }
          if (url.pathname === "/__laboratorio/reiniciar") {
            await lab.state.reset();
            lab.sessions?.clear();
            return html(
              page(
                lab.state.data.users,
                nonce,
                "Datos ficticios restaurados. Elige un perfil para continuar.",
              ),
            );
          }
          if (
            url.pathname === "/__laboratorio/fallo" &&
            [
              "/platform/records",
              "/platform/metrics",
              "/platform/tickets",
            ].includes(form.get("ruta"))
          ) {
            lab.failures.push({ ruta: form.get("ruta"), restantes: 1 });
            return html(
              page(
                lab.state.data.users,
                nonce,
                "Fallo preparado. Entra con un perfil y abre el recurso elegido.",
              ),
            );
          }
        }
        if (url.pathname === "/__laboratorio/entrar") {
          const { token, user } = lab.createSession(
            Number(url.searchParams.get("usuario")),
          );
          return html(sessionPage(token, user));
        }
        return html(page(lab.state.data.users, nonce));
      }
      if (
        url.pathname === "/" &&
        !req.headers.cookie?.includes("auth_token=laboratorio-")
      ) {
        res.writeHead(302, { Location: "/__laboratorio" });
        return res.end();
      }
      if (
        url.pathname.startsWith("/api/") &&
        !(typeof options.graphql === "function" && /^\/api\/MOD(?:01|04|05|06|07|08)\//.test(url.pathname)) &&
        !/^\/api\/(platform(?:\/|$)|graphql$|apps-catalog$|ticket(?:\/|$)|tickets(?:\/|$)|ticket-(?:categories|priorities|statuses|tag-catalog|tags|comments)(?:\/|$)|perfil-equipo$)/.test(
          url.pathname,
        )
      ) {
        res.writeHead(501, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            message:
              "Esta integración está fuera del laboratorio local. No se contactó ningún servicio externo.",
          }),
        );
      }
      const upstream = http.request(
        {
          hostname: "127.0.0.1",
          port: nextPort,
          path: req.url,
          method: req.method,
          headers: {
            ...req.headers,
            host: "127.0.0.1:" + nextPort,
            "accept-encoding": "identity",
          },
        },
        (response) => {
          const headers = {
            ...response.headers,
            "Cache-Control": "no-store",
            "Content-Security-Policy":
              "connect-src 'self' ws://127.0.0.1:* http://127.0.0.1:*; img-src 'self' data: blob:; media-src 'self' blob:; frame-src 'self' blob:",
          };
          if ((headers["content-type"] || "").includes("text/html")) {
            const chunks = [];
            response.on("data", (b) => chunks.push(b));
            response.on("end", () => {
              let value = Buffer.concat(chunks).toString("utf8");
              value = value.replace("</body>", banner + "</body>");
              delete headers["content-length"];
              delete headers["content-encoding"];
              res.writeHead(response.statusCode, headers);
              res.end(value);
            });
          } else {
            res.writeHead(response.statusCode, headers);
            response.pipe(res);
          }
        },
      );
      upstream.on("error", () => {
        if (!res.headersSent)
          res.writeHead(503, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Next todavía está iniciando. Espera unos segundos y recarga.");
      });
      req.pipe(upstream);
    } catch {
      if (!res.headersSent) res.writeHead(400);
      res.end("No se pudo procesar el control local.");
    }
  });
  gateway.on("connection", (socket) => {
    sockets.add(socket);
    socket.once("close", () => sockets.delete(socket));
  });
  gateway.on("upgrade", (req, socket, head) => {
    const upstream = net.connect(nextPort, "127.0.0.1", () => {
      upstream.write(
        `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n${Object.entries(
          req.headers,
        )
          .map(([k, v]) => `${k}: ${v}`)
          .join("\r\n")}\r\n\r\n`,
      );
      if (head.length) upstream.write(head);
      socket.pipe(upstream).pipe(socket);
    });
    upstream.on("error", () => socket.destroy());
    socket.on("error", () => upstream.destroy());
  });
  await listen(gateway, port);
  let closed = false;
  const close = async () => {
    if (closed) return;
    closed = true;
    child.kill("SIGTERM");
    for (const socket of sockets) socket.destroy();
    gateway.closeAllConnections();
    lab.server.closeAllConnections();
    await Promise.all([
      new Promise((resolve) => gateway.close(resolve)),
      new Promise((resolve) => lab.server.close(resolve)),
    ]);
    await lab.state.pending;
  };
  child.once("exit", () => {
    void close();
  });
  console.log(
    "\nLABORATORIO LOCAL: " +
      base +
      "/__laboratorio\nDatos ficticios persistentes: " +
      file +
      "\nSolo loopback; sin Oracle, SMTP ni servicios de la oficina. Detener con Ctrl+C.\n",
  );
  return { close, lab, base, child };
}
if (require.main === module)
  start()
    .then((instance) => {
      for (const sig of ["SIGINT", "SIGTERM"])
        process.once(sig, () => void instance.close());
    })
    .catch((e) => {
      console.error(
        "LABORATORIO_NO_INICIADO: " +
          (e.code === "EADDRINUSE"
            ? "Uno de los tres puertos está ocupado. Usa otro TICKETS_LAB_PORT."
            : e.message),
      );
      process.exitCode = 1;
    });
module.exports = { start };
