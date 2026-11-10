# Detalle de tickets, comentarios y adjuntos

El API coordinado corrige la diferencia entre el `ID` numérico revisado y el `ID` de texto que ejecuta GraphQL. Conserva las dos confirmaciones y la comprobación de integridad. También corrige la lectura de la primaria `"id"` de adjuntos, confirmada en Oracle.

Se retiraron los hooks, operaciones GraphQL y la ruta BFF antigua de `ticketComments`/`addTicketComment`, sin consumidores en las pantallas actuales y sin soporte en el API. La conversación usa `ticketMessages`/`sendTicketMessage`. La revisión del contrato incluye ahora todas las operaciones de tickets.

Cambios del Panel:

- Un ticket cuyo código es NULL muestra `#21 · Título` y su número en el listado.
- Las acciones de administración usan el permiso efectivo del contexto de plataforma, incluyendo cuentas con perfil `USER_ADMIN`. Los botones se corresponden con el estado del ticket y el responsable; el API continúa verificando el alcance y las versiones. Si falla una acción, se puede actualizar el detalle conservando el borrador de conversación.
- El envío identifica la acción como **Enviar un comentario al ticket** y pide también el nombre del remitente. Un nombre ausente se presenta como «Usuario N» para evitar errores al construir el avatar.
- Cancelar la confirmación conserva el borrador y los archivos sin presentarlo como un fallo de envío. Ante un error de envío se conservan ambos para reintentar.
- Los archivos seleccionados se copian antes de limpiar el input, para que una actualización diferida de React no pierda la selección.
- El visor presenta la referencia de error para su seguimiento, permite reintento y distingue acceso denegado de archivo no disponible. Cada ticket reinicia su estado de detalle al cambiar de ID.

Actualizar primero **api-tickets QA** y después **Sistema-tickets Dev**. No hace falta ejecutar SQL. Repetir desde el Panel la revisión del comentario después de actualizar.

## Comprobación local

```bash
npm run typecheck
npm run test:integracion
npm run build
node test/integracion/ticket-admin-browser.cjs
node test/integracion/tickets-aplicaciones-browser.cjs
```

El recorrido de administrador usa el Panel y BFF compilados, una sesión con perfil `USER_ADMIN` y administración efectiva. Comprueba código nulo, nombre ausente, dos confirmaciones antes de enviar, cancelación sin pérdida del borrador y conservación de texto/archivos ante un fallo multipart controlado. El visor usa el lector compilado real del API y una fuente Oracle ficticia que exige la primaria entrecomillada; verifica la descarga byte a byte y un 403 sin consultar metadatos del archivo. Se revisan 1440/1024/390 px. La coerción y vinculación de la confirmación se verifican separadamente en las pruebas del API con el DTO y la ejecución de GraphQL reales. No se usa Oracle institucional ni archivos reales del usuario.
