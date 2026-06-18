#!/bin/sh
set -eu

export PATH=$(pnpm bin):$PATH

APP_PORT=${APP_PORT:-3000}
STORYBOOK_PORT=${STORYBOOK_PORT:-6006}

if [ "$MODE" = "DEV" ]; then
  export NODE_ENV=development
else
  export NODE_ENV=production
fi

echo "Limpiando artefactos de build anteriores..."
rm -rf .next

echo "Verificando tipos..."
pnpm typecheck

echo "Compilando aplicacion..."
pnpm build

if [ "$MODE" = "DEV" ]; then
  echo "Iniciando en modo DEV..."
  exec pnpm concurrently \
    "pnpm dev -- -p ${APP_PORT}" \
    "pnpm storybook --ci -- -p ${STORYBOOK_PORT}"
else
  echo "Iniciando servidor..."
  exec pnpm start -- -p "${APP_PORT}"
fi
