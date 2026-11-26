import { expect, test } from "@playwright/test";
import { entrar, preferencias, visitar } from "./ayudantes";

test.describe("Lectura y accesibilidad", () => {
    test.beforeEach(async ({ page }) => entrar(page, "Administración ficticia"));

    test("con letra muy grande se llega al final de la página", async ({ page }) => {
        await preferencias(page, { texto: "xlarge" });
        await visitar(page, "/ajustes");
        const main = page.locator("#main-content");
        await main.evaluate((el) => el.scrollTo(0, el.scrollHeight));
        await expect(page.getByRole("heading", { name: "Administración" })).toBeInViewport();
        // El panel mide exactamente la ventana (sin desbordes por el zoom).
        const alto = await page
            .locator("[data-workspace-shell]")
            .evaluate((el) => el.getBoundingClientRect().height);
        expect(Math.round(alto)).toBe(page.viewportSize()!.height);
    });

    test("el modo oscuro se aplica antes del primer pintado (sin destello)", async ({ page }) => {
        await preferencias(page, { tema: "dark" });
        await visitar(page, "/home");
        expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
        await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    });

    test("Ajustes cambia el tamaño del texto al momento", async ({ page }) => {
        await visitar(page, "/ajustes");
        await page.getByRole("radio", { name: /Muy grande/ }).click();
        await expect(page.locator("html")).toHaveAttribute("data-text-size", "xlarge");
        await page.getByRole("button", { name: "Restablecer valores normales" }).click();
        await expect(page.locator("html")).toHaveAttribute("data-text-size", "normal");
    });
});

test.describe("Recorrido guiado", () => {
    test("se recorre con el teclado y recuerda que se completó", async ({ page }) => {
        await entrar(page, "Analista ficticio de Contabilidad");
        await preferencias(page, {});
        await visitar(page, "/ayuda");
        await page.getByRole("button", { name: "Ver recorrido guiado" }).click();
        const dialogo = page.getByRole("dialog", { name: /bienvenida/i });
        await expect(dialogo).toBeVisible();
        await expect(page.getByRole("button", { name: "Empezar" })).toBeFocused();
        await page.keyboard.press("Enter");
        await expect(page.getByRole("heading", { name: "Tu menú, siempre a la izquierda" })).toBeVisible();
        for (let i = 0; i < 20; i++) await page.keyboard.press("ArrowRight");
        await page.getByRole("button", { name: "Terminar" }).click();
        await expect(page.getByRole("dialog")).toHaveCount(0);
        expect(await page.evaluate(() => localStorage.getItem("panel-recorrido"))).toBe("v1:completado");
    });
});

test.describe("Calendario", () => {
    test("una reunión virtual muestra «Unirse a la reunión»", async ({ page }) => {
        await entrar(page, "Administración ficticia");
        await preferencias(page, {});
        await visitar(page, "/espacio/calendario");
        await page
            .getByRole("button", { name: /Seguimiento con Recaudación/ })
            .first()
            .click();
        const unirse = page.getByRole("link", { name: /Unirse a la reunión/ });
        await expect(unirse).toHaveAttribute("href", /^https:\/\/meet\.google\.com\//);
        await expect(unirse).toHaveAttribute("target", "_blank");
    });

    test("el editor marca los campos con mensajes claros", async ({ page }) => {
        await entrar(page, "Administración ficticia");
        await preferencias(page, {});
        await visitar(page, "/espacio/calendario");
        await page.getByRole("button", { name: "Crear actividad", exact: true }).click();
        const nombre = page.locator('[data-field="nombre"] input');
        await nombre.fill("   ");
        await page.getByRole("button", { name: "Registrar" }).click();
        await expect(page.getByText("Completa «Nombre».")).toBeVisible();
        await expect(nombre).toBeFocused();
    });
});
