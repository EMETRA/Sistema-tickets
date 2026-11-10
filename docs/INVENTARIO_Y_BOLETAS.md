# Inventario, boletas y catálogo vigente

Rama de revisión: feat/inventario_boletas_y_catalogo. El cambio requiere también el PR correspondiente de api-tickets.

- Recaudación: mod13 y proc01 se retiran del catálogo. Sus enlaces antiguos llevan a /aplicaciones/en-desuso.
- Informática: mod06 se consulta únicamente desde /espacio/accesos?tab=corporate; conserva el permiso y el gate del API. Su enlace antiguo redirige antes del gate de catálogo.
- Activos y visitas / Equipos de Informática: al registrar una ficha puede consultarse la tarjeta por empleado, recorrer sus bienes y seleccionar uno. El número institucional queda fijado; tipo, instalación y responsable se revisan antes de guardar.
- Cableado y red / Dispositivos y enlaces: permite usar un bien de la tarjeta o vincular una ficha existente de Activos. Switch/router/access point son sugerencias revisables. No se inventa la cantidad de puertos.
- Jurídico / Notificar documento: obtiene los destinos del API, muestra el destinatario efectivo y conserva datos/PDF ante fallo. Admite la prueba temporal exclusiva a fcaceres@muniguate.com y la doble confirmación con Upload.
- RRHH / Procesos / Envío de boletas de pago: revisa la nómina, las exclusiones y el PDF privado, autoriza un lote y ejecuta sus envíos secuencialmente. PRUEBA requiere un empleado y destino exclusivo al correo indicado. Hay historial, pausa/reanudación y conciliación administrativa de resultados inciertos.

La composición utiliza Button, ModuleAccessGate, PlatformField, RecordEditor y PlatformPage existentes. InventoryPicker es un organismo reutilizado por Activos y Dispositivos. PayrollWorkspace concentra el flujo de la aplicación; sus estados y operaciones se validan nuevamente en el API.

La configuración SMTP, las dos tablas nuevas, índices, permisos y orden de instalación están en api-tickets: docs/INVENTARIO_BOLETAS_Y_CATALOGO.md y sql/inventario-boletas/01_estructura.sql a 04_verificar.sql. Configurar NOTIF_CORREO_TEST_RECIPIENT antes de la prueba de Jurídico. No cambiar los destinos habituales, las cuentas del worker ni sus Compose/montajes.

Validación local:

```bash
npm run typecheck
npm run test:integracion
npm run build
node test/integracion/inventario-boletas-browser.cjs
node test/integracion/office-preview-browser.cjs
```

Los dos recorridos usan Next/BFF compilados, Chromium local y datos ficticios. No conectan Oracle ni SMTP institucional. El segundo usa el parser Office real del API y verifica que se preserven Word DOC/DOCX y Excel XLS/XLSX al instalar SheetJS localmente. Requieren api-tickets compilado en la carpeta hermana (o TICKETS_API_SOURCE), Chromium en /usr/bin/chromium y los puertos de loopback libres.

Pendiente en eme02: ejecutar los scripts revisados, contrastar las fuentes con BDSAL y recibir las pruebas controladas. El PDF institucional de ejemplo no llegó adjunto; falta contrastar la plantilla neutral con ese documento antes de aprobar el formato final.
