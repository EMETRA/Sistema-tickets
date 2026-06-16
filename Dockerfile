FROM node:20-alpine

ENV MODE=${MODE:+DEV}
ENV APP_PORT=3000
ENV STORYBOOK_PORT=6006

RUN corepack enable pnpm

WORKDIR /app

COPY . .

RUN chmod +x /app/entrypoint.sh

EXPOSE 3000
EXPOSE 6006

RUN pnpm install
RUN pnpm add concurrently -D
RUN pnpm list

RUN ls -la

ENTRYPOINT [ "/app/entrypoint.sh" ]
