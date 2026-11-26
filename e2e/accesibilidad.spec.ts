import { expect, test } from "@playwright/test";
import { auditar, cargarEjemplos, entrar, preferencias, visitar } from "./ayudantes";

/**
 * Cada pantalla principal debe cumplir WCAG 2.2 AA (axe) en tema claro y oscuro.
 * Si una prueba falla, el mensaje lista la regla, la ayuda de axe y los elementos.
 */
const PANTALLAS_ADMIN = [
    "/home",
    "/espacio/asignacion",
    "/mis-tickets",
    "/espacio/calendario",
    "/aplicaciones",
    "/home/informatica",
    "/espacio/accesos",
    "/espacio/metricas",
    "/espacio/auditoria",
    "/espacio/busqueda",
    "/espacio/inventario",
    "/espacio/red",
    "/espacio/sistemas",
    "/espacio/infraestructura",
    "/espacio/solicitudes",
    "/espacio/organizacion",
    "/ajustes",
    "/ayuda",
];
const PANTALLAS_USUARIO = ["/home", "/mis-tickets", "/espacio/calendario", "/aplicaciones", "/ajustes"];

test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await cargarEjemplos(page);
    await page.close();
});

for (const tema of ["light", "dark"] as const) {
    test.describe(`Administración · tema ${tema === "light" ? "claro" : "oscuro"}`, () => {
        test.beforeEach(async ({ page }) => {
            await entrar(page, "Administración ficticia");
            await preferencias(page, { tema });
        });
        for (const ruta of PANTALLAS_ADMIN)
            test(`${ruta} cumple WCAG 2.2 AA`, async ({ page }) => {
                await visitar(page, ruta);
                expect(await auditar(page)).toEqual([]);
            });
    });

    test.describe(`Usuario · tema ${tema === "light" ? "claro" : "oscuro"}`, () => {
        test.beforeEach(async ({ page }) => {
            await entrar(page, "Analista ficticio de Contabilidad");
            await preferencias(page, { tema });
        });
        for (const ruta of PANTALLAS_USUARIO)
            test(`${ruta} cumple WCAG 2.2 AA`, async ({ page }) => {
                await visitar(page, ruta);
                expect(await auditar(page)).toEqual([]);
            });
    });
}

test("alto contraste y letra muy grande también cumplen AA", async ({ page }) => {
    await entrar(page, "Administración ficticia");
    await preferencias(page, { tema: "dark", contraste: "more", texto: "xlarge" });
    for (const ruta of ["/home", "/espacio/calendario", "/ajustes"]) {
        await visitar(page, ruta);
        expect(await auditar(page)).toEqual([]);
    }
});
