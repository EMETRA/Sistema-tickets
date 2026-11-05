# Rediseño y ampliación de Sistema Tickets

La rama `feat/redisenar_sistema_tickets` incorpora la línea visual aprobada y sus funciones nuevas, en coordinación con api-tickets y api-autenticacion. Conserva Atomic Design, Noticias, Juzgado y las rutas de los 16 módulos actuales.

El espacio nuevo agrega inicio por responsabilidad, bandejas de asignación/atención, calendario, métricas, solicitudes/aprobaciones, perfiles/roles/permisos reales, inventario técnico, mantenimientos/visitas, bajas/salidas, cableado/puertos/planos, aplicaciones/repositorios/despliegues/incidentes, servidores/contenedores/logs y trazabilidad. Las vistas leen y escriben servicios; no muestran métricas inventadas ni consideran exitosa una fuente sin conectar.

## Instalación

Para avanzar fuera de la oficina, usar el [laboratorio local con datos ficticios](laboratorio-local.md): `pnpm laboratorio`. Ejecuta este Panel contra mocks persistentes, con siete perfiles, sin conectarse a Oracle ni a los servicios institucionales. Sus alcances y límites se explican en la guía.

La ampliación se activa después de aplicar los SQL y configurar los tres servicios. La guía completa, DDL, grants, datos iniciales, verificación y emisores están en [api-tickets, rama de la ampliación](https://github.com/EMETRA/api-tickets/tree/feat/redisenar_sistema_tickets/docs/plataforma). **No ejecutar tablas nuevas en usuarios personales.** El propietario de Informática confirmado por el DBA es ADMEMETRAIT; los accesos nuevos van en ADMEMETRAIDENTIDAD y la auditoría en ADMEMETRAAUDITORIA. Auth y tickets existentes continúan en sus propietarios actuales.

En el servidor Next, `TICKETS_PLATFORM_ENABLED=true` habilita el espacio y el catálogo autorizado del API. Mantener GRAPHQL_ENDPOINT y los montajes del despliegue. El navegador utiliza el BFF de origen fijo `/api/platform`; no recibe claves de observadores, Oracle ni SMTP. Los tres servicios deben usar el mismo modo antes de reanudar escrituras. Las sesiones abiertas deben recargar la nueva versión del Panel.

El repositorio incluye `scripts/actualizar-servicio-preservando.py` para el servidor del Front. Primero ejecutar con `CONTENEDOR_REAL --comprobar`, desde la carpeta Compose desplegada; luego sin ese argumento. Detecta overlays, verifica los montajes y conserva redes. No hace `down` ni borra volúmenes.

## Componentes y navegación

El [calendario semanal y la navegación de Personas y accesos](CALENDARIO_Y_ACCESOS.md) detallan las vistas, las relaciones y la preparación del permiso administrativo inicial.

- Átomos existentes de botones, texto, iconos y formularios; conserva colores y tipografía institucionales.
- Moléculas PageHeading, MetricCard, ApplicationSwitcher y PlatformField.
- Organismos ResourceWorkspace, RecordEditor, RecordDetail, RecordFiles y AdministrativeConfirmation.
- Plantillas SystemLayout, AccessLayout, ModuleWorkspace y PlatformPage.
- Los formularios utilizan metadatos tipados del API; permisos y visibilidad se verifican de nuevo en el servidor. Ocultar un botón no concede ni sustituye autorización.
- El inicio adapta prioridades a administrador, jefatura, asignación, técnico, desarrollo, DevOps y usuario. Son responsabilidades/permisos, sin inventar roles de autenticación por el cargo mostrado.
- Las fichas tienen URL propia `/espacio/registro/[type]/[id]`, documentos e historial. La búsqueda interna devuelve únicamente registros autorizados.

## Configuraciones pendientes, sin simular resultados

La [guía de aplicaciones y fuentes reales](FUENTES_REALES.md) describe la conexión del observador de servidores y GitHub, y la recuperación de errores al navegar entre aplicaciones.

- Inventario oficial: el catálogo está en ADMEMETRA y falta su tabla/columna. El registro técnico manual muestra **Inventario oficial pendiente de verificar**. Se conectará mediante vista en ADMEMETRAINTEGRACION, conservando la futura migración.
- Observadores de servidores y emisores de actividad/errores de aplicaciones: los adaptadores y contratos están implementados en el API; deben conectarse a sus fuentes reales. Sin emisor, se muestran ausencia de mediciones/eventos y lecturas vencidas.
- Objetos Oracle: solo se muestran ALL_OBJECTS/ALL_CONSTRAINTS visibles para la cuenta del API. No se conceden permisos SYS o ANY DICTIONARY.
- Recuperación e invitaciones: configurar Auth/SMTP y validar con una cuenta controlada. Crear cuenta, aceptar correo en SMTP y leer el correo son resultados distintos.
- MOD13 conserva su búsqueda heredada de remisiones ilustrativa, identificada como tal. No se repurposó su enlace como otro trámite. La búsqueda nueva del espacio técnico es independiente.

## Cobertura y verificación

`cobertura.json` relaciona las 120 referencias de la presentación con rutas y estados. Son vistas, variantes y capacidades, **no 120 rutas distintas**. `UI_API_IMPLEMENTADAS_REQUIERE_INSTALACION` indica que el código y contrato están preparados y que faltan SQL/configuración/validación con datos reales. La matriz no presenta esas conexiones como ya verificadas.

```bash
pnpm typecheck
pnpm test:integracion
node scripts/verificar-cobertura-redisenio.cjs
pnpm exec next build --webpack
node test/integracion/plataforma-browser.cjs
node test/integracion/redisenio-browser.cjs
node test/integracion/panel-ux-browser.cjs
node test/integracion/juzgado-browser.cjs
```

Las pruebas de navegador ejecutan Next con límites HTTP sustituidos, en escritorio y tablet. No consultan Oracle ni envían correos, publican noticias o modifican servidores reales. Las pruebas del API cubren alcance, privacidad, permisos, confirmaciones, versiones, idempotencia, puertos, logs y contrato SQL. La guía del API incluye el recorrido de validación posterior en Oracle.

## Matriz de referencias

| Referencia | Vista o estado | Ruta/cobertura |
| --- | --- | --- |
| P01 | Inicio de sesión | UI_EXISTENTE_ADAPTADA |
| P02 | Error de acceso o carga de perfil | UI_EXISTENTE_ADAPTADA |
| P03 | Recuperación de contraseña | CONFIGURACION_PENDIENTE |
| P04 | Inicio del usuario: acciones recientes y accesos | /home |
| P05 | Inicio: Admin · Informática | /home |
| P06 | Inicio: Técnico · Informática | /home |
| P07 | Aplicaciones y secciones | UI_EXISTENTE_ADAPTADA |
| P08 | Módulos de una sección | UI_EXISTENTE_ADAPTADA |
| P09 | Tickets | /espacio/asignacion |
| P10 | Mis tickets | /espacio/asignacion |
| P11 | Crear ticket | UI_EXISTENTE_ADAPTADA |
| P12 | Detalle del ticket: conversación | /espacio/asignacion |
| P13 | Historial del ticket | /espacio/asignacion |
| P14 | Admin: revisar el cambio · Paso 1 de 2 | UI_API_IMPLEMENTADAS_REQUIERE_INSTALACION |
| P15 | Admin: eliminación con historial conservado | /espacio/asignacion |
| P16 | Equipo | UI_EXISTENTE_ADAPTADA |
| P17 | Usuarios | UI_EXISTENTE_ADAPTADA |
| P18 | Perfil del colaborador | UI_EXISTENTE_ADAPTADA |
| P19 | Perfil: mantenimiento y equipo | /espacio/inventario |
| P20 | Admin: métricas globales de tickets de Informática | /espacio/metricas |
| P21 | Informática: revisar solicitudes de acceso | /espacio/solicitudes |
| P22 | Módulos | /espacio/accesos |
| P23 | Permisos: INSERTAR, LEER, EDITAR y ELIMINAR | /espacio/accesos |
| P24 | Rol: módulos y permisos de operación | /espacio/accesos |
| P25 | Asignación de perfiles y excepciones | /espacio/accesos |
| P26 | Crear módulo | /espacio/accesos |
| P27 | Asignar operaciones al módulo | /espacio/accesos |
| P28 | Crear o editar rol | /espacio/accesos |
| P29A | Reporte semanal · Información general | UI_EXISTENTE_ADAPTADA |
| P29B | Reporte semanal · Indicadores y tareas | UI_EXISTENTE_ADAPTADA |
| P29C | Reporte semanal · Riesgos y próxima semana | UI_EXISTENTE_ADAPTADA |
| P30 | Reporte semanal guardado | UI_EXISTENTE_ADAPTADA |
| P31 | Exportar reportes semanales | UI_EXISTENTE_ADAPTADA |
| P32 | Dashboard de proyectos | /espacio/metricas |
| P33 | Dashboard de colaboradores | /espacio/metricas |
| P34 | Visa de nómina | UI_EXISTENTE_ADAPTADA |
| P35 | Reporte de Recursos Humanos | UI_EXISTENTE_ADAPTADA |
| P36 | Permisos por aplicación | UI_EXISTENTE_ADAPTADA |
| P37 | Manuales y visor PDF | UI_EXISTENTE_ADAPTADA |
| P38 | Reporte de anulados | UI_EXISTENTE_ADAPTADA |
| P39 | Notificar documento | UI_EXISTENTE_ADAPTADA |
| P40 | Confirmar notificación | UI_EXISTENTE_ADAPTADA |
| P41 | Búsqueda EMETRA | DEMO_HEREDADA |
| P42 | Consulta de vehículos | UI_EXISTENTE_ADAPTADA |
| P43 | Ejecutar proceso | UI_EXISTENTE_ADAPTADA |
| P44 | Resultado de un proceso | UI_EXISTENTE_ADAPTADA |
| P45 | Noticias | UI_EXISTENTE_ADAPTADA |
| P46 | Crear y editar noticia | UI_EXISTENTE_ADAPTADA |
| P47 | Editar una sección de noticia | UI_EXISTENTE_ADAPTADA |
| P48 | Vista previa de noticia | UI_EXISTENTE_ADAPTADA |
| P49 | Confirmar publicación | UI_EXISTENTE_ADAPTADA |
| P50 | Resultado de publicación | UI_EXISTENTE_ADAPTADA |
| P51 | Consultar caso | UI_EXISTENTE_ADAPTADA |
| P52 | Caso: evidencia, análisis y defensa | UI_EXISTENTE_ADAPTADA |
| P53 | Caso: adaptación a tablet | UI_EXISTENTE_ADAPTADA |
| P54 | Evidencia ampliada | UI_EXISTENTE_ADAPTADA |
| P55 | Recibir defensa en el juzgado | UI_EXISTENTE_ADAPTADA |
| P56 | Registrar una actuación | UI_EXISTENTE_ADAPTADA |
| P57 | Resolver defensa | UI_EXISTENTE_ADAPTADA |
| P58 | Confirmar resolución | UI_EXISTENTE_ADAPTADA |
| P59 | Resolución y documento PDF | UI_EXISTENTE_ADAPTADA |
| P60 | Sin permiso de acceso | UI_EXISTENTE_ADAPTADA |
| P61 | Página no encontrada | UI_EXISTENTE_ADAPTADA |
| P62 | No se pudo cargar la información | UI_EXISTENTE_ADAPTADA |
| P63 | Inicio: Jefatura de unidad | /home |
| P64 | Inicio: Desarrollador | /home |
| P65 | Inicio: Asignación · Informática | /home |
| P66 | Bandeja de asignación | /espacio/asignacion |
| P67 | Asignados sin primera atención | /espacio/asignacion |
| P68 | Asignar desde la bandeja de la secretaria | /espacio/asignacion |
| P69 | Admin: confirmar el cambio · Paso 2 de 2 | UI_API_IMPLEMENTADAS_REQUIERE_INSTALACION |
| P70 | Admin: autoasignación de un ticket propio | /tickets-creation |
| P71 | Calendario: vista de todos los usuarios | /espacio/calendario |
| P72 | Calendario: gestión de una jefatura | /espacio/calendario |
| P73 | Crear actividad de equipo | /espacio/calendario |
| P74 | Solicitudes de mi equipo | /espacio/solicitudes |
| P75 | Jefatura: solicitar usuario nuevo | /espacio/solicitudes |
| P76 | Informática: resolver una solicitud de acceso | /espacio/solicitudes |
| P77 | Perfiles de trabajo | /espacio/accesos |
| P78 | Perfil: roles incluidos y acceso resultante | /espacio/accesos |
| P79 | Alta de usuario: elegir una base de permisos | /espacio/solicitudes |
| P80 | Copiar accesos: revisar antes de aplicar | /espacio/accesos |
| P81 | Usuario: perfil base y excepciones individuales | /espacio/accesos |
| P82 | Permisos: revisar impacto antes de confirmar | /espacio/accesos |
| P83 | Trazabilidad de movimientos | /espacio/auditoria |
| P84 | Movimiento: antes, después y confirmaciones | /espacio/auditoria |
| P85 | Equipos de Informática | /espacio/inventario |
| P86 | Registrar o actualizar equipo | /espacio/inventario |
| P87 | Registrar mantenimiento o visita técnica | /espacio/inventario |
| P88 | Generar baja o salida de equipo | /espacio/inventario |
| P89 | Instalaciones a mi cargo | /espacio/inventario |
| P90 | Topología: switch, router y conexiones | /espacio/red |
| P91 | Registrar o actualizar punto de red | /espacio/red |
| P92 | Sistemas a mi cargo | /espacio/sistemas |
| P93 | Sistema: front, back y servidor | /espacio/sistemas |
| P94 | Repositorios y despliegues vinculados | /espacio/sistemas |
| P95 | Incidentes de aplicaciones | /espacio/sistemas |
| P96 | Estado de esquema y objetos | /espacio/sistemas |
| P97 | Mis métricas de atención | /espacio/metricas |
| P98 | Jefatura: métricas de sus equipos | /espacio/metricas |
| P99 | Mis métricas: tickets y actividad de aplicaciones | /espacio/metricas |
| P100 | Permisos: confirmar y aplicar · Paso 2 de 2 | /espacio/accesos |
| P101 | Resolver un ticket asignado | /espacio/asignacion |
| P102 | Incidente: contexto y relación con un ticket | /espacio/sistemas |
| P103 | Solicitar acceso para un miembro | /espacio/solicitudes |
| P104 | Mi actividad en aplicaciones | /espacio/metricas |
| P105 | Jefatura: actividad de aplicaciones de su equipo | /espacio/metricas |
| P106 | Registros que forman un indicador | /espacio/metricas |
| P107 | Switch: puertos y equipos conectados | /espacio/red |
| P108 | Agregar o editar un dispositivo de red | /espacio/red |
| P109 | Conectar dispositivos por sus puertos | /espacio/red |
| P110 | Dispositivo: ficha, revisión y mantenimiento | /espacio/red |
| P118 | Plano físico: ubicación de los puntos | /espacio/red |
| P111 | Servidores: vista de DevOps | /espacio/infraestructura |
| P112 | Servidor: recursos y contenedores | /espacio/infraestructura |
| P113 | Contenedor: estado, versión y logs | /espacio/infraestructura |
| P114 | Logs: consulta filtrada del recurso | /espacio/infraestructura |
| P115 | Jefatura: servidores y contenedores autorizados | /espacio/infraestructura |
| P116 | Monitoreo: lectura antigua o fuente no disponible | /espacio/infraestructura |
| P117 | Logs: acceso de lectura no otorgado | /espacio/infraestructura |
