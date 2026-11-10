# Métricas y funciones corporativas

## Cambios visibles

En **Personas y accesos → Funciones corporativas**, la lista de funciones utiliza el mismo selector que perfiles, roles y permisos. Incluye búsqueda, resaltado de selección y contador de seleccionadas/disponibles/mostradas. Su área de opciones tiene una altura máxima de 290 px y desplazamiento interno; el botón Guardar queda fuera de esa área. Buscar oculta las opciones no coincidentes y conserva su selección. Una cuenta de consulta puede buscar y leer, pero no marcar, guardar ni copiar. Se mantienen las dos confirmaciones administrativas.

En **Métricas**, se muestran carga, rango y alcance realmente aplicados, operación y aplicación en el detalle, y un mensaje cuando no hay registros. Los días se consultan completos en la zona de Guatemala. Se rechazan periodos invertidos, fechas inexistentes o más de 366 días. La paginación conserva los filtros de la última consulta, aunque se editen los campos antes de pulsar Consultar. Si falla la actualización se mantienen los resultados anteriores y su periodo; una respuesta anterior no sustituye la de una consulta posterior.

## Origen de los indicadores

La lectura institucional confirmó que la tabla de eventos estaba vacía; las cifras de tickets sí cargaban. El PR coordinado del API conecta las operaciones propias del Panel: consultas SAT, reportes de RRHH/nómina/anulados/semanales y consultas/cambios de funciones corporativas. Se cuentan solo operaciones respondidas correctamente; los catálogos, visitas, fallos y reportes vacíos no se convierten en trabajo realizado. Los reportes cuentan como reportes, no como cada fila revisada.

El registro activo de `SISTEMA_TICKETS` ya está confirmado. Los eventos nuevos pueden tardar un ciclo de reintento de 30 segundos ante una entrega pendiente. Las aplicaciones externas siguen necesitando sus propios eventos confirmados; no se reconstruye el historial previo. Ver `api-tickets/docs/METRICAS_OPERACIONES_PANEL.md` para almacenamiento, idempotencia y diagnóstico. No requiere tablas nuevas.

Actualizar primero **api-tickets QA** y después **Sistema-tickets Dev**. Con una cuenta autorizada, consultar funciones y volver a Métricas → Mis métricas → Consultar permite comprobar una operación nueva. Para consultar todo un equipo, su responsable necesita el permiso y las membresías vigentes.

## Validación

```bash
npm run typecheck
npm run test:integracion
npm run build
node test/integracion/metricas-funciones-browser.cjs
node test/integracion/acceso-formularios-browser.cjs
node test/integracion/modulos-browser.cjs
```

El primer recorrido usa el colector y lector compilados del API con Oracle ficticio y Next/BFF reales. Comprueba cero operaciones por catálogos, consulta y guardado visibles en métricas, 180 funciones sin crecimiento de pantalla, búsqueda sin pérdida de selección, dos confirmaciones, paginación y conservación de resultados ante error, a 1440/1024/390 px. No conecta a los servidores institucionales ni a Oracle real.
