# Integración QA del Panel — 7 de octubre de 2026

Rama **Dev** (mayúscula). El login y las mutaciones llaman `/api/graphql` en
el mismo origen del Panel. Las lecturas y subidas de noticias llaman
`/api/COM03/*`. El servidor reenvía el Bearer a Tickets. Tickets contacta el CMS de Portal para
lecturas, fotos y creación, conservando el almacenamiento existente.
No configurar el navegador para llamar directamente al dominio del backend.

## Preparación y arranque

1. Obtener `api-tickets/QA`, con el proxy CMS de octubre 9, y levantar su servicio `api`.
   Mantener `API_PORTAL_URL` y `API_PORTAL_INTERNAL_KEY` de Tickets: la clave
   coincide con la configurada en Portal y nunca se introduce en el frontend.
2. Mantener las APIs en la red `vivi-qa-cierre`, con los alias
   `api-tickets-vivi-qa` y `api-portal-vivi-qa`.
3. En el checkout del Panel: `git switch Dev` y `git pull --ff-only origin Dev`.
4. Completar las variables de `env.qa.example` en `.env` sin borrar las demás.
   Para entrar por HTTP al puerto 4011, usar `NEXT_PUBLIC_AUTH_COOKIE_SECURE=false`.
   Para el dominio HTTPS, usar `true`. Reconstruir después de cambiar ese flag.
5. Ejecutar:

```bash
corepack pnpm install --frozen-lockfile
corepack pnpm typecheck
corepack pnpm test:integracion
docker compose -p vivi-panel-front -f docker-compose.qa.yml up -d --build
```

Este Compose independiente publica **4011**, evitando los puertos 3000/3002
que ya usan otras APIs. En la computadora, abrir `http://IP_DEL_SERVIDOR:4011`.
Si se usa el dominio del Panel, el proxy del dominio debe apuntar a este
contenedor. No combinar este archivo con el Compose de producción.

## Prueba con la sesión real

- Iniciar sesión. En Network debe aparecer `POST /api/graphql` del dominio
  del Panel y después `GET /api/usuario`, sin OPTIONS al dominio de Tickets.
- El perfil devuelve `direccion`, `puesto` y `permisos`. Dirección y puesto
  se consultan en RH usando ID_EMPRESA e ID_EMPLEADO de ADMAUTEMETRA.TB_USUARIOS.
- Abrir `/home/comunicacion/contenido/noticias`. La sesión necesita
  VIVI_NOTICIAS_LEER, VIVI_NOTICIAS_EDITAR y, para publicar,
  VIVI_NOTICIAS_PUBLICAR. Si falta un permiso, no se inventa ni se simula.
- Crear **un borrador** con autor, portada, imagen en una sección y una
  galería con imagen y YouTube. Guardar, volver al listado y abrir para editar:
  comprobar cada posición, texto, autor, categoría y etiqueta.
- Publicar esa misma noticia y comprobar que el Portal muestra su slug.
  El estado de push del listado proviene del backend. «Enviada al proveedor»
  todavía requiere comprobar recepción en el teléfono.
- Archivar: deja de aparecer en el Portal. Restaurar: vuelve a borrador.
  Esas acciones no eliminan imágenes ni deshacen un push ya enviado.

Los archivos nuevos se confirman antes de guardar la noticia. Si una subida
falla, no se presenta un guardado parcial como éxito. Un reintento conserva
los IDs confirmados y la clave idempotente del mismo contenido. La API valida
JPG/PNG/GIF y el total de 20 MB por noticia.

## Alcance comprobado

Build de Next y typecheck, pruebas de recursos/posiciones/reintentos y pruebas
HTTP de navegador contra APIs controladas. La sesión RH/Oracle y la recepción
push en un dispositivo se comprueban en el servidor y teléfono reales.
