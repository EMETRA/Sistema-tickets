# Word y Excel en los adjuntos de Tickets

El visor del ticket admite DOCX y DOC, además de XLSX y XLS. Funciona desde los
adjuntos del ticket y de sus comentarios. Mantiene el acceso autorizado al ticket
y la descarga del archivo original.

- Word: lectura con títulos, párrafos, listas y tablas para DOCX; contenido
  principal como texto para DOC antiguo. La presentación puede diferir del
  original y el visor lo indica.
- Excel: pestañas por hoja, coordenadas de celda y páginas de 50 filas. Las
  pestañas admiten flechas, Inicio y Fin desde el teclado. Los valores se muestran
  como texto; no se ejecutan macros ni se recalculan fórmulas.
- Documento dañado, protegido o demasiado grande: muestra el motivo y permite
  descargar el original o reintentar. La descarga sigue disponible si falla la
  conversión.

`FileViewer` obtiene el archivo mediante la ruta privada existente y solicita
`/api/platform/tickets/:ticketId/files/:fileId/preview` para Office. El BFF conserva
la autorización y no cachea el JSON. `OfficePreview`, dentro del organismo del
visor, presenta Word en un iframe sin permisos y con CSP restrictiva. Excel usa
una tabla con desplazamiento interno, sin insertar HTML de celdas.

La conversión ocurre en api-tickets; los documentos no se envían a visores
públicos de Microsoft o Google. El API admite hasta 10 MB de entrada para la
conversión; limita hojas, filas, columnas y texto, e informa si la vista es
parcial. Las imágenes, gráficos y formatos complejos pueden no conservarse;
siempre puede consultarse el original con su aplicación.

## Actualización y validación

Actualizar y reconstruir primero api-tickets y después este Panel con los
actualizadores existentes. Mantener el montaje de adjuntos del API. No requiere
SQL ni variables de entorno nuevas. La especificación de formatos y límites
completos está en `api-tickets/docs/VISOR_WORD_EXCEL.md`.

```bash
pnpm run typecheck
pnpm run test:integracion
pnpm run build
node test/integracion/office-preview-browser.cjs
```

El recorrido de navegador necesita el API compilado en `../api-tickets` o la ruta
indicada por `TICKETS_API_SOURCE`. Usa exclusivamente documentos sintéticos,
archivos temporales y conexiones de loopback. Recorre DOC/DOCX, XLS/XLSX, cambios
de hoja con teclado, paginación, descarga idéntica al original, fallo/reintento y
rechazo de otro usuario. Captura las vistas en 1440, 1024 y 390 px. Oracle real y
los servicios institucionales no se contactan.
