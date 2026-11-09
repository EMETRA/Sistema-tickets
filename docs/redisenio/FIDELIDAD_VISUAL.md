# Ajuste de fidelidad con la presentación aprobada

Referencia: **Sistema Tickets — Propuesta UX, revisión 3**, también entregada
como `Tickets.pptx` y sus cuatro partes. Se compararon las familias de pantallas
del inicio, formularios, listados y acceso con la presentación y su prototipo.
La captura P04 adjuntada en la revisión es la referencia directa del inicio del usuario. Para los otros perfiles se consultaron P05, P06 y P63–P65; para superficies y formularios, P01, P09, P11 y P34.

## Criterios compartidos

- Fondo del espacio de trabajo `#F4F6FB`; tarjetas blancas, borde azul grisáceo
  suave, radios y sombras consistentes.
- Superficie secundaria `#F8FAFF` para actividades y carga de archivos; los
  estados y alertas conservan sus colores y textos.
- Tipografía Montserrat y texto azul oscuro. Las familias heredadas de estilos
  utilizan la misma paleta que las plantillas nuevas.
- En el inicio, cabecera con acento azul, indicadores y dos columnas de trabajo.
  El usuario ve «Tus solicitudes y aplicaciones», cuatro indicadores, una fila
  de actividad/calendario y tres accesos: aplicaciones, crear ticket y métricas.
  No se añaden paneles de bandeja ni otra lista de aplicaciones a ese inicio.
  Los otros perfiles priorizan sus tickets y conservan las herramientas de su alcance.
- El menú principal del usuario tiene las cinco entradas de P04. «Más herramientas»
  conserva las funciones adicionales autorizadas; Ayuda y Cerrar sesión están al pie.
  El icono de campana abre el seguimiento real de tickets, sin inventar notificaciones.
- Las acciones recientes muestran operaciones confirmadas con aplicación, referencia,
  fecha y tiempo relativo; las creaciones de tickets abren su expediente. Los errores
  de métricas, bandeja y calendario son independientes y permiten reintentar.
- Búsqueda, filtros, resultados y paginación se agrupan en una tarjeta para
  que los listados mantengan una jerarquía visible.
- La carga de archivos utiliza una superficie tenue y admite Enter y Espacio.

Los datos, totales y accesos proceden de los servicios y permisos de cada usuario.
La composición se adapta a su contenido, incluidos los estados vacíos y errores.

## Atomic Design

`src/theme/tokens.css` define las superficies y medidas compartidas.
`src/theme/surfaces.scss` ofrece la receta de tarjeta para los organismos
existentes. Los átomos Text, Title y TextArea, las moléculas de tarjetas,
aplicaciones y adjuntos y las plantillas de trabajo comparten esas bases.

Los paneles de estadísticas y rendimiento, información, equipos, mantenimiento,
reportes y tickets tienen una superficie explícita: no heredan el fondo del
lienzo. Las reglas de composición propias del inicio están en
`src/components/client/templates/HomeOverview`.
`WorkspaceIcon` aporta los contornos con acento tenue; `RecentActions` y
`AgendaPreview` son organismos reutilizables. `HomeWorkspace` adapta los datos
al perfil, sin incluir valores de ejemplo en el producto.

## Tickets y aplicaciones (P07/P08, P10 y P12/P13)

- «Mis tickets» reúne búsqueda por código/asunto/persona, filtros de estado y
  asignación, actualización y paginación en una tarjeta blanca. Las columnas son
  código, asunto, creador, estado, responsable y fecha. La paginación de diez filas
  organiza el conjunto autorizado recibido; no sustituye los filtros del API.
- Código y asunto abren `/mis-tickets/[ticketId]`, una página enlazable con
  conversación, historial y archivos. El borrador se conserva al cambiar de
  pestaña o fallar el envío. Las pestañas admiten flechas, Inicio y Fin. La
  información lateral procede del ticket y las descargas usan sus enlaces reales.
- El historial conserva fecha, actor, acción y valores anteriores/nuevos. Los
  actores conocidos muestran su nombre; los restantes conservan su ID, sin
  inventar identidades. Los errores permiten reintentar cada consulta.
- La vista rápida del inicio y de asignación comparte el mismo organismo. Se
  mantienen el alcance de lectura del API, las confirmaciones administrativas,
  la cancelación con opción de deshacer y las acciones existentes por rol.
- «Aplicaciones y secciones» utiliza tarjetas blancas uniformes, iconos azules
  sobre superficie tenue y «Ingresar» al pie. Conserva el catálogo autorizado y
  sus rutas de secciones/módulos; no añade accesos por apariencia. `WorkspaceIcon`
  incluye los contornos de Jurídico (`gavel-solid`) y Comunicación
  (`file-lines-regular`) de P07; los otros iconos conservan el registro existente.

El ajuste es del frontend: no requiere SQL, variables ni cambios adicionales en
las APIs. Las capturas de validación usan datos ficticios del laboratorio.

## Verificación

```bash
pnpm typecheck
pnpm test:integracion
pnpm exec next build --webpack
node scripts/verificar-cobertura-redisenio.cjs
node test/integracion/redisenio-browser.cjs
node test/integracion/plataforma-browser.cjs
node test/integracion/tickets-aplicaciones-browser.cjs
node test/integracion/aplicaciones-fuentes-browser.cjs
```

El recorrido de fidelidad requiere iniciar el laboratorio local en otra terminal:

```bash
pnpm laboratorio
TICKETS_LAB_TEST_URL=http://127.0.0.1:3030 node test/integracion/fidelidad-browser.cjs
```

Ese recorrido comprueba siete perfiles, superficies calculadas por el navegador,
composición P04 (títulos, orden, cuatro métricas, dos paneles y tres accesos),
menú de cinco entradas, pintado inicial de su entrada activa en la captura (sin
redimensionar), enlaces de accesos/ayuda/seguimiento y un fallo parcial
que no oculta el calendario ni fabrica ceros. También comprueba ausencia de
desbordamiento a 1920, 1440, 1024, 768 y 390 píxeles y adjuntos por teclado. Las capturas se guardan en
`QA_SCREENSHOT_DIR`, o `/tmp/tickets-fidelidad` por defecto. Usa datos ficticios
y únicamente acepta una dirección de loopback del laboratorio.

El recorrido general comprueba los 16 módulos y la navegación, las dos
confirmaciones y la conservación del formulario. Incluye una regresión del
panel de rendimiento del técnico para verificar su fondo blanco.

`tickets-aplicaciones-browser.cjs` comprueba búsqueda, filtros, paginación,
enlace directo y regreso al listado, pestañas por teclado, lectura del historial,
vista rápida del inicio, adjuntos, conservación del comentario ante un error y
reintento tras un envío fallido antes de guardar,
aislamiento de tickets ajenos y navegación de aplicaciones a módulos. Guarda
capturas de escritorio, tableta y móvil en `QA_SCREENSHOT_DIR` y verifica que no
haya desbordamiento del documento. La tabla puede desplazarse horizontalmente
en pantallas estrechas. Requiere compilar primero y Chromium local.

## Despliegue

Actualizar el frontend después de aprobar la PR hacia Dev y reconstruirlo con
`scripts/actualizar-servicio-preservando.py`, usando el contenedor real del Panel.
Se conservan Compose, redes y montajes actuales. La ampliación compatible de `/platform/metrics` en api-tickets añade
`pendientesRespuesta`, `sinAsignar`, `sinPrimeraAtencion`, nombres de aplicaciones y
`actividadTickets` cuando se pide `inicio=true`. El inicio del usuario consulta
`scope=creados`. Pendientes de respuesta significa solicitudes en estado 1/2 sin
primera atención; no se confunde con el contador de asignados. Todos los KPI se
refieren a tickets creados en los últimos 30 días y su estado actual.

Actualizar también esa PR de api-tickets para disponer de los indicadores nuevos.
Con un API anterior se muestra «— / Sin dato disponible» en los campos ausentes.
No se requieren tablas, SQL ni variables nuevas para este ajuste; la migración de
esquemas de Tickets sigue siendo un trabajo separado. La consulta SAT conserva
la configuración `SAT_MUNI_WS_*` documentada en api-tickets.
