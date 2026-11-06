# Pruebas del Panel con Oracle real

La rama `feat/laboratorio_oracle_tickets` añade una alternativa al laboratorio con mocks. Requiere las ramas del mismo nombre en api-tickets y api-autenticacion. La herramienta admite los APIs en `work/apis/` y este frontend en `work/web/Sistema-tickets`, además de carpetas hermanas. Para otra ubicación, define `TICKETS_ORACLE_PANEL_DIR` con la ruta del frontend antes de iniciar desde api-tickets.

La guía de instalación, cuentas y comandos está en [api-tickets/laboratorio/oracle/README.md](https://github.com/EMETRA/api-tickets/blob/feat/laboratorio_oracle_tickets/laboratorio/oracle/README.md).

Desde api-tickets ejecuta `node laboratorio/oracle/lab.cjs levantar` y después `node laboratorio/oracle/lab.cjs iniciar`. Abre **http://127.0.0.1:3140/__oracle**. El login pasa por Auth real y la DB es Oracle local; todos los datos son ficticios.

El gateway local está en `scripts/oracle-lab/gateway.cjs`. Se ejecuta desde la herramienta del laboratorio y no forma parte de las rutas desplegadas del Panel. Usa el mismo frontend, sin interceptar sus peticiones para simular respuestas. El build de desarrollo usa `.next-oracle` y `tsconfig.oracle.json`; el build normal y el laboratorio de mocks siguen separados.

Con el laboratorio activo, `node test/integracion/oracle-browser.cjs` comprueba el recorrido de tickets entre perfiles, las 12 secciones, el alta de una instalación y las dos confirmaciones. Requiere Chromium de Playwright.

Los servicios institucionales no incluidos (Noticias, Juzgado, SAT, inventario oficial y observadores) conservan su integración pendiente. Esta prueba no certifica sus flujos.
