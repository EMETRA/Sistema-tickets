# Inicio, Noticias y recuperación de archivos

Inicio utiliza el ancho disponible con aplicaciones en una grilla adaptable y
actividad/reporte en columnas. Se conserva el catálogo real y sus permisos.
El saludo se integra al encabezado; se retira la tarjeta ilustrada que imponía
un ancho fijo. Se corrigen también las grillas de administrador y técnico,
con estados recuperables y protección ante estadísticas de cero tickets.

Noticias tiene un encabezado con actualizar/crear, total del filtro actual,
buscador siempre disponible, filtros, paginación y tabla semántica. La tabla
puede desplazarse dentro de su región en tablet, sin ensanchar la página.
Una consulta fallida muestra error y reintento; nunca simula una lista vacía.
El formulario organiza información/contenido junto a los archivos en escritorio,
apilando tarjetas cuando falta espacio y conservando edición, recursos e
idempotencia. Permite reintentar catálogos/detalle si no carga el formulario.

Las descargas de juzgado distinguen permiso, inexistencia y falta de acceso a
almacenamiento. Las respuestas HTML no se descargan como si fueran fotografías.
Se conservan rutas privadas con Bearer, validación MIME, hash y tamaño del backend.
El BFF registra `PANEL_ARCHIVO_ERROR` y `PANEL_NOTICIAS_ERROR` con referencia y
códigos, sin tokens, fotos, consultas ni rutas de almacenamiento.

## Aplicar

Primero actualizar api-tickets/QA. En eme02, el montaje faltante se incorpora
con el actualizador local de ese repositorio:

```bash
cd /root/api-tickets
git pull --ff-only origin QA
python3 scripts/actualizar-servicio-preservando.py api-tickets-api-1 --habilitar-evidencias --comprobar
# Si la comprobación termina correctamente:
python3 scripts/actualizar-servicio-preservando.py api-tickets-api-1 --habilitar-evidencias
```

Después, desde la carpeta de Sistema-tickets en el servidor del front:

```bash
git pull --ff-only origin Dev
python3 scripts/actualizar-servicio-preservando.py sistema-tickets-web --comprobar
python3 scripts/actualizar-servicio-preservando.py sistema-tickets-web
```

Los scripts están dentro de cada repositorio; el front no necesita carpetas del
servidor del backend. No requiere SQL, un APK nuevo o cambios de api-vivi_v2.
Si Noticias vuelve a fallar, conservar el HTTP/respuesta de `/api/COM03/noticias`
y su referencia; revisar las líneas indicadas del BFF y `TICKETS_CMS_ERROR`.

La lista de Noticias se recuperó por sí sola durante la revisión; no se atribuye
su fallo intermitente a una causa aún no comprobada. La imagen principal y las
imágenes de sección usan el mismo canal `/resources`; se requiere el HTTP/error
real de la subida o `guardarNoticiaCms` para diagnosticar el fallo del servidor.
Las pruebas locales usan archivos y servicios controlados, sin publicar noticias
reales ni consultar Oracle.
