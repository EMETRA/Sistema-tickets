// Entrada local para el Panel REAL + APIs REALES + Oracle local.
// La contraseña se valida en Auth; no se generan JWT ni permisos en este proceso.
const http = require("node:http");
const net = require("node:net");
const { randomUUID } = require("node:crypto");
const { sessionPage } = require("../laboratorio/interfaz.cjs");
const accounts = [
  "admin",
  "secretaria",
  "jefatura",
  "tecnico",
  "desarrollador",
  "devops",
  "usuario",
];
async function start(c) {
  const base = `http://127.0.0.1:${c.panelPort}`,
    api = `http://127.0.0.1:${c.apiPort}`,
    nonce = randomUUID(),
    sockets = new Set();
  const landing = (error) =>
    `<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Tickets · Oracle local</title><style>body{font:16px system-ui;background:#f4f6fb;color:#263b58}main{max-width:700px;margin:50px auto;padding:24px}form{display:grid;gap:16px;background:white;border:1px solid #d8dfed;padding:28px;border-radius:16px}input,button{font:inherit;padding:12px;border-radius:8px;border:1px solid #c6d2e8}button{background:#4560ee;color:white}aside{background:#fff1c2;padding:18px;border-radius:12px;line-height:1.6}p{line-height:1.7}</style><main><h1>Sistema Tickets con Oracle local</h1><aside>Panel y APIs reales con datos ficticios en Oracle Free. El CAPTCHA externo se omite mediante la configuración local existente; usuario, contraseña, JWT y permisos se validan en Auth y Oracle.</aside><p>Usuarios: ${accounts.map((a) => a + "@laboratorio.invalid").join(", ")}.<br>Contraseña de prueba: <strong>PruebasTickets2026!</strong></p>${error ? '<p role="alert">No se pudo iniciar sesión. Revisa las credenciales y que las APIs hayan terminado de iniciar.</p>' : ""}<form method="post" action="/__oracle/login"><input type="hidden" name="nonce" value="${nonce}"><label>Correo de prueba<input style="display:block;width:95%" name="correo" type="email" required value="admin@laboratorio.invalid" list="cuentas"></label><datalist id="cuentas">${accounts.map((a) => `<option value="${a}@laboratorio.invalid">`).join("")}</datalist><label>Contraseña<input style="display:block;width:95%" name="clave" type="password" required autocomplete="current-password"></label><button>Ingresar con Auth real</button></form><p><a href="http://127.0.0.1:${c.mailPort}">Abrir buzón local de pruebas</a>. Todos los correos se capturan aquí; no se entrega correo fuera del laboratorio.</p><p>Inventario oficial, SAT, Noticias, Juzgado y otros servicios institucionales siguen pendientes de su integración. Guía: api-tickets/laboratorio/oracle/README.md.</p></main></html>`;
  const banner = `<aside style="position:fixed;z-index:99999;top:0;left:0;right:0;background:#dff6e8;color:#164e35;font:12px system-ui;text-align:center;padding:5px">ORACLE LOCAL REAL · DATOS FICTICIOS · <a href="/__oracle">Cambiar usuario</a> · <a href="http://127.0.0.1:${c.mailPort}" target="_blank" rel="noreferrer">Buzón local</a></aside>`;
  const server = http.createServer(async (req, res) => {
    const html = (value, status = 200) => {
      res.writeHead(status, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Referrer-Policy": "same-origin",
      });
      res.end(value);
    };
    try {
      if (req.headers.host !== `127.0.0.1:${c.panelPort}`) {
        res.writeHead(403);
        return res.end("Abrir desde 127.0.0.1.");
      }
      const u = new URL(req.url, base);
      if (u.pathname === "/") {
        res.writeHead(302, { Location: "/__oracle" });
        return res.end();
      }
      if (u.pathname === "/__oracle") return html(landing());
      if (u.pathname === "/__oracle/login" && req.method === "POST") {
        if (req.headers.origin && req.headers.origin !== base)
          return html(landing(true), 403);
        let raw = "";
        for await (const b of req) {
          raw += b;
          if (raw.length > 5000) return html(landing(true), 413);
        }
        const form = new URLSearchParams(raw);
        if (
          form.get("nonce") !== nonce ||
          !/@laboratorio\.invalid$/i.test(form.get("correo") || "")
        )
          return html(landing(true), 400);
        const query = async (query, variables, token) => {
          const r = await fetch(api + "/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: "Bearer " + token } : {}),
            },
            body: JSON.stringify({ query, variables }),
            signal: AbortSignal.timeout(25000),
          });
          const json = await r.json();
          if (!r.ok || json.errors?.length) throw Error("Login no disponible");
          return json.data;
        };
        const login = await query(
          "mutation($input:LoginInput!){login(input:$input){token}}",
          { input: { email: form.get("correo"), clave: form.get("clave") } },
        );
        const token = login.login.token,
          user = (
            await query(
              "query{usuario{id_usuario nombre email rol departamento permisos}}",
              {},
              token,
            )
          ).usuario;
        return html(sessionPage(token, user));
      }
      if (
        u.pathname.startsWith("/api/") &&
        !/^\/api\/(platform(?:\/|$)|graphql$|apps-catalog$|ticket(?:\/|$)|tickets(?:\/|$)|ticket-(?:categories|priorities|statuses|tag-catalog|tags|comments)(?:\/|$)|perfil-equipo$|auth\/)/.test(
          u.pathname,
        )
      ) {
        res.writeHead(501, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            message:
              "Esta integración institucional no está incluida en el laboratorio Oracle.",
          }),
        );
      }
      const upstream = http.request(
        {
          hostname: "127.0.0.1",
          port: c.nextPort,
          path: req.url,
          method: req.method,
          headers: {
            ...req.headers,
            host: `127.0.0.1:${c.nextPort}`,
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
              const value = Buffer.concat(chunks)
                .toString("utf8")
                .replace("</body>", banner + "</body>");
              delete headers["content-length"];
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
        if (!res.headersSent) res.writeHead(503);
        res.end("El Panel está iniciando. Espera y recarga.");
      });
      req.pipe(upstream);
    } catch {
      return html(landing(true), 503);
    }
  });
  server.on("connection", (socket) => {
    sockets.add(socket);
    socket.once("close", () => sockets.delete(socket));
  });
  server.on("upgrade", (req, socket, head) => {
    const p = net.connect(c.nextPort, "127.0.0.1", () => {
      p.write(
        `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n${Object.entries(
          req.headers,
        )
          .map(([k, v]) => `${k}: ${v}`)
          .join("\r\n")}\r\n\r\n`,
      );
      if (head.length) p.write(head);
      socket.pipe(p).pipe(socket);
    });
    p.on("error", () => socket.destroy());
    socket.on("error", () => p.destroy());
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(c.panelPort, "127.0.0.1", resolve);
  });
  return {
    close: () =>
      new Promise((resolve) => {
        for (const s of sockets) s.destroy();
        server.close(resolve);
      }),
  };
}
module.exports = { start };
