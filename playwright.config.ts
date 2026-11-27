import { defineConfig, devices } from "@playwright/test";

/**
 * Pruebas de extremo a extremo sobre el laboratorio local (datos ficticios, API simulado).
 *   pnpm e2e:instalar   → descarga Chromium para Playwright (una vez)
 *   pnpm e2e            → levanta el laboratorio si no está corriendo y ejecuta las pruebas
 */
const baseURL = process.env.TICKETS_LAB_TEST_URL || "http://127.0.0.1:3030";

export default defineConfig({
    testDir: "e2e",
    timeout: 90_000,
    expect: { timeout: 15_000 },
    fullyParallel: false, // el laboratorio comparte un archivo de datos entre perfiles
    workers: 1,
    retries: process.env.CI ? 1 : 0,
    reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
    use: {
        baseURL,
        viewport: { width: 1440, height: 900 },
        locale: "es-GT",
        timezoneId: "America/Guatemala",
        trace: "retain-on-failure",
    },
    projects: [
        { name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    ],
    webServer: {
        command: "pnpm laboratorio",
        url: baseURL + "/__laboratorio",
        reuseExistingServer: true,
        timeout: 240_000,
    },
});
