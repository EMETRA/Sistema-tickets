# Sistema Tickets
Aplicacion web para gestion de tickets

## Requisitos

### Produccion (Docker)
* Docker
* Docker Compose
* Node.js 20 y pnpm 8 (para instalar dependencias en el host antes del build)
* Inicializar `.env` a partir de `.env.example`

### Desarrollo local (sin Docker)
* Node.js 20 y pnpm 8
* Inicializar `.env` a partir de `.env.example`

## Produccion con Docker

Docker es solo para produccion. Las dependencias se instalan en el host y se copian a la imagen al construirla. El `typecheck` y el `build` se ejecutan en **`docker compose build`**: si fallan, la imagen no se crea.

```bash
corepack enable
pnpm install
pnpm entorno:check
docker compose build
docker compose up
```

### Variables de entorno

| Archivo | Plantilla | Contenido |
| --- | --- | --- |
| `.env` | `.env.example` | Compose (puertos, perfil QA) y variables **públicas** `NEXT_PUBLIC_*`. Se copia a la imagen y se lee al compilar: **sin secretos**. |
| `.env.tickets` | `env.tickets.example` | Variables **privadas** del servidor: `GRAPHQL_ENDPOINT`, `TICKETS_PLATFORM_ENABLED`, `AUTH_RECOVERY_BASE_URL`, `TICKETS_PANEL_ERROR_TOKEN`. Excluido de la imagen; Compose lo carga al arrancar. |

Copia cada plantilla, reemplaza los valores `<…>` y ejecuta `pnpm entorno:check` (no muestra valores):
detecta plantillas sin llenar, secretos en `.env`, variables públicas en `.env.tickets` y variables
que ya no se usan. Tras cambiar un `NEXT_PUBLIC_*`, reconstruye la imagen.

Si cambias dependencias en `package.json`:

```bash
pnpm install
docker compose build
```

`docker compose up` solo inicia la aplicacion ya compilada.

El puerto se configura en `.env` con `APP_PORT` (por defecto `3000`).

## Desarrollo local

Sin Docker:

```bash
corepack enable
pnpm install
pnpm dev
```

Storybook:

```bash
pnpm storybook
```

## Observaciones

El contenedor usa `node:20-slim` (glibc). Instala `node_modules` en un entorno Linux equivalente al contenedor antes de `docker compose build`.
