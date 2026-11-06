# Servidores y logs

La ruta `/espacio/infraestructura` mantiene la línea visual del Panel: superficies blancas, bordes suaves y acentos azules. La vista **Monitoreo** separa la selección de servidor y vigencia de la observación, cuatro indicadores de recursos, contenedores y extractos de logs. **Servidores y contenedores** conserva los formularios y fichas del catálogo con las confirmaciones administrativas existentes.

`ServerMonitor` es un organismo reutilizable. Las etiquetas, filtros y mensajes de observaciones están en `src/platform/monitoring.ts`. Los datos provienen exclusivamente del API; no se simulan tendencias ni se presenta `running` como sinónimo de `healthy`. CPU, memoria y disco muestran la última medición, no una serie histórica; tiempo activo se refiere al servidor. Las mediciones vencidas quedan señaladas. Si falla una actualización se conserva la observación anterior con el aviso de que no confirma el estado actual.

La búsqueda filtra nombre, imagen o versión y puede combinarse con ejecución, atención o detención. **Requieren atención** incluye healthcheck fallido, reinicio y estado `dead`; un contenedor detenido no se considera automáticamente averiado.

Los logs se solicitan con `?logs=1` únicamente después de activar la consulta y si el bootstrap incluye `capabilities.logs`. El API conserva la autoridad sobre permisos y alcance. Los botones **Ver logs** seleccionan el contenedor, sin ejecutar órdenes en el servidor. La selección permanece durante la actualización automática cada minuto y al volver del catálogo. Cambiar de servidor limpia la observación, el extracto y la selección anteriores; se cancelan peticiones pendientes. Una respuesta cancelada no reemplaza al servidor vigente.

El observador debe habilitar cada nombre exacto mediante `logContainers`. La [guía de fuentes reales de api-tickets](https://github.com/EMETRA/api-tickets/blob/QA/docs/plataforma/FUENTES_REALES.md) incluye los comandos de eme02 y cómo actualizar la copia instalada sin tocar sus credenciales, unidades ni contenedores de negocio. El extracto abarca cinco minutos, hasta cien líneas y límites de tamaño. Se diferencian lectura deshabilitada, ausencia de actividad, error y límite alcanzado. Las observaciones anteriores al campo `logsEstado` muestran un mensaje compatible que no supone una causa concreta.

No requiere DDL ni migración: la información adicional queda en el JSON de observaciones existente. El observador y el API pueden actualizarse antes del Panel. El Panel también admite observaciones antiguas.

Validación local: `npm run typecheck`, `npm run test:integracion`, `npm run build -- --webpack` y `node test/integracion/infraestructura-browser.cjs`. La prueba de navegador utiliza el Panel compilado y un backend ficticio; no contacta Oracle, Docker ni servidores institucionales. Verifica filtros, permiso de logs, selección persistente, cambio de servidor, fallo de lectura, medición vencida y anchuras de 1440, 1024 y 390 px.
