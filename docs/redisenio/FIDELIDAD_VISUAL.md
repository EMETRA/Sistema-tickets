# Ajuste de fidelidad con la presentación aprobada

Referencia: **Sistema Tickets — Propuesta UX, revisión 3**, también entregada
como `Tickets.pptx` y sus cuatro partes. Se compararon las familias de pantallas
del inicio, formularios, listados y acceso con la presentación y su prototipo.
Las referencias principales fueron P01, P04, P05, P09, P11 y P34.

## Criterios compartidos

- Fondo del espacio de trabajo `#F4F6FB`; tarjetas blancas, borde azul grisáceo
  suave, radios y sombras consistentes.
- Superficie secundaria `#F8FAFF` para actividades y carga de archivos; los
  estados y alertas conservan sus colores y textos.
- Tipografía Montserrat y texto azul oscuro. Las familias heredadas de estilos
  utilizan la misma paleta que las plantillas nuevas.
- En el inicio, cabecera con acento azul, indicadores y dos columnas de trabajo.
  La actividad tiene prioridad para el usuario; la bandeja, para quienes
  atienden o asignan. Los accesos conservan sus permisos y se muestran al final.
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
`HomeWorkspace.module.scss`.

## Verificación

```bash
pnpm typecheck
pnpm test:integracion
pnpm exec next build --webpack
node scripts/verificar-cobertura-redisenio.cjs
node test/integracion/redisenio-browser.cjs
node test/integracion/plataforma-browser.cjs
```

El recorrido de fidelidad requiere iniciar el laboratorio local en otra terminal:

```bash
pnpm laboratorio
TICKETS_LAB_TEST_URL=http://127.0.0.1:3030 node test/integracion/fidelidad-browser.cjs
```

Ese recorrido comprueba siete perfiles, superficies calculadas por el navegador,
orden de lectura del inicio, ausencia de desbordamiento a 1920, 1440, 1024, 768
y 390 píxeles, y selección de archivos por teclado. Las capturas se guardan en
`QA_SCREENSHOT_DIR`, o `/tmp/tickets-fidelidad` por defecto. Usa datos ficticios
y únicamente acepta una dirección de loopback del laboratorio.

El recorrido general comprueba los 16 módulos y la navegación, las dos
confirmaciones y la conservación del formulario. Incluye una regresión del
panel de rendimiento del técnico para verificar su fondo blanco.

## Despliegue

Actualizar el frontend después de aprobar la PR hacia Dev y reconstruirlo con
`scripts/actualizar-servicio-preservando.py`, usando el contenedor real del Panel.
Se conservan Compose, redes y montajes actuales. Este ajuste no requiere SQL,
cambios en las APIs ni nuevas variables de entorno.
