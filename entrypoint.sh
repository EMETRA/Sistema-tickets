#!/bin/sh

export PATH=$(pnpm bin):$PATH

APP_PORT=${APP_PORT:-3000}
STORYBOOK_PORT=${STORYBOOK_PORT:-6006}

if [ "$MODE" = "DEV" ]; then
  pnpm concurrently \
    "pnpm dev -- -p ${APP_PORT}" \
    "pnpm storybook --ci -- -p ${STORYBOOK_PORT}"
else
  pnpm build && pnpm start -- -p "${APP_PORT}"
fi
