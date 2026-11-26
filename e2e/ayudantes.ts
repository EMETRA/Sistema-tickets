import { expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

export type Perfil = "Administración ficticia" | "Analista ficticio de Contabilidad";

/** Entra al panel con un perfil ficticio del laboratorio. */
export async function entrar(page: Page, perfil: Perfil) {
    await page.goto("/__laboratorio");
    await page.getByRole("link", { name: new RegExp(perfil) }).click();
    await page.waitForURL("**/home");
}

/** Carga los datos de ejemplo (catálogo e Informática) si el laboratorio está vacío. */
export async function cargarEjemplos(page: Page) {
    await page.goto("/__laboratorio");
    for (const boton of ["Cargar catálogo de ejemplo", "Cargar datos de ejemplo"]) {
        const b = page.getByRole("button", { name: boton });
        if (await b.count()) {
            await b.click();
            await page.waitForLoadState("networkidle");
        }
    }
}

/** Tema y preferencias de lectura guardadas en el navegador (como en Ajustes). */
export async function preferencias(
    page: Page,
    prefs: { tema?: "light" | "dark"; texto?: "normal" | "large" | "xlarge"; contraste?: "normal" | "more" },
) {
    await page.evaluate((p) => {
        if (p.tema) localStorage.setItem("panel-tema", p.tema);
        if (p.texto) localStorage.setItem("panel-texto", p.texto);
        if (p.contraste) localStorage.setItem("panel-contraste", p.contraste);
        // El recorrido guiado no se ofrece en pruebas automatizadas, pero se marca visto por si acaso.
        localStorage.setItem("panel-recorrido", "v1:omitido");
    }, prefs);
}

/** Abre una ruta y espera a que el panel termine de cargar (sin transiciones pendientes). */
export async function visitar(page: Page, ruta: string) {
    await page.goto(ruta);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("html[data-ready]")).toHaveCount(1);
    await expect(page.locator("#main-content")).toBeVisible();
}

/**
 * Auditoría WCAG 2.2 AA con axe. Excepción documentada: los huecos de «crear actividad»
 * del calendario semanal (2.5.8 «equivalente»: el botón «Crear actividad» hace lo mismo).
 */
export async function auditar(page: Page) {
    const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .exclude('[aria-label^="Crear actividad el "]')
        .exclude("#tickets-laboratorio-banner")
        .analyze();
    return violations.map((v) => ({
        regla: v.id,
        impacto: v.impact,
        ayuda: v.help,
        elementos: v.nodes.slice(0, 5).map((n) => n.target.join(" ")),
    }));
}
