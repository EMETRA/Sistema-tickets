# Sistema Tickets
Aplicacion web para gestion de tickets

## Requisitos
* Docker
* Docker Compose
* Inicializar `.env` a partir de `.env.example`

## Para iniciarlo
Para iniciar este proyecto solo debe correrse
```bash
docker-compose build
```

Y luego:
```bash
docker-compose up
```

## Puertos
Los puertos se configuran en `.env` mediante `APP_PORT` (aplicacion) y `STORYBOOK_PORT` (Storybook en modo DEV). Por defecto: `3000` y `6006`.

## Como verlo (Desarrollo)
Para el desarrollo de componentes se debe utilizar Storybook en el puerto definido por `STORYBOOK_PORT`.

Y para abrir la vista de desarrollo completa en el puerto definido por `APP_PORT`.

## Observaciones
Para desarrollar si es recomendable que se instalen primero las dependencias y se inicie el proyecto al menos una vez de forma local para el Intellisense:
```bash
pnpm install && pnpm dev
```

Luego de esto puede cerrarse y correr el docker normalmente.
