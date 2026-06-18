#!/bin/sh
set -eu

export PATH=$(pnpm bin):$PATH
export NODE_ENV=production

APP_PORT=${APP_PORT:-3000}
export PORT="${APP_PORT}"

echo "Iniciando servidor en puerto ${PORT}..."
exec pnpm start
