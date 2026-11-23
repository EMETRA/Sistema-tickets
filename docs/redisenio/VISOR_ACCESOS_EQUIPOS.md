# Visor, accesos y equipos de RRHH

## Navegación

- **Mis tickets → detalle o vista rápida → Archivos:** abre el visor dentro del ticket; también funciona desde los adjuntos de la conversación. Incluye imágenes, PDF, texto, descarga y reintento. Escape cierra el visor y conserva la vista rápida del ticket que lo abrió.
- **Personas y accesos → Funciones corporativas:** reúne la asignación por aplicación de Informática con Usuarios, Perfiles, Roles, Módulos, Permisos y Solicitudes. El enlace anterior `/home/informatica/permisos/mod06` redirige a `/espacio/accesos?tab=corporate`.
- **Más herramientas → Equipos y responsables → Preparar desde RRHH:** muestra unidades, empleados, cuentas habilitadas y cambios previstos. **Aplicar generación de equipos** conserva las dos confirmaciones administrativas.

Las funciones corporativas mantienen sus autorizaciones y su fuente actual; tener administración de Tickets no sustituye las reglas de esas aplicaciones. Un usuario autorizado para MOD06 puede entrar a esa pestaña, pero no obtiene acceso a los catálogos administrativos de Tickets. Las solicitudes siguen disponibles según su alcance habitual.

## Equipos y puestos

La agrupación utiliza `PARTIDA_PRESP.DESC_UNIDAD`, identificada por empresa/unidad; no usa el centro de costo ni la dirección domiciliaria del empleado. Los puestos quedan visibles en la vista previa y en la ficha del miembro.

Los miembros generados nuevos reciben MIEMBRO. Las jefaturas, técnicos, desarrolladores, asignadores y otras funciones se revisan en la ficha. El texto de un puesto no concede permisos. Al cambiar el puesto de una membresía generada se requiere revisar esas responsabilidades nuevamente.

Los empleados sin cuenta habilitada se cuentan y sus unidades se incluyen. Se incorporarán como miembros al repetir la generación después de habilitar su cuenta. Un traslado inactiva la membresía generada anterior sin borrar su historial; las membresías manuales se conservan. El proceso es bajo solicitud administrativa, sin tareas programadas ni consultas automáticas de RRHH al entrar al panel.

## Actualización y DB

Actualizar **api-tickets y Sistema-tickets de forma coordinada**, conservando los montajes existentes. Los adjuntos dejan de abrirse mediante URL pública y pasan al endpoint autenticado. La versión anterior del frontend no es compatible con ese cambio del API.

No hacen falta tablas ni columnas nuevas para esta entrega. Los empleados permanecen en ADMINSIAF; el origen derivado se guarda en el JSON de los equipos y miembros existentes. La guía del API `docs/VISOR_Y_EQUIPOS_RRHH.md` explica claves, configuración y controles de sincronización.

## Pruebas reproducibles

```bash
npm run typecheck
npm run test:integracion
npm run build -- --webpack
node test/integracion/tickets-aplicaciones-browser.cjs
node test/integracion/equipos-rrhh-browser.cjs
node test/integracion/modulos-browser.cjs
```

Los recorridos de navegador requieren Chromium local (`/usr/bin/chromium`) y el build del panel. El recorrido de módulos también necesita api-tickets compilado para verificar el contrato GraphQL real; `TICKETS_API_SOURCE` permite señalar su ubicación.

Todo se ejecuta con datos ficticios en loopback, sin Oracle ni servicios institucionales. Las capturas se escriben en `QA_SCREENSHOT_DIR` cuando se proporciona. Se verifican errores/reintentos, preservación de datos, navegación, descarga, texto escapado, diálogos anidados, tamaños 1440/1024/390, permisos y las dos confirmaciones del lote.
