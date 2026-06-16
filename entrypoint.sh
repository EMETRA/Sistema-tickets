#!/bin/sh

export PATH=$(pnpm bin):$PATH

if [ "$MODE" = "DEV" ]; then
  pnpm concurrently "pnpm dev" "pnpm storybook --ci"
else
  pnpm build && pnpm start
fi
