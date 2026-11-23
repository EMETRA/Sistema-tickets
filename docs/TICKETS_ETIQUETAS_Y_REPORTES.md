# Etiquetas de trabajo y reportes de Tickets

En la ficha se incorpora **Clasificación del trabajo**, después de la asignación.
El técnico responsable puede buscar etiquetas, seleccionar hasta diez y guardar
el conjunto. La búsqueda admite textos sin acentos. Se distingue lo guardado de
los cambios pendientes; resolver queda deshabilitado hasta tener al menos una
etiqueta guardada y sin cambios pendientes. El API repite todas las comprobaciones.

Los administradores pueden clasificar tickets asignados, con las dos
confirmaciones existentes. Cancelar una confirmación conserva la selección. Un
fallo conserva el borrador de etiquetas, muestra el mensaje y referencia si
existe y permite reintentar. Un conflicto de versión ofrece recuperar la
clasificación guardada, indicando que descarta la selección pendiente.

Las etiquetas se ven en lectura para quien solo puede consultar el ticket y
cuando está finalizado. Cada guardado aparece en el historial con los nombres
anteriores y nuevos. Los comentarios y los adjuntos conservan su flujo.

Los administradores acceden desde **Métricas → Por técnico y etiqueta** a:

- Filtros por período, técnico y etiqueta, con días inclusivos de Guatemala.
- Tickets resueltos únicos y agrupaciones por técnico/etiqueta.
- Detalle paginado con enlaces a las fichas de los tickets.
- CSV del resumen completo, con UTF-8/BOM, separador punto y coma, comillas
  escapadas y protección de textos que puedan interpretarse como fórmulas.

El período corresponde a la fecha de cierre. Un ticket con varias etiquetas
cuenta en cada una, pero solo una vez en el total general. La clasificación se
guarda al resolver y no cambia por una modificación posterior del catálogo.
Los cierres anteriores sin esa copia se identifican como «Sin clasificación
histórica»; no se les atribuyen etiquetas nuevas retrospectivamente.

## Actualización

No requiere tablas ni permisos nuevos. Cargar si hace falta el catálogo de
ejemplo con `api-tickets/sql/tickets/qa/etiquetas_trabajo.sql` como script en la
conexión QA habitual. Contiene únicamente INSERT de etiquetas faltantes.
Después reconstruir primero api-tickets desde QA y este Panel desde Dev con los
actualizadores habituales. No cambian los montajes ni las variables de entorno.

La especificación del API y el tratamiento de históricos están en
`api-tickets/docs/TICKETS_ETIQUETAS_Y_REPORTES.md`.

```bash
pnpm run typecheck
pnpm run test:integracion
pnpm run build
node test/integracion/ticket-etiquetas-browser.cjs
node test/integracion/ticket-admin-browser.cjs
```

El laboratorio local también incorpora clasificación, cierre obligatorio y el
contrato del reporte, con datos ficticios. Sus pruebas no consultan Oracle real.
