// Next real compilado, catálogo y metadatos ficticios. Sin Oracle ni GitHub real.
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const os = require("node:os");
const { randomUUID } = require("node:crypto");
const { chromium } = require("playwright");
const { start } = require("../../scripts/laboratorio/iniciar.cjs");
async function run() {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), "tickets-fuentes-"));
  const out = process.env.QA_SCREENSHOT_DIR || temp;
  await fs.mkdir(out, { recursive: true });
  let instance, browser;
  try {
    instance = await start({
      port: 3980,
      file: path.join(temp, "estado.json"),
      compiled: true,
    });
    const repoId = randomUUID();
    await instance.lab.state.change((s) => {
      s.applicationCatalog = {
        comunicacion: {
          meta: {
            id: "comunicacion",
            label: "COMUNICACIÓN",
            title: "Comunicación de prueba",
            iconName: "file-lines-regular",
          },
          sections: {
            contenido: {
              meta: {
                id: "contenido",
                label: "CONTENIDO",
                title: "Contenido de prueba",
                iconName: "file-lines-regular",
              },
              modules: [
                {
                  id: "noticias",
                  label: "NOTICIAS",
                  title: "Noticias de prueba",
                  iconName: "file-lines-regular",
                },
              ],
            },
          },
        },
      };
      s.resources.repositorios.push({
        id: repoId,
        nombre: "API de prueba",
        equipoId: s.ids.it,
        usuarioId: 1,
        visibilidad: "EQUIPO",
        estado: "ACTIVO",
        version: 1,
        creadoEn: new Date().toISOString(),
        actualizadoEn: new Date().toISOString(),
        datos: {
          url: "https://github.com/EMETRA/api-tickets",
          rama: "QA",
          aplicacionId: s.ids.app,
          componente: "BACK",
        },
      });
    });
    browser = await chromium.launch({
      executablePath: "/usr/bin/chromium",
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1100 },
    });
    page.setDefaultTimeout(25000);
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.route("**/*", (route) =>
      /^https?:/.test(route.request().url()) &&
      new URL(route.request().url()).hostname !== "127.0.0.1"
        ? route.abort()
        : route.continue(),
    );
    await page.route("**/api/COM03/permisos", (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ data: ["VIVI_NOTICIAS_LEER"] }),
      }),
    );
    await page.route("**/api/COM03/noticias?*", (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ data: [], total: 0 }),
      }),
    );
    let connected = true;
    await page.route("**/api/platform/repositories/*", (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          disponible: connected,
          estado: connected ? "VIGENTE" : "SIN_CREDENCIAL",
          repositorio: "EMETRA/api-tickets",
          rama: "QA",
          consultadoEn: new Date().toISOString(),
          ultimoCommit: {
            sha: "a".repeat(40),
            mensaje: "Commit ficticio para navegación",
            fecha: new Date().toISOString(),
            url:
              "https://github.com/EMETRA/api-tickets/commit/" + "a".repeat(40),
          },
          comprobaciones: {
            disponible: true,
            total: 1,
            items: [
              {
                nombre: "Pruebas de ejemplo",
                estado: "completed",
                resultado: "failure",
              },
            ],
          },
          pullRequests: {
            disponible: true,
            items: [
              {
                numero: 8,
                titulo: "PR ficticio",
                borrador: true,
                url: "https://github.com/EMETRA/api-tickets/pull/8",
              },
            ],
          },
        }),
      }),
    );
    for (let i = 0; i < 100; i++) {
      try {
        if ((await fetch(instance.base + "/home")).status < 500) break;
      } catch {}
      await new Promise((r) => setTimeout(r, 100));
    }
    const visit = async (url) => {
      await page.goto(instance.base + url);
      await page.waitForLoadState("networkidle");
    };
    await visit("/__laboratorio");
    await page.getByRole("link", { name: /Administración ficticia/ }).click();
    await page
      .getByRole("heading", { name: "Control de Informática", exact: true })
      .waitFor();
    await page.waitForLoadState("networkidle");
    await visit("/aplicaciones");
    const app = page.getByText("Comunicación de prueba", { exact: true });
    await app.waitFor();
    await app.locator("../..").getByRole("button").click();
    await page.waitForURL("**/home/comunicacion/contenido");
    await page
      .getByText("Noticias de prueba", { exact: true })
      .waitFor();
    await page.screenshot({
      path: path.join(out, "aplicacion-comunicacion.png"),
      fullPage: true,
    });
    await visit("/home/comunicacion");
    await page.waitForURL("**/home/comunicacion/contenido");
    await visit("/home/comunicacion/contenido/noticias");
    await page
      .getByRole("heading", { name: "Noticias", exact: true })
      .waitFor();
    assert.ok(
      !(await page.locator("body").innerText()).includes("Application error"),
    );
    await visit("/home/no-autorizada");
    await page.waitForURL("**/unauthorized");
    await visit("/espacio/sistemas");
    await page
      .getByRole("button", { name: "Estado de repositorios", exact: true })
      .click();
    await page
      .getByLabel("Repositorio vinculado", { exact: true })
      .selectOption(repoId);
    await page
      .getByText("Commit ficticio para navegación", { exact: true })
      .waitFor();
    await page.getByText("Fallida", { exact: true }).waitFor();
    assert.equal(
      await page.getByRole("link", { name: /#8/ }).getAttribute("href"),
      "https://github.com/EMETRA/api-tickets/pull/8",
    );
    await page.screenshot({
      path: path.join(out, "repositorio.png"),
      fullPage: true,
    });
    for (const width of [1024, 390]) {
      await page.setViewportSize({ width, height: 1100 });
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      await page.screenshot({
        path: path.join(out, "repositorio-" + width + ".png"),
        fullPage: true,
      });
    }
    connected = false;
    await page
      .getByRole("button", { name: "Consultar GitHub", exact: true })
      .click();
    await page
      .getByText(/La consulta de GitHub todavía no está conectada/)
      .waitFor();
    assert.equal(
      await page
        .getByText("Commit ficticio para navegación", { exact: true })
        .count(),
      0,
    );
    assert.deepEqual(errors, []);
    // Un fallo deliberado del catálogo no deja una página blanca y conserva reintento.
    instance.lab.failures.push({ ruta: "/platform/catalog", restantes: 6 });
    await visit("/home/comunicacion");
    await page
      .getByRole("heading", {
        name: "No se pudo abrir la aplicación",
        exact: true,
      })
      .waitFor();
    await page.screenshot({
      path: path.join(out, "aplicacion-reintento.png"),
      fullPage: true,
    });
    instance.lab.failures.length = 0;
    await page
      .getByRole("button", { name: "Reintentar aplicación", exact: true })
      .click();
    await page
      .getByText("Noticias de prueba", { exact: true })
      .waitFor();
    console.log(
      "APLICACIONES_FUENTES_BROWSER_OK; cookie RSC, Comunicación, Noticias, denegación, GitHub y reintento; capturas=" +
        out,
    );
  } finally {
    await browser?.close();
    await instance?.close();
  }
}
run().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
