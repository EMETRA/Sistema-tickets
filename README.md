# Sistema Tickets
Aplicacion web para gestion de tickets

## Requisitos
* Docker
* Docker Compose
* Node.js 20 y pnpm 8 (para instalar dependencias en el host)
* Inicializar `.env` a partir de `.env.example`

## Para iniciarlo

Las dependencias se instalan **en el host**, no dentro del contenedor. El proyecto se monta como volumen y el contenedor reutiliza `node_modules` del host.

```bash
corepack enable
pnpm install
docker compose build
docker compose up
```

Si cambias dependencias en `package.json`, vuelve a ejecutar `pnpm install` en el host antes de levantar el contenedor.

Antes de arrancar, el contenedor ejecuta `pnpm typecheck` y `pnpm build`. Si hay errores de tipado o compilacion, el contenedor termina con error y no inicia la aplicacion. Revisa los logs con:

```bash
docker compose logs -f
```

## Puertos
Los puertos se configuran en `.env` mediante `APP_PORT` (aplicacion) y `STORYBOOK_PORT` (Storybook en modo DEV). Por defecto: `3000` y `6006`.

## Como verlo (Desarrollo)
Para el desarrollo de componentes se debe utilizar Storybook en el puerto definido por `STORYBOOK_PORT`.

Y para abrir la vista de desarrollo completa en el puerto definido por `APP_PORT`.

## Observaciones
El contenedor usa `node:20-slim` (glibc) para compatibilidad con `node_modules` instalados en un Linux estándar. Si el host no es Linux o usa otra arquitectura, instala las dependencias en un entorno equivalente al contenedor.

Para desarrollo local sin Docker (Intellisense, etc.):
```bash
pnpm install && pnpm dev
```
