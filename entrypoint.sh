#!/bin/sh
set -eu

export PATH=$(pnpm bin):$PATH
export NODE_ENV=production

APP_PORT=${APP_PORT:-3000}

echo "Iniciando servidor..."
exec pnpm start -- -p "${APP_PORT}"
