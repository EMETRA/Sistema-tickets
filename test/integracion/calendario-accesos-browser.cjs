// Next compilado + adaptador local. No consulta Oracle ni servicios institucionales.
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { chromium } = require("playwright");
const { start } = require("../../scripts/laboratorio/iniciar.cjs");
const root = path.resolve(__dirname, "../..");
const load = require("./load-ts.cjs")(root);
const { guatemalaDay } = load("src/platform/dates.ts");
const { weekDays } = load("src/platform/calendar.ts");

async function run() {
  const temp = await fs.mkdtemp(
    path.join(os.tmpdir(), "tickets-calendario-accesos-"),
  );
  const out = process.env.QA_SCREENSHOT_DIR || path.join(temp, "capturas");
  await fs.mkdir(out, { recursive: true });
  let instance, browser;
  const errors = [],
    blocked = [];
  const days = weekDays(guatemalaDay());
  try {
    instance = await start({
      port: Number(process.env.QA_CALENDAR_PORT || 3970),
      file: path.join(temp, "estado.json"),
      compiled: true,
    });
    const { state } = instance.lab;
    await state.change((s) => {
      const row = (
        name,
        first,
        last,
        scope = "EQUIPO",
        team = s.ids.finanzas,
        owner = 3,
      ) => ({
        id: randomUUID(),
        nombre: name,
        equipoId: team,
        usuarioId: owner,
        visibilidad: scope,
        estado: "ACTIVO",
        version: 1,
        creadoEn: new Date().toISOString(),
        actualizadoEn: new Date().toISOString(),
        datos: {
          inicio: first,
          fin: last,
          lugar: "Sala de prueba",
          descripcion: "Datos ficticios de verificación",
        },
      });
      const at = (index, hour) => days[index] + "T" + hour + ":00-06:00";
      s.resources.actividades = [
        row("Reunión de equipo · prueba", at(0, "09:00"), at(0, "10:00")),
        row(
          "Actividad institucional · prueba",
          at(3, "14:00"),
          at(3, "15:00"),
          "EMPRESA",
        ),
        row("Actividad simultánea A", at(1, "10:00"), at(1, "11:00")),
        row("Actividad simultánea B", at(1, "10:15"), at(1, "10:45")),
        row("Jornada de varios días", at(4, "15:00"), at(5, "10:00")),
        row("Guardia de sábado", at(5, "11:00"), at(5, "12:00")),
        row("Privada de jefatura", at(2, "09:00"), at(2, "10:00"), "PRIVADA"),
        row(
          "Equipo ajeno",
          at(2, "11:00"),
          at(2, "12:00"),
          "EQUIPO",
          s.ids.it,
          1,
        ),
      ];
    });
    browser = await chromium.launch({
      executablePath: process.env.QA_CHROMIUM_PATH || "/usr/bin/chromium",
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1100 },
    });
    page.setDefaultTimeout(25000);
    page.on("pageerror", (e) => errors.push(e.message));
    await page.route("**/*", (route) => {
      if (
        /^https?:/.test(route.request().url()) &&
        new URL(route.request().url()).hostname !== "127.0.0.1"
      ) {
        blocked.push(new URL(route.request().url()).origin);
        return route.abort();
      }
      return route.continue();
    });
    // El gateway puede estar listo antes que Next; el control de sesión espera su hidratación.
    for (let i = 0; i < 100; i++) {
      if (instance.child.exitCode !== null)
        throw Error("Next terminó antes de iniciar.");
      try {
        if ((await fetch(instance.base + "/home")).status < 500) break;
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const visit = async (url) => {
      await page.goto(instance.base + url);
      await page.waitForLoadState("networkidle");
    };
    const login = async (role, title) => {
      await visit("/__laboratorio");
      await page.getByRole("link", { name: role }).click();
      await page.getByRole("heading", { name: title, exact: true }).waitFor();
      await page.waitForLoadState("networkidle");
    };
    const fit = async () =>
      assert.ok(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <= innerWidth &&
            document.querySelector("#main-content").scrollWidth <=
              document.querySelector("#main-content").clientWidth + 1,
        ),
        "Desborde horizontal de la página",
      );
    const shot = async (name) => {
      await fit();
      await page.screenshot({
        path: path.join(out, name + ".png"),
        fullPage: true,
      });
    };
    const confirm = async () => {
      await page
        .getByRole("dialog", { name: "Revisa el cambio", exact: true })
        .waitFor();
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
    const calendar = page.getByRole("region", {
      name: "Calendario semanal",
      exact: true,
    });
    const nav = page.getByRole("navigation", {
      name: "Personas y accesos",
      exact: true,
    });
    await login(/Administración ficticia/, "Control de Informática");
    await visit("/espacio/calendario");
    assert.equal(
      await page
        .getByRole("button", { name: "Semana", exact: true })
        .getAttribute("aria-pressed"),
      "true",
    );
    await page.getByLabel("Ir a fecha", { exact: true }).fill(days[2]);
    await page.getByLabel("Fin de semana", { exact: true }).uncheck();
    await calendar.getByRole("button", { name: /Reunión de equipo/ }).waitFor();
    assert.equal(
      await calendar.locator('[aria-current="date"]').count(),
      days.slice(0, 5).includes(guatemalaDay()) ? 1 : 0,
    );
    const simultaneous = await calendar
      .getByRole("button", { name: /Actividad simultánea/ })
      .all();
    assert.equal(simultaneous.length, 2);
    const boxes = await Promise.all(simultaneous.map((el) => el.boundingBox()));
    assert.ok(
      boxes[0].x + boxes[0].width <= boxes[1].x ||
        boxes[1].x + boxes[1].width <= boxes[0].x,
      "Las actividades simultáneas no se tapan",
    );
    assert.ok(
      (await simultaneous[0].locator("strong").boundingBox()).height > 0,
      "El título del evento es legible",
    );
    await shot("calendario-semanal-admin");
    await page
      .getByRole("button", { name: "Mostrar sábado y domingo" })
      .click();
    await calendar.getByRole("button", { name: /Guardia de sábado/ }).waitFor();
    assert.equal(
      await calendar
        .getByRole("button", { name: "Jornada de varios días" })
        .count(),
      2,
    );
    await page.getByRole("button", { name: "Privadas", exact: true }).click();
    assert.equal(
      await calendar
        .getByRole("button", { name: /Privada de jefatura/ })
        .count(),
      0,
    );
    await page.getByRole("button", { name: "Privadas", exact: true }).click();
    await page.getByRole("button", { name: "Mes", exact: true }).click();
    await page.getByRole("region", { name: "Calendario mensual" }).waitFor();
    await page.getByRole("button", { name: "Agenda", exact: true }).click();
    await page.getByRole("list", { name: "Agenda de actividades" }).waitFor();
    await page.getByRole("button", { name: "Semana", exact: true }).click();
    await page
      .getByRole("button", { name: "Semana siguiente", exact: true })
      .click();
    await page
      .getByText("No hay actividades registradas para esta semana.", {
        exact: true,
      })
      .waitFor();
    await page
      .getByRole("button", { name: "Semana anterior", exact: true })
      .click();
    await calendar.getByRole("button", { name: /Reunión de equipo/ }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Editar", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByLabel("Nombre *", { exact: true })
      .fill("Reunión actualizada · prueba");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Guardar", exact: true })
      .click();
    assert.ok(
      state.data.resources.actividades.some(
        (row) => row.nombre === "Reunión de equipo · prueba",
      ),
    );
    await confirm();
    await calendar
      .getByRole("button", { name: /Reunión actualizada/ })
      .waitFor();
    const count = state.data.resources.actividades.length;
    await calendar
      .getByRole("button", {
        name: "Crear actividad el " + days[2] + " a las 13:00",
        exact: true,
      })
      .click();
    const editor = page.getByRole("dialog");
    assert.equal(
      await editor.getByLabel(/^Inicio/).inputValue(),
      days[2] + "T13:00",
    );
    await editor
      .getByLabel("Nombre *", { exact: true })
      .fill("Nueva actividad · prueba");
    await editor.getByRole("button", { name: "Guardar", exact: true }).click();
    assert.equal(state.data.resources.actividades.length, count);
    await confirm();
    await calendar.getByRole("button", { name: /Nueva actividad/ }).waitFor();
    assert.equal(state.data.resources.actividades.length, count + 1);

    await visit("/espacio/solicitudes");
    assert.equal(await nav.getByRole("link").count(), 6);
    await nav.getByRole("link", { name: "Perfiles", exact: true }).click();
    await page
      .getByRole("button", { name: "Crear perfil", exact: true })
      .waitFor();
    assert.match(page.url(), /tab=profiles$/);
    await nav.getByRole("link", { name: "Roles", exact: true }).click();
    await page
      .getByRole("button", { name: "Crear rol", exact: true })
      .waitFor();
    await page.goBack();
    await page
      .getByRole("button", { name: "Crear perfil", exact: true })
      .waitFor();
    await shot("accesos-perfiles");
    for (const [tab, singular, name] of [
      ["permissions", "permiso", "QA_CALENDARIO_LEER"],
      ["roles", "rol", "Rol de calendario QA"],
      ["profiles", "perfil", "Perfil de calendario QA"],
    ]) {
      await nav
        .getByRole("link", {
          name: {
            permissions: "Permisos",
            roles: "Roles",
            profiles: "Perfiles",
          }[tab],
          exact: true,
        })
        .click();
      await page
        .getByRole("button", { name: "Crear " + singular, exact: true })
        .click();
      const form = page.getByRole("dialog", {
        name: "Crear " + singular,
        exact: true,
      });
      await form.getByLabel("Nombre", { exact: true }).fill(name);
      await form
        .getByLabel("Descripción", { exact: true })
        .fill("Catálogo ficticio para verificar navegación");
      const before = state.data.catalog[tab].length;
      await form
        .getByRole("button", { name: "Guardar datos", exact: true })
        .click();
      await page
        .getByRole("dialog", { name: "Revisa el cambio", exact: true })
        .waitFor();
      assert.equal(state.data.catalog[tab].length, before);
      if (tab === "permissions") {
        await page
          .getByRole("dialog", { name: "Revisa el cambio", exact: true })
          .getByRole("button", { name: "Cancelar", exact: true })
          .click();
        assert.equal(
          state.data.catalog[tab].length,
          before,
          "Cancelar no modifica el catálogo",
        );
        await form
          .getByRole("button", { name: "Guardar datos", exact: true })
          .click();
      }
      await confirm();
      await page.getByRole("row").filter({ hasText: name }).waitFor();
      assert.equal(state.data.catalog[tab].length, before + 1);
      await page
        .getByRole("row")
        .filter({ hasText: name })
        .getByRole("button", { name: "Editar y ver relaciones" })
        .click();
      const edit = page.getByRole("dialog", {
        name: "Editar " + singular,
        exact: true,
      });
      await edit
        .getByLabel("Descripción", { exact: true })
        .fill("Descripción actualizada QA");
      await edit
        .getByRole("button", { name: "Guardar datos", exact: true })
        .click();
      await confirm();
      await page
        .getByRole("row")
        .filter({ hasText: name })
        .getByText("Descripción actualizada QA", { exact: true })
        .waitFor();
    }
    for (const [tab, name, option, label] of [
      [
        "roles",
        "Rol de calendario QA",
        "QA_CALENDARIO_LEER",
        "Permisos del rol",
      ],
      [
        "profiles",
        "Perfil de calendario QA",
        "Rol de calendario QA",
        "Roles del perfil",
      ],
    ]) {
      await nav
        .getByRole("link", {
          name: tab === "roles" ? "Roles" : "Perfiles",
          exact: true,
        })
        .click();
      await page
        .getByRole("row")
        .filter({ hasText: name })
        .getByRole("button", { name: "Editar y ver relaciones" })
        .click();
      const form = page.getByRole("dialog");
      await form
        .getByRole("group", { name: label })
        .getByRole("checkbox", { name: new RegExp(option) })
        .check();
      await form.getByRole("searchbox").fill("sin coincidencias");
      assert.equal(
        await form
          .getByRole("checkbox", { name: new RegExp(option) })
          .isChecked(),
        true,
        "Filtrar conserva las relaciones seleccionadas",
      );
      await shot("accesos-" + tab + "-relaciones");
      await form
        .getByRole("button", { name: "Revisar relaciones", exact: true })
        .click();
      await confirm();
      await page
        .getByText("Los accesos se actualizaron.", { exact: false })
        .waitFor();
    }
    const profile = state.data.catalog.profiles.find(
      (row) => row.nombre === "Perfil de calendario QA",
    );
    const role = state.data.catalog.roles.find(
      (row) => row.nombre === "Rol de calendario QA",
    );
    const permission = state.data.catalog.permissions.find(
      (row) => row.nombre === "QA_CALENDARIO_LEER",
    );
    assert.ok(
      state.data.catalog.profileRoles.some(
        (row) => row.perfilId === profile.id && row.rolId === role.id,
      ),
    );
    assert.ok(
      state.data.catalog.rolePermissions.some(
        (row) => row.rolId === role.id && row.permisoId === permission.id,
      ),
    );
    await nav.getByRole("link", { name: "Módulos", exact: true }).click();
    await page
      .getByRole("button", { name: "Registrar módulo", exact: true })
      .click();
    const moduleForm = page.getByRole("dialog", {
      name: "Registrar módulo",
      exact: true,
    });
    for (const [label, value] of [
      ["Nombre *", "Módulo de prueba QA"],
      ["Código de aplicación *", "informatica"],
      ["Nombre de aplicación *", "Informática QA"],
      ["Código de sección *", "pruebas"],
      ["Nombre de sección *", "Pruebas"],
      ["Código de módulo *", "mod01"],
      ["Icono registrado *", "chart-bar-solid"],
    ]) {
      const field =
        label === "Nombre *"
          ? moduleForm.getByLabel(label, { exact: true })
          : moduleForm.getByLabel(new RegExp("^" + label.replace(/ \*$/, "")));
      await field.fill(value);
    }
    await moduleForm
      .getByLabel(/^Permiso LEER/)
      .selectOption("QA_CALENDARIO_LEER");
    await moduleForm
      .getByRole("button", { name: "Guardar", exact: true })
      .click();
    await confirm();
    await page
      .getByRole("button", { name: "Módulo de prueba QA", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Editar", exact: true })
      .click();
    await page
      .getByRole("dialog")
      .getByLabel("Nombre *", { exact: true })
      .fill("Módulo actualizado QA");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Guardar", exact: true })
      .click();
    await confirm();
    await page
      .getByRole("button", { name: "Módulo actualizado QA", exact: true })
      .waitFor();
    assert.equal(
      state.data.resources.modulos[0].datos.leer,
      "QA_CALENDARIO_LEER",
    );
    assert.ok(
      state.data.audit.length >= 12,
      "Los cambios quedan en el historial ficticio",
    );

    await nav.getByRole("link", { name: "Roles", exact: true }).click();
    await page.setViewportSize({ width: 390, height: 1100 });
    await shot("accesos-movil");
    await page
      .getByRole("row")
      .filter({ hasText: "Rol de calendario QA" })
      .getByRole("button", { name: "Editar y ver relaciones" })
      .click();
    const mobileDialog = page.getByRole("dialog");
    await mobileDialog.waitFor();
    const mobileBox = await mobileDialog.boundingBox();
    assert.ok(mobileBox.x >= 0 && mobileBox.x + mobileBox.width <= 391);
    await shot("accesos-editor-movil");
    await mobileDialog
      .getByRole("button", { name: "Cerrar", exact: true })
      .click();
    await page.setViewportSize({ width: 1440, height: 1100 });
    const catalogFailure = "**/api/platform/rbac";
    await page.route(catalogFailure, (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Catálogo temporalmente no disponible · prueba",
        }),
      }),
    );
    await visit("/espacio/accesos?tab=roles");
    await page
      .getByRole("alert")
      .filter({ hasText: "Catálogo temporalmente no disponible" })
      .waitFor();
    assert.equal(
      await nav.getByRole("link").count(),
      6,
      "La navegación permanece visible ante un fallo de catálogo",
    );
    await page.unroute(catalogFailure);
    await page.getByRole("button", { name: "Reintentar", exact: true }).click();
    await page
      .getByRole("button", { name: "Crear rol", exact: true })
      .waitFor();
    assert.equal(
      await page
        .getByRole("alert")
        .filter({ hasText: "Catálogo temporalmente no disponible" })
        .count(),
      0,
    );

    await login(/Jefatura ficticia/, "Tu unidad, en un solo lugar");
    await visit("/espacio/calendario");
    await calendar
      .getByRole("button", { name: /Actividad institucional/ })
      .click();
    const readOnly = page.getByRole("dialog");
    await readOnly
      .getByText("Este registro está disponible solo para consulta.", {
        exact: true,
      })
      .waitFor();
    assert.equal(
      await readOnly
        .getByRole("button", { name: "Editar", exact: true })
        .count(),
      0,
    );
    assert.equal(
      await readOnly
        .getByRole("button", { name: "Retirar", exact: true })
        .count(),
      0,
    );
    await readOnly
      .getByRole("button", { name: "Documentos", exact: true })
      .click();
    assert.equal(
      await readOnly
        .getByRole("button", { name: "Adjuntar archivo", exact: true })
        .count(),
      0,
    );
    await readOnly.getByRole("button", { name: "Cerrar", exact: true }).click();
    const companyRecord = state.data.resources.actividades.find(
      (row) => row.visibilidad === "EMPRESA",
    );
    await visit("/espacio/registro/actividades/" + companyRecord.id);
    await page
      .getByRole("dialog")
      .getByText("Este registro está disponible solo para consulta.", {
        exact: true,
      })
      .waitFor();
    assert.equal(
      await page
        .getByRole("dialog")
        .getByRole("button", { name: "Editar", exact: true })
        .count(),
      0,
    );
    await visit("/espacio/solicitudes");
    assert.deepEqual(await nav.getByRole("link").allTextContents(), [
      "Solicitudes de acceso",
    ]);
    await login(/Analista ficticio/, "Tus solicitudes y aplicaciones");
    await visit("/espacio/calendario");
    await calendar
      .getByRole("button", { name: /Reunión actualizada/ })
      .waitFor();
    assert.equal(
      await calendar
        .getByRole("button", { name: /Privada de jefatura|Equipo ajeno/ })
        .count(),
      0,
    );
    assert.equal(
      await page
        .getByRole("button", { name: "Crear actividad", exact: true })
        .count(),
      0,
    );
    for (const width of [1920, 1440, 1024, 768, 390]) {
      await page.setViewportSize({ width, height: 1100 });
      await shot("calendario-usuario-" + width);
    }
    const failing = "**/api/platform/records/actividades?*";
    await page.route(failing, (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          message: "Calendario temporalmente no disponible · prueba",
        }),
      }),
    );
    await visit("/espacio/calendario");
    await page
      .getByRole("alert")
      .getByText("Calendario temporalmente no disponible · prueba", {
        exact: false,
      })
      .waitFor();
    assert.equal(
      await page
        .getByText("No hay actividades registradas para esta semana.", {
          exact: true,
        })
        .count(),
      0,
      "Un fallo no se muestra como calendario vacío",
    );
    await page.unroute(failing);
    await page
      .getByRole("button", { name: "Reintentar calendario", exact: true })
      .click();
    await calendar
      .getByRole("button", { name: /Reunión actualizada/ })
      .waitFor();
    await visit("/espacio/accesos?tab=roles");
    await page
      .getByText("No tienes permiso para consultar esta sección.", {
        exact: true,
      })
      .waitFor();
    assert.equal(await nav.count(), 0);
    assert.deepEqual(errors, []);
    assert.deepEqual(blocked, []);
    await fs.writeFile(
      path.join(out, "resultado.json"),
      JSON.stringify(
        {
          calendario: [
            "semana predeterminada",
            "mes",
            "agenda",
            "solapamientos",
            "varios días",
            "filtros",
            "fin de semana",
            "crear y editar",
            "solo lectura de empresa",
            "privacidad",
          ],
          accesos: [
            "navegación con URL y Atrás",
            "altas y edición de tres catálogos",
            "relaciones",
            "módulos con permisos",
            "doble confirmación",
            "historial",
          ],
          anchos: [1920, 1440, 1024, 768, 390],
          fuentes: "Solo datos ficticios; sin Oracle",
          erroresReact: errors,
        },
        null,
        2,
      ),
    );
    console.log("CALENDARIO_ACCESOS_BROWSER_OK; capturas=" + out);
  } finally {
    await browser?.close();
    await instance?.close();
  }
}
run().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
