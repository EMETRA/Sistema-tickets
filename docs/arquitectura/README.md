# Arquitectura del Panel institucional

| Tema | Guía |
| --- | --- |
| Capas: sistema de diseño (Atomic Design) y áreas de negocio | [`src/features/README.md`](../../src/features/README.md) |
| Colores y medidas desde una sola fuente | `src/theme/tokens.json` → `pnpm tokens` |
| Lectura del API (TanStack Query) | [consultas.md](consultas.md) |
| Formularios (react-hook-form + zod) | [formularios.md](formularios.md) |
| Accesibilidad verificada (Playwright + axe, Storybook) | [accesibilidad.md](accesibilidad.md) |

## Comandos de calidad (los mismos que corre CI)

```bash
pnpm format:check      # Prettier
pnpm tokens:check      # tokens.css y colors.scss generados al día
pnpm lint              # ESLint (incluye la frontera sistema de diseño ↔ áreas)
pnpm typecheck         # TypeScript
pnpm test:integracion  # pruebas de Node
pnpm build-storybook   # Storybook compila
pnpm e2e               # Playwright + axe sobre el laboratorio local
```

CI: `.github/workflows/ci.yml` (pull requests y pushes a Dev y main, Node 20 como producción).
Para que Git ignore el commit de formato en `git blame`:

```bash
git config blame.ignoreRevsFile .git-blame-ignore-revs
```

## Contrato con api-tickets

`pnpm contrato` compara el panel con el API (por defecto `../../apis/api-tickets`; otra ruta con
`API_TICKETS_DIR=...`). Usa la rama que corresponde: **QA** para `Dev`, **main** para `main`.

- `scripts/sincronizar-definiciones.cjs <api> [--check]`: definiciones de recursos → fixture del
  laboratorio y las pruebas (`test/fixtures/platform-definitions.json`).
- `scripts/contrato-api.cjs <api>`: cada ruta `/platform/...` que llama el panel existe en el API.
- `scripts/contrato-graphql.cjs <api>`: cada consulta y mutación GraphQL valida contra `src/schema.gql`.
  Diferencias conocidas del API, con su motivo, en `scripts/contrato-graphql.excepciones.json`.

En CI corre si el repositorio tiene el secreto `API_TICKETS_TOKEN` (lectura de `EMETRA/api-tickets`).
El laboratorio valida los registros con las mismas reglas que `platform.validation.ts` del API.
