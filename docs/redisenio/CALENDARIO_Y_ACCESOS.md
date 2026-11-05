# Calendario y administración de accesos

## Calendario

`/espacio/calendario` abre en **Semana**, con lunes a viernes y horas de Guatemala. Conserva las vistas Mes y Agenda. El fondo, las tarjetas blancas, las líneas y los eventos de equipo en violeta y generales en gris siguen la referencia aprobada de la presentación.

- Hoy, semana anterior/siguiente e Ir a fecha cambian el periodo consultado.
- Los filtros Equipo, General de la empresa y Privadas actúan sobre los registros autorizados por el API. No amplían su alcance.
- Fin de semana muestra sábado y domingo; si hay actividades ocultas en esos días aparece un aviso para mostrarlas. Elegir una fecha de fin de semana también los abre.
- Las actividades simultáneas se distribuyen en columnas; las de varios días aparecen en una fila independiente. Una finalización a medianoche no ocupa el día siguiente.
- La jefatura conserva la gestión de actividades de su equipo. Las generales se muestran para consulta a los demás usuarios, incluidos documentos sin acciones de carga. El administrador conserva sus acciones autorizadas.
- La hora disponible abre el formulario con inicio y finalización propuestos. Los errores, el calendario vacío y una carga pendiente tienen estados distintos. Se conserva la paginación para periodos con más de cien actividades.

## Personas y accesos

La administración dispone de enlaces estables; Atrás/Adelante del navegador recuperan la sección:

| Sección | URL | Acciones |
| --- | --- | --- |
| Usuarios | `/espacio/accesos?tab=users` | Perfil base, roles/permisos adicionales y copia de accesos |
| Perfiles | `/espacio/accesos?tab=profiles` | Crear/editar datos y seleccionar roles |
| Roles | `/espacio/accesos?tab=roles` | Crear/editar datos y seleccionar permisos |
| Módulos | `/espacio/accesos?tab=modules` | Registrar/editar un módulo implementado y vincular sus permisos por operación |
| Permisos | `/espacio/accesos?tab=permissions` | Crear/editar permisos; conservar códigos estables de Tickets/VIVI |
| Solicitudes | `/espacio/solicitudes` | Tramitar solicitudes del equipo según el alcance autorizado |

Los enlaces administrativos también aparecen al entrar a Solicitudes con administración. Las jefaturas ven sus solicitudes sin enlaces administrativos. Abrir una URL directamente no evita la comprobación de permisos.

Al crear un perfil o rol, guardar sus datos primero y abrir **Editar y ver relaciones** para asignar sus relaciones. La selección usa casillas y búsqueda; filtrar conserva lo seleccionado. Los cambios mantienen las dos confirmaciones, versión del catálogo, idempotencia e historial del servicio existente. Registrar un módulo no crea una pantalla nueva: el API exige un código implementado en el Panel.

## Cuando el perfil se llama USER_ADMIN pero el Panel muestra USUARIO

El nombre del perfil o el rol antiguo de la cabecera no concede administración de la plataforma. La autoridad es el permiso efectivo **TICKETS_ADMINISTRAR**. Tampoco lo concede el rol Oracle `RL_TICKETS_QA_FECACERES`, que únicamente permite operaciones sobre los objetos de la base.

No se requieren tablas nuevas para este ajuste. Con las tablas de la plataforma ya instaladas, revisar y ejecutar en SQL Developer como script (F5), en la base de QA, los archivos existentes de **api-tickets**:

1. [`sql/plataforma/03_catalogo_permisos.sql`](https://github.com/EMETRA/api-tickets/blob/QA/sql/plataforma/03_catalogo_permisos.sql): crea el catálogo y enlaza el rol de administración al **ID del perfil** elegido. Revisar qué cuentas habilitadas comparten ese perfil antes de asignarlo.
2. [`sql/plataforma/04_datos_iniciales.sql`](https://github.com/EMETRA/api-tickets/blob/QA/sql/plataforma/04_datos_iniciales.sql): requiere el **ID de usuario**, para el equipo/membresía inicial de Informática y los módulos implementados. Preserva las entradas que ya existen.
3. Cerrar sesión y entrar de nuevo. En `/api/platform/bootstrap`, comprobar `actor.admin=true`, `actor.mode=ADMINISTRADOR` y los enlaces del menú. No compartir tokens ni la respuesta completa de usuarios.

En el diagnóstico del 5 de noviembre de 2026, el usuario 1 tenía perfil 1 (`USER_ADMIN`), una cuenta habilitada en ese perfil y no existía `TICKETS_ADMINISTRAR`. Para ese caso concreto, los valores solicitados son **perfil 1** en el primer script y **usuario 1** en el segundo. No son valores universales para otras instalaciones.

## Verificación

```bash
pnpm typecheck
pnpm test:integracion
pnpm exec next build --webpack
node test/integracion/calendario-accesos-browser.cjs
```

El recorrido de navegador inicia el Panel compilado y el adaptador local en puertos 3970–3972, todos en loopback, con un estado ficticio temporal independiente. Prueba calendario, filtros, fechas, solapamientos, altas/ediciones, navegación con URL, relaciones, confirmaciones, privacidad y cinco anchos. Guarda capturas y `resultado.json`; `QA_SCREENSHOT_DIR` permite elegir la carpeta de salida. No consulta Oracle, servidores institucionales ni envía notificaciones. La validación con las cuentas y datos reales sigue siendo necesaria después de desplegar.

Componentes reutilizables: moléculas `AccessNavigation` y `AccessChoices`; organismo `WeeklyCalendar`; cálculos de fechas/solapamientos en `platform/calendar.ts`. Los formularios y fichas conservan `RecordEditor`, `RecordDetail`, `RecordFiles` y `AdministrativeConfirmation`.
