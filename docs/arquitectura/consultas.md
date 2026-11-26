# Consultas al API con TanStack Query

Las lecturas del API del Panel usan **TanStack Query** (`@tanstack/react-query`), con
`QueryProvider` montado en `src/app/(dashboard)/layout.tsx`.

## Cómo leer datos

```tsx
import { usePlatformQuery, queryErrorMessage } from "@/platform/query";

const query = usePlatformQuery<MiTipo>("/records/activos?limit=50");
const datos = query.data ?? null;              // undefined mientras carga
const error = queryErrorMessage(query.error);  // texto con «Referencia: …» si existe
<Button onClick={() => void query.refetch()}>Reintentar</Button>
```

- `path = null` deja la consulta en espera (por ejemplo, hasta abrir un panel o elegir un registro).
- La clave es `["platform", path]` (`platformKey(path)`): dos pantallas que piden la misma ruta comparten caché.
- Se cancela sola al desmontar o al cambiar la ruta (sin `AbortController` manual) y tiene tope de 45 s.
- Reintenta solo fallas temporales (sin conexión, tiempo agotado, 502/503/504). Los errores de permisos,
  validación o «no implementado» se muestran de inmediato.
- `staleTime: 0`: muestra lo que ya está en caché y lo actualiza en segundo plano. Listas estables
  (personas) definen un `staleTime` mayor.
- Al cambiar de sesión se vacía la caché.

## Después de guardar

Actualiza la ficha y refresca las listas:

```ts
const queryClient = useQueryClient();
queryClient.setQueryData(platformKey("/records/" + type + "/" + saved.id), saved);
void queryClient.invalidateQueries({ queryKey: ["platform"] });
```

## Varias rutas a la vez

`usePlatformQueries(paths, { revision, enabled })` consulta en paralelo; cada lista falla por separado
(su dato queda en `null`) y las demás se muestran. Se usa en los resúmenes (Activos, Red, Operaciones),
el portafolio de Sistemas, la Mesa de servicio y el Inicio.

## Después de guardar

Cualquier `platformCommand` correcto invalida las consultas bajo `["platform"]`: las pantallas visibles
se actualizan solas. El arranque del espacio (`/bootstrap`) y los avisos de RRHH usan claves de sesión
(`["sesion", …]`) y no se repiten en cada guardado; se actualizan con `refresh()`.

Para reflejar el resultado al instante (sin esperar la nueva consulta):

```ts
queryClient.setQueryData(platformKey("/records/" + type + "/" + saved.id), saved);
```

## Cargas imperativas (a propósito)

Siguen con su función `load()` porque el usuario **aplica** filtros con un botón, la respuesta se valida
y se conserva el último resultado bueno si la consulta falla, o se acumulan páginas:

- Calendario (páginas de actividades por periodo), cola de PMT, catálogos y asignaciones de CCT.
- Reporte de etiquetas de tickets, Métricas y Reportes de VIVI.
- Búsquedas por formulario de CCT (cepos, reportes), Reimpresiones de tránsito y la vista de boletas.

La carga inicial usa `useEffectEvent` (sin `eslint-disable`). Si se rediseña alguno de estos flujos,
conviene `useQuery` con la selección aplicada en la clave o `useInfiniteQuery` para las páginas.

## Migradas

Toda lectura que dependía de `useEffect` + `platformFetch`: resúmenes, listas y fichas de registros,
búsqueda, archivos y visor, inventario, monitor y flota de servidores, repositorios, fuentes, sistemas,
red, accesos, nómina (opciones y envíos), campañas y perfil de RRHH, Mesa de servicio, Inicio,
avisos del personal, buscador global, control de acceso a formularios, opciones de campos, arranque del
espacio de trabajo y avisos de RRHH.
