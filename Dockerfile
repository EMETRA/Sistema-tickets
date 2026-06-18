FROM node:20-slim

ENV MODE=${MODE:+DEV}
ENV APP_PORT=3000
ENV STORYBOOK_PORT=6006

RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

WORKDIR /app

EXPOSE 3000
EXPOSE 6006

ENTRYPOINT [ "sh", "/app/entrypoint.sh" ]
