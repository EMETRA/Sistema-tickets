FROM node:20-slim

ENV MODE=${MODE:+DEV}
ENV APP_PORT=3000
ENV STORYBOOK_PORT=6006

RUN corepack enable pnpm

WORKDIR /app

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 3000
EXPOSE 6006

ENTRYPOINT [ "/app/entrypoint.sh" ]
