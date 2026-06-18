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

echo "Verificando tipos..."
pnpm typecheck

if [ "$MODE" = "DEV" ]; then
  echo "Verificando build..."
  pnpm build

  echo "Iniciando en modo DEV..."
  pnpm concurrently \
    "pnpm dev -- -p ${APP_PORT}" \
    "pnpm storybook --ci -- -p ${STORYBOOK_PORT}"
else
  echo "Compilando para produccion..."
  pnpm build

  echo "Iniciando servidor..."
  pnpm start -- -p "${APP_PORT}"
fi
