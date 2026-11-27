# Áreas de negocio (`src/features`)

El código se organiza en dos capas:

| Capa | Carpeta | Qué contiene | Puede importar |
| --- | --- | --- | --- |
| **Sistema de diseño** (Atomic Design) | `src/components/client/{atoms,molecules,organisms,templates}` | Piezas visuales reutilizables, sin lógica de un área: botones, campos, avisos (`StateNotice`), selector de personas (`PeoplePicker`), barra lateral, plantillas. | `src/theme`, `src/helpers`, otras piezas del sistema de diseño. |
| **Áreas** | `src/features/<área>/components` | Componentes con datos y reglas de un área: consultan el API, manejan permisos y estados del negocio. | El sistema de diseño, `src/platform`, `src/store`, `src/helpers` y, con moderación, otras áreas. |

Las **vistas** (`src/views`) y **páginas** (`src/app`) componen áreas y plantillas.
`src/platform` es la infraestructura compartida (cliente del API, contexto, tipos, tema).

## Áreas actuales

- `calendario`: agenda semanal, minicalendario, reuniones virtuales.
- `registros`: fichas genéricas (ver, editar, archivos, inventario) y búsqueda de registros.
- `tickets`: detalle, creación, conversación, listados y filtros.
- `infraestructura`: activos y mantenimiento, red, sistemas, servidores, repositorios.
- `personas`: personal de RRHH y equipos.
- `comunicacion`: noticias.
- `navegacion`: buscador global (⌘K).
- `recorrido`: recorrido guiado.

## Reglas

- ESLint impide que átomos, moléculas u organismos importen `@/features/*`. Si una pieza
  visual necesita datos, recíbelos por props; si necesita consultar el API, es de un área.
- Las historias de Storybook viven junto al componente (`*.stories.tsx`), en ambas capas.
- Para un área nueva: `src/features/<área>/components/<Componente>/` con su `.tsx`,
  `.module.scss`, `index.tsx` y `.stories.tsx`.
