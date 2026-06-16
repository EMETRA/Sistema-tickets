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

## Como verlo (Desarrollo)
Para el desarrollo de componentes se debe utilizar Storybook: [Abrir Storybook](http://localhost:6006)

Y para abrir la vista de desarrollo completa: [Abrir Proyecto](http://localhost:3000)

## Observaciones
Para desarrollar si es recomendable que se instalen primero las dependencias y se inicie el proyecto al menos una vez de forma local para el Intellisense:
```bash
pnpm install && pnpm dev
```

Luego de esto puede cerrarse y correr el docker normalmente.
