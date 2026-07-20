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
docker compose build
docker compose up
```

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
