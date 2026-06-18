FROM node:20-slim

ENV NODE_ENV=production
ENV APP_PORT=3000

RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY node_modules ./node_modules
COPY . .

RUN pnpm typecheck && pnpm build

EXPOSE 3000

ENTRYPOINT [ "sh", "/app/entrypoint.sh" ]
