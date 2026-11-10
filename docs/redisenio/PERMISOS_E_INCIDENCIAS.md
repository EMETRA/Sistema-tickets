# Corrección de catálogos, nómina e incidencias

El catálogo de funciones corporativas ahora muestra qué catálogo falló y su referencia; permite reintentar conservando la selección. La empresa 97 queda seleccionada inicialmente. El API corrige la referencia a SIGLAS, columna que no existe en ADMINSIAF.TB_EMPRESA.

Visa Nóminas exige un permiso efectivo en el API; no se autoriza por el nombre del perfil ni por mostrar la pantalla. El formulario pide códigos de empresa y maestro de nómina. Si la consulta no contiene empleados, informa el resultado y no descarga un Excel solo con encabezados.

Los fallos inesperados de consultas y ejecución se reportan a Incidentes de aplicaciones. Los errores Oracle del API llevan una referencia correlacionable; el Panel conserva esa referencia sin emitir una segunda incidencia por el mismo fallo. Los errores JavaScript y de renderizado también se reportan con datos mínimos, sin mensajes libres que pudieran contener información personal.

Las incidencias se agrupan por operación y códigos, y la ficha muestra el contador y las fechas. Solo las ven usuarios con permisos de incidencias dentro del equipo receptor. Los rechazos por falta de permisos y las consultas sin resultados se tratan como resultados esperados.

La guía completa de configuración está en **api-tickets: `docs/PERMISOS_E_INCIDENCIAS_QA.md`**. Requiere:

1. Ejecutar en BDSAL los scripts `06_admin_pruebas_usuario.sql` y `07_aplicaciones_incidencias.sql` de api-tickets, revisando usuario y equipo.
2. Preparar la credencial del emisor con `scripts/plataforma/preparar-incidencias-panel.py` y configurar los archivos de entorno correspondientes en cada host.
3. Actualizar API y Panel con sus actualizadores. En el Panel, usar `--habilitar-incidencias` para agregar únicamente el volumen privado de la cola, conservando los montajes anteriores.

No hay tablas ni columnas nuevas. Los errores pendientes permanecen en disco cuando Oracle está caído. El Panel necesita su credencial y el volumen persistente para conservar y entregar sus propios pendientes después de una recreación.

Pruebas locales: integración de permisos y despliegue, Nest/GraphQL real con datos ficticios, captura Oracle, recuperación, idempotencia, control de acceso y recorrido Chromium `test/integracion/incidencias-browser.cjs`. No se consultó ni modificó BDSAL desde estas pruebas.
