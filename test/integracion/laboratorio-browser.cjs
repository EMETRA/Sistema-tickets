// Iniciar primero `pnpm laboratorio`. Solo modifica datos ficticios de esa instancia.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { chromium } = require("playwright");
const base = process.env.TICKETS_LAB_TEST_URL || "http://127.0.0.1:3030";
async function run() {
  assert.match(base, /^http:\/\/127\.0\.0\.1:\d+$/);
  const browser = await chromium.launch({
    ...(fs.existsSync("/usr/bin/chromium")
      ? { executablePath: "/usr/bin/chromium" }
      : {}),
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1050 },
  });
  page.setDefaultTimeout(45000);
  const errors = [],
    failed = [],
    external = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400 && r.url().startsWith(base + "/api/"))
      failed.push([r.status(), r.url()]);
  });
  page.on("request", (r) => {
    if (/^https?:/.test(r.url()) && new URL(r.url()).hostname !== "127.0.0.1")
      external.push(r.url());
  });
  const visit = async (path) => {
    await page.goto(base + path);
    await page.waitForLoadState("networkidle");
  };
  const enter = async (name) => {
    await visit("/__laboratorio");
    await page.getByRole("link", { name }).click();
    await page.getByRole("heading", { name: "Tus solicitudes y aplicaciones" }).waitFor();
    await page.waitForLoadState("networkidle");
  };
  const confirm = async () => {
    await page
      .getByRole("button", { name: "Confirmar revisión · 1 de 2" })
      .click();
    await page
      .getByRole("checkbox", {
        name: "He revisado la acción y quiero aplicarla.",
      })
      .check();
    await page
      .getByRole("button", { name: "Confirmar y aplicar · 2 de 2" })
      .click();
  };
  const title = "Ticket ficticio de recorrido " + Date.now();
  try {
    await enter(/Analista ficticio/);
    await visit("/tickets-creation");
    await page.locator("#subject").fill(title);
    await page.locator("#department").selectOption({ label: "Técnico" });
    await page
      .locator('[contenteditable="true"]')
      .fill("Descripción ficticia para revisar el recorrido local.");
    await page
      .getByRole("button", { name: "Crear ticket", exact: true })
      .last()
      .click();
    await page
      .getByRole("status")
      .filter({ hasText: /Ticket LAB-.*creado correctamente/ })
      .waitFor();
    await enter(/Secretaría ficticia/);
    await visit("/espacio/asignacion");
    let row = page.getByRole("row").filter({ hasText: title });
    await row.getByRole("button", { name: "Asignar", exact: true }).click();
    await page
      .getByLabel("Responsable *", { exact: true })
      .selectOption({ label: "Técnico ficticio" });
    await page
      .getByRole("button", { name: "Asignar ticket", exact: true })
      .click();
    await page
      .getByText("El cambio del ticket quedó registrado.", { exact: true })
      .waitFor();
    await enter(/Técnico ficticio/);
    await visit("/espacio/asignacion");
    row = page.getByRole("row").filter({ hasText: title });
    await row
      .getByRole("button", { name: "Iniciar atención", exact: true })
      .click();
    await row.getByRole("button", { name: "Resolver", exact: true }).waitFor();
    await row.getByRole("button", { name: "Resolver", exact: true }).click();
    await row.getByText("Resuelto", { exact: true }).waitFor();
    await enter(/Administración ficticia/);
    for (const section of [
      "asignacion",
      "calendario",
      "metricas",
      "inventario",
      "red",
      "sistemas",
      "infraestructura",
      "solicitudes",
      "organizacion",
      "accesos",
      "auditoria",
      "busqueda",
    ]) {
      await visit("/espacio/" + section);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        "Desborde: " + section,
      );
    }
    await visit("/espacio/inventario");
    await page
      .getByRole("button", { name: "Registrar instalación", exact: true })
      .click();
    const editor = page.getByRole("dialog", {
      name: "Registrar instalación",
      exact: true,
    });
    await editor
      .getByLabel("Nombre *", { exact: true })
      .fill("Instalación ficticia " + Date.now());
    await editor
      .getByLabel("Dirección *", { exact: true })
      .fill("Ubicación de prueba");
    await editor
      .getByLabel("Técnico responsable *", { exact: true })
      .selectOption({ label: "Técnico ficticio" });
    await editor.getByRole("button", { name: "Guardar", exact: true }).click();
    await confirm();
    await page
      .getByText("El registro se guardó correctamente.", { exact: true })
      .waitFor();
    await enter(/Jefatura ficticia/);
    await visit("/espacio/calendario");
    await page
      .getByText("Actividad privada de ejemplo", { exact: false })
      .first()
      .waitFor();
    await enter(/Analista ficticio/);
    await visit("/espacio/accesos");
    await page
      .getByText("No tienes permiso para consultar esta sección.", {
        exact: true,
      })
      .waitFor();
    assert.deepEqual(errors, []);
    assert.deepEqual(failed, []);
    assert.deepEqual(external, []);
    console.log(
      "LABORATORIO_BROWSER_OK: crear/asignar/iniciar/resolver ticket entre perfiles; 12 secciones; crear instalación con ambas confirmaciones; calendario privado; alcance; sin peticiones externas.",
    );
  } finally {
    await browser.close();
  }
}
run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
