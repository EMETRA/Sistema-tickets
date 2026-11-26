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
