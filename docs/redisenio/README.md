# Rediseño de Sistema Tickets: cobertura y revisión

La rama `feat/redisenar_sistema_tickets` adapta las pantallas existentes a la línea aprobada y conserva sus rutas. Esta entrega no implementa todavía toda la ampliación funcional de la presentación. Las 120 referencias representan vistas, estados y capacidades; no son 120 rutas ya conectadas a servicios.

## Alcance que se puede revisar

- Acceso, recuperación, menú global, buscador de aplicaciones, secciones, breadcrumbs y menú móvil.
- Inicio según los cuatro roles actuales, actividad reciente y métricas de tickets que entrega el API.
- Tickets creados frente a tickets asignados, creación, adjuntos, detalle e historial. Solo el administrador autoasigna sus propios tickets.
- Dos confirmaciones de administrador en las escrituras que pasan por el cliente común, antes de enviar HTTP. Cancelar no escribe. Es un control de interacción; no sustituye permisos ni auditoría del servidor.
- Cancelación de tickets mediante cambio al estado 4. Se conserva el expediente y no se llama a la eliminación física.
- Los 16 módulos registrados mantienen sus páginas y operaciones existentes. Formularios, tablas, Noticias y Juzgado usan el espacio disponible sin centrar formularios en áreas vacías.
- Componentes reutilizables: tokens CSS; átomos de controles; moléculas `PageHeading`, `MetricCard`, `ApplicationSwitcher` y `DemoNotice`; organismo `AdministrativeConfirmation`; plantillas `AccessLayout` y `ModuleWorkspace`.

## Límites de la integración existente

El catálogo de aplicaciones viene de `APPS_CATALOG_DUMMY`; es un manifiesto estático de navegación y no la autorización de cada usuario. El rediseño no concede permisos por mostrar un enlace. El servidor debe validar cada operación. Se conserva el contrato actual y no se inventan jefaturas, secretaría o DevOps como roles de autenticación nuevos.

Configuración de accesos, dashboards de proyectos/colaboradores, Estadísticas y búsqueda MOD13 ya utilizaban datos de demostración. Ahora se identifican. Configuración queda solo de lectura y no conecta IDs de demostración con mutaciones reales; perfiles, roles y permisos efectivos necesitan conectarse al servicio autorizado. La ficha de perfil deja de mostrar inventario y métricas inventados. Se normalizan además las respuestas de perfil/solicitudes para coincidir con sus campos GraphQL reales y se toma el ID de la ruta, conservando el error de sesión.

La recuperación se conecta opcionalmente al servicio de autenticación existente. Configurar `AUTH_RECOVERY_BASE_URL` en el servidor de Sistema Tickets con la base real que expone `send-recovery-email` y `recover-password` (por ejemplo, la base interna terminada en `/auth/`). No usa `NEXT_PUBLIC_`, no incluye claves y no modifica montajes. Si falta la base, muestra indisponibilidad; no simula que envió correo. Las pruebas de esta rama usan un servidor local controlado.

## Verificación

```bash
pnpm typecheck
pnpm test:integracion
node scripts/verificar-cobertura-redisenio.cjs
pnpm exec next build --webpack
node test/integracion/redisenio-browser.cjs
node test/integracion/panel-ux-browser.cjs
node test/integracion/juzgado-browser.cjs
```

`verificacion.json` registra el resultado local: tipos, lint, compilación, seis archivos de pruebas de lógica y los recorridos de navegador completados.

El recorrido de rediseño verifica login con error/éxito, recuperación, cuatro roles, filtros por usuario, las dos confirmaciones, cancelación sin eliminación física, configuración demo sin escrituras, rutas registradas y anchos 1920/1440/1180/1024/768/390. Noticias y Juzgado tienen recorridos separados de sus operaciones. Los límites HTTP se sustituyen: no se consulta Oracle, no se publican noticias y no se envían correos reales. Visitar una ruta no valida todos los procesos de negocio de ese módulo.

## Datos y tablas

Para el diseño de las pantallas existentes no hay DDL que ejecutar. No se cambiaron api-tickets ni api-autenticacion en esta entrega.

Las funciones nuevas sí necesitan contratos y revisar qué datos existen antes de crear tablas:

| Capacidad | Datos y reglas pendientes |
| --- | --- |
| Secretaría y jefaturas | Equipos, responsables, suplencias, asignación y tiempo sin primera atención configurable. |
| Calendario | Actividades, participantes, unidad y visibilidad de empresa/equipo, con autorización del servidor. |
| Accesos efectivos | Perfil → roles → módulos → operaciones, excepciones por usuario, copia independiente, solicitudes y aprobaciones. Integración con autenticación. |
| Auditoría transversal | Actor, fecha, recurso, antes/después, resultado, correlación y ambas confirmaciones persistidas. El cliente no puede acreditar esto por sí solo. |
| Inventario técnico | Referencia al número de inventario institucional, equipo, instalación, responsable, mantenimientos, visitas, bajas y salidas. |
| Cableado y topología | Ubicaciones/niveles/planos, dispositivos, puertos, conexiones e historial de cambios. |
| Desarrollo e infraestructura | Aplicaciones, repositorios, despliegues, recursos autorizados, observaciones con fecha, objetos Oracle, incidencias y acceso de lectura a logs. Requiere fuentes de monitoreo, no solo tablas. |
| Métricas de aplicaciones | Eventos de negocio como revisar/grabar recibos, autor, resultado, unidad, agregados y detalle verificable. No inferir trabajo realizado contando visitas a pantallas. |

Antes del SQL se debe acordar el esquema propietario dentro de `ADMEMETRA…`, las integraciones existentes y los privilegios mínimos. No se deben ejecutar tablas provisionales en usuarios personales. El diseño compartido permite incorporar esas capacidades sin rehacer la navegación.

## Matriz completa de referencias

`cobertura.json` conserva las 120 referencias y las 16 rutas verificadas. Estados: `UI_EXISTENTE_ADAPTADA` conserva un flujo existente; `BASE_EXISTENTE_PARCIAL` necesita ampliar sus datos; `DEMO_HEREDADA` no es operativa; `CONFIGURACION_PENDIENTE` requiere conectar el servicio; `API_DATOS_PENDIENTES` representa capacidad nueva no implementada.

| Referencia | Vista o estado | Cobertura de esta entrega |
| --- | --- | --- |
| P01 | Inicio de sesión | UI_EXISTENTE_ADAPTADA · Vista/estado existente conservado e integrado al diseño y navegación compartidos. |
| P02 | Error de acceso o carga de perfil | UI_EXISTENTE_ADAPTADA · Vista/estado existente conservado e integrado al diseño y navegación compartidos. |
| P03 | Recuperación de contraseña | CONFIGURACION_PENDIENTE · Flujo real preparado; habilitar AUTH_RECOVERY_BASE_URL y validar contra autenticación. |
| P04 | Inicio del usuario: acciones recientes y accesos | BASE_EXISTENTE_PARCIAL · Métricas de tickets y actividad existentes. Métricas de operaciones de otras apps pendientes. |
| P05 | Inicio: Admin · Informática | BASE_EXISTENTE_PARCIAL · Conserva el inicio real de administrador. Nuevas bandejas y monitoreo pendientes. |
| P06 | Inicio: Técnico · Informática | BASE_EXISTENTE_PARCIAL · Conserva estadísticas, eventos y tickets asignados del API actual. |
| P07 | Aplicaciones y secciones | UI_EXISTENTE_ADAPTADA · Vista/estado existente conservado e integrado al diseño y navegación compartidos. |
| P08 | Módulos de una sección | UI_EXISTENTE_ADAPTADA · Vista/estado existente conservado e integrado al diseño y navegación compartidos. |
| P09 | Tickets | UI_EXISTENTE_ADAPTADA · Vista/estado existente conservado e integrado al diseño y navegación compartidos. |
| P10 | Mis tickets | UI_EXISTENTE_ADAPTADA · Vista/estado existente conservado e integrado al diseño y navegación compartidos. |
| P11 | Crear ticket | UI_EXISTENTE_ADAPTADA · Vista/estado existente conservado e integrado al diseño y navegación compartidos. |
| P12 | Detalle del ticket: conversación | UI_EXISTENTE_ADAPTADA · Vista/estado existente conservado e integrado al diseño y navegación compartidos. |
| P13 | Historial del ticket | UI_EXISTENTE_ADAPTADA · Vista/estado existente conservado e integrado al diseño y navegación compartidos. |
| P14 | Admin: revisar el cambio · Paso 1 de 2 | UI_EXISTENTE_ADAPTADA · Dos confirmaciones centrales antes de enviar la mutación. No equivalen a auditoría persistida. |
| P15 | Admin: eliminación con historial conservado | UI_EXISTENTE_ADAPTADA · Cancelar usa updateTicket con estado 4; no ejecuta deleteTicket ni elimina el historial. |
| P16 | Equipo | UI_EXISTENTE_ADAPTADA · Vista/estado existente conservado e integrado al diseño y navegación compartidos. |
| P17 | Usuarios | UI_EXISTENTE_ADAPTADA · Vista/estado existente conservado e integrado al diseño y navegación compartidos. |
| P18 | Perfil del colaborador | BASE_EXISTENTE_PARCIAL · Perfil real y conteo de tickets creados. Inventario y rendimiento no se simulan. |
| P19 | Perfil: mantenimiento y equipo | API_DATOS_PENDIENTES · Sin fuente real de inventario/mantenimiento en el perfil; se indica la dependencia. |
| P20 | Admin: métricas globales de tickets de Informática | DEMO_HEREDADA · Estadísticas heredadas de demostración, identificadas. El inicio admin usa su API existente. |
| P21 | Informática: revisar solicitudes de acceso | DEMO_HEREDADA · Datos heredados de demostración; configuración solo de lectura, sin mutaciones. |
| P22 | Módulos | DEMO_HEREDADA · Datos heredados de demostración; configuración solo de lectura, sin mutaciones. |
| P23 | Permisos: INSERTAR, LEER, EDITAR y ELIMINAR | DEMO_HEREDADA · Datos heredados de demostración; configuración solo de lectura, sin mutaciones. |
| P24 | Rol: módulos y permisos de operación | DEMO_HEREDADA · Datos heredados de demostración; configuración solo de lectura, sin mutaciones. |
| P25 | Asignación de perfiles y excepciones | DEMO_HEREDADA · Datos heredados de demostración; configuración solo de lectura, sin mutaciones. |
| P26 | Crear módulo | DEMO_HEREDADA · Vista de demostración deshabilitada hasta conectar un catálogo autorizado real. |
| P27 | Asignar operaciones al módulo | DEMO_HEREDADA · Vista de demostración deshabilitada hasta conectar un catálogo autorizado real. |
| P28 | Crear o editar rol | DEMO_HEREDADA · Vista de demostración deshabilitada hasta conectar un catálogo autorizado real. |
| P29A | Reporte semanal · Información general | UI_EXISTENTE_ADAPTADA · Vista/estado existente conservado e integrado al diseño y navegación compartidos. |
| P29B | Reporte semanal · Indicadores y tareas | UI_EXISTENTE_ADAPTADA · Vista/estado existente conservado e integrado al diseño y navegación compartidos. |
| P29C | Reporte semanal · Riesgos y próxima semana | UI_EXISTENTE_ADAPTADA · Vista/estado existente conservado e integrado al diseño y navegación compartidos. |
| P30 | Reporte semanal guardado | UI_EXISTENTE_ADAPTADA · Vista/estado existente conservado e integrado al diseño y navegación compartidos. |
| P31 | Exportar reportes semanales | UI_EXISTENTE_ADAPTADA · Vista/estado existente conservado e integrado al diseño y navegación compartidos. |
| P32 | Dashboard de proyectos | DEMO_HEREDADA · Dashboard heredado con datos de demostración, ahora identificado. |
| P33 | Dashboard de colaboradores | DEMO_HEREDADA · Dashboard heredado con datos de demostración, ahora identificado. |
| P34 | Visa de nómina | UI_EXISTENTE_ADAPTADA · Vista/estado existente conservado e integrado al diseño y navegación compartidos. |
| P35 | Reporte de Recursos Humanos | UI_EXISTENTE_ADAPTADA · Vista/estado existente conservado e integrado al diseño y navegación compartidos. |
| P36 | Permisos por aplicación | UI_EXISTENTE_ADAPTADA · Vista/estado existente conservado e integrado al diseño y navegación compartidos. |
| P37 | Manuales y visor PDF | UI_EXISTENTE_ADAPTADA · Vista/estado existente conservado e integrado al diseño y navegación compartidos. |
| P38 | Reporte de anulados | UI_EXISTENTE_ADAPTADA · Vista/estado existente conservado e integrado al diseño y navegación compartidos. |
| P39 | Notificar documento | UI_EXISTENTE_ADAPTADA · Vista/estado existente conservado e integrado al diseño y navegación compartidos. |
| P40 | Confirmar notificación | UI_EXISTENTE_ADAPTADA · Vista/estado existente conservado e integrado al diseño y navegación compartidos. |
| P41 | Búsqueda EMETRA | DEMO_HEREDADA · Consulta heredada con datos de demostración, ahora identificada. |
| P42 | Consulta de vehículos | UI_EXISTENTE_ADAPTADA · Vista/estado existente conservado e integrado al diseño y navegación compartidos. |
| P43 | Ejecutar proceso | UI_EXISTENTE_ADAPTADA · Vista/estado existente conservado e integrado al diseño y navegación compartidos. |
| P44 | Resultado de un proceso | UI_EXISTENTE_ADAPTADA · Vista/estado existente conservado e integrado al diseño y navegación compartidos. |
| P45 | Noticias | UI_EXISTENTE_ADAPTADA · Se conserva el flujo COM03 existente: lista, edición, recursos, vista previa y publicación con sus permisos. |
| P46 | Crear y editar noticia | UI_EXISTENTE_ADAPTADA · Se conserva el flujo COM03 existente: lista, edición, recursos, vista previa y publicación con sus permisos. |
| P47 | Editar una sección de noticia | UI_EXISTENTE_ADAPTADA · Se conserva el flujo COM03 existente: lista, edición, recursos, vista previa y publicación con sus permisos. |
| P48 | Vista previa de noticia | UI_EXISTENTE_ADAPTADA · Se conserva el flujo COM03 existente: lista, edición, recursos, vista previa y publicación con sus permisos. |
| P49 | Confirmar publicación | UI_EXISTENTE_ADAPTADA · Se conserva el flujo COM03 existente: lista, edición, recursos, vista previa y publicación con sus permisos. |
| P50 | Resultado de publicación | UI_EXISTENTE_ADAPTADA · Se conserva el flujo COM03 existente: lista, edición, recursos, vista previa y publicación con sus permisos. |
| P51 | Consultar caso | UI_EXISTENTE_ADAPTADA · Se conserva JUZ01 existente, evidencias privadas, defensa, actuaciones, resolución y PDF con permisos. |
| P52 | Caso: evidencia, análisis y defensa | UI_EXISTENTE_ADAPTADA · Se conserva JUZ01 existente, evidencias privadas, defensa, actuaciones, resolución y PDF con permisos. |
| P53 | Caso: adaptación a tablet | UI_EXISTENTE_ADAPTADA · Se conserva JUZ01 existente, evidencias privadas, defensa, actuaciones, resolución y PDF con permisos. |
| P54 | Evidencia ampliada | UI_EXISTENTE_ADAPTADA · Se conserva JUZ01 existente, evidencias privadas, defensa, actuaciones, resolución y PDF con permisos. |
| P55 | Recibir defensa en el juzgado | UI_EXISTENTE_ADAPTADA · Se conserva JUZ01 existente, evidencias privadas, defensa, actuaciones, resolución y PDF con permisos. |
| P56 | Registrar una actuación | UI_EXISTENTE_ADAPTADA · Se conserva JUZ01 existente, evidencias privadas, defensa, actuaciones, resolución y PDF con permisos. |
| P57 | Resolver defensa | UI_EXISTENTE_ADAPTADA · Se conserva JUZ01 existente, evidencias privadas, defensa, actuaciones, resolución y PDF con permisos. |
| P58 | Confirmar resolución | UI_EXISTENTE_ADAPTADA · Se conserva JUZ01 existente, evidencias privadas, defensa, actuaciones, resolución y PDF con permisos. |
| P59 | Resolución y documento PDF | UI_EXISTENTE_ADAPTADA · Se conserva JUZ01 existente, evidencias privadas, defensa, actuaciones, resolución y PDF con permisos. |
| P60 | Sin permiso de acceso | UI_EXISTENTE_ADAPTADA · Vista/estado existente conservado e integrado al diseño y navegación compartidos. |
| P61 | Página no encontrada | UI_EXISTENTE_ADAPTADA · Vista/estado existente conservado e integrado al diseño y navegación compartidos. |
| P62 | No se pudo cargar la información | UI_EXISTENTE_ADAPTADA · Vista/estado existente conservado e integrado al diseño y navegación compartidos. |
| P63 | Inicio: Jefatura de unidad | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P64 | Inicio: Desarrollador | BASE_EXISTENTE_PARCIAL · Desarrollador conserva inicio técnico del rol DESARROLLADOR. Sistemas a cargo pendientes. |
| P65 | Inicio: Asignación · Informática | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P66 | Bandeja de asignación | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P67 | Asignados sin primera atención | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P68 | Asignar desde la bandeja de la secretaria | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P69 | Admin: confirmar el cambio · Paso 2 de 2 | UI_EXISTENTE_ADAPTADA · Segundo paso central con casilla explícita y cancelación sin petición. |
| P70 | Admin: autoasignación de un ticket propio | UI_EXISTENTE_ADAPTADA · Solo ADMINISTRADOR autoasigna los tickets que crea con su propio ID. |
| P71 | Calendario: vista de todos los usuarios | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P72 | Calendario: gestión de una jefatura | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P73 | Crear actividad de equipo | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P74 | Solicitudes de mi equipo | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P75 | Jefatura: solicitar usuario nuevo | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P76 | Informática: resolver una solicitud de acceso | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P77 | Perfiles de trabajo | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P78 | Perfil: roles incluidos y acceso resultante | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P79 | Alta de usuario: elegir una base de permisos | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P80 | Copiar accesos: revisar antes de aplicar | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P81 | Usuario: perfil base y excepciones individuales | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P82 | Permisos: revisar impacto antes de confirmar | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P83 | Trazabilidad de movimientos | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P84 | Movimiento: antes, después y confirmaciones | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P85 | Equipos de Informática | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P86 | Registrar o actualizar equipo | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P87 | Registrar mantenimiento o visita técnica | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P88 | Generar baja o salida de equipo | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P89 | Instalaciones a mi cargo | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P90 | Topología: switch, router y conexiones | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P91 | Registrar o actualizar punto de red | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P92 | Sistemas a mi cargo | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P93 | Sistema: front, back y servidor | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P94 | Repositorios y despliegues vinculados | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P95 | Incidentes de aplicaciones | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P96 | Estado de esquema y objetos | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P97 | Mis métricas de atención | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P98 | Jefatura: métricas de sus equipos | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P99 | Mis métricas: tickets y actividad de aplicaciones | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P100 | Permisos: confirmar y aplicar · Paso 2 de 2 | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P101 | Resolver un ticket asignado | UI_EXISTENTE_ADAPTADA · Flujo existente en detalle del ticket para pasar a trabajo y completar; backend conserva su validación. |
| P102 | Incidente: contexto y relación con un ticket | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P103 | Solicitar acceso para un miembro | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P104 | Mi actividad en aplicaciones | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P105 | Jefatura: actividad de aplicaciones de su equipo | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P106 | Registros que forman un indicador | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P107 | Switch: puertos y equipos conectados | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P108 | Agregar o editar un dispositivo de red | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P109 | Conectar dispositivos por sus puertos | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P110 | Dispositivo: ficha, revisión y mantenimiento | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P118 | Plano físico: ubicación de los puntos | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P111 | Servidores: vista de DevOps | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P112 | Servidor: recursos y contenedores | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P113 | Contenedor: estado, versión y logs | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P114 | Logs: consulta filtrada del recurso | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P115 | Jefatura: servidores y contenedores autorizados | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P116 | Monitoreo: lectura antigua o fuente no disponible | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
| P117 | Logs: acceso de lectura no otorgado | API_DATOS_PENDIENTES · Definir API, alcance de permisos, modelo persistente y auditoría antes de ofrecer la función. |
