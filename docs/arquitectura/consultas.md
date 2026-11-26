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

## Cargas imperativas

Las que acumulan páginas o comparten una solicitud entre lista y detalle (cola PMT, catálogos de CCT)
siguen con su `load()` y se disparan con `useEffectEvent`, para usar siempre la versión actual sin
repetir el efecto. Se migran cuando se rediseñe cada flujo, con `useInfiniteQuery`.

## Ya migradas

`PeoplePicker` (y `usePeopleNames`), ficha de registros (detalle e historial), directorio de personal,
perfil e historial de RRHH, arranque de CCT y evidencias de PMT.

## Pendientes (cargan con `useEffect` + `platformFetch`)

Migrar por área, al tocar cada pantalla:

- `components/client/molecules/PeoplePicker/PeoplePicker.tsx`
- `components/client/molecules/PlatformField/PlatformField.tsx`
- `components/client/organisms/FileViewer/FileViewer.tsx`
- `components/client/organisms/ModuleAccessGate/ModuleAccessGate.tsx`
- `features/calendario/components/CalendarRail/CalendarRail.tsx`
- `features/infraestructura/components/AssetsPanel/AssetInventory.tsx`
- `features/infraestructura/components/AssetsPanel/AssetsOverview.tsx`
- `features/infraestructura/components/AssetsPanel/MaintenanceBoard.tsx`
- `features/infraestructura/components/NetworkPanel/NetworkOverview.tsx`
- `features/infraestructura/components/OperationsSummary/OperationsSummary.tsx`
- `features/infraestructura/components/RepositoryStatus/RepositoryStatus.tsx`
- `features/infraestructura/components/ServerFleet/ServerFleet.tsx`
- `features/infraestructura/components/ServerMonitor/ServerMonitor.tsx`
- `features/infraestructura/components/SourceCatalog/SourceCatalog.tsx`
- `features/infraestructura/components/SystemsPanel/SystemDossier.tsx`
- `features/infraestructura/components/SystemsPanel/systemsData.ts`
- `features/navegacion/components/CommandPalette/CommandPalette.tsx`
- `features/personas/components/PeoplePanel/TeamsBoard.tsx`
- `features/registros/components/RecordSearch/RecordSearch.tsx`
- `features/registros/components/ResourceWorkspace/InventoryPicker.tsx`
- `features/registros/components/ResourceWorkspace/RecordDetail.tsx`
- `features/registros/components/ResourceWorkspace/RecordEditor.tsx`
- `features/registros/components/ResourceWorkspace/RecordFiles.tsx`
- `features/registros/components/ResourceWorkspace/ResourceWorkspace.tsx`
- `features/tickets/components/TicketDetail/TicketClassification.tsx`
- `platform/context.tsx`
- `platform/hr-notifications.tsx`
- `platform/query.tsx`
- `views/Platform/AccessWorkspace.tsx`
- `views/Platform/AssignmentsWorkspace.tsx`
- `views/Platform/AuditWorkspace.tsx`
- `views/Platform/CalendarWorkspace.tsx`
- `views/Platform/CctAgentAssignments.tsx`
- `views/Platform/CctCepoReport.tsx`
- `views/Platform/CctCepos.tsx`
- `views/Platform/CctParts.tsx`
- `views/Platform/CctWorkspace.tsx`
- `views/Platform/HrCampaignsWorkspace.tsx`
- `views/Platform/HrProfileWorkspace.tsx`
- `views/Platform/LaunchpadHome.tsx`
- `views/Platform/MetricsWorkspace.tsx`
- `views/Platform/NetworkWorkspace.tsx`
- `views/Platform/PayrollWorkspace.tsx`
- `views/Platform/RecordPage.tsx`
- `views/Platform/SystemsWorkspace.tsx`
- `views/Platform/TicketTagReport.tsx`
- `views/Platform/TransitReprintsWorkspace.tsx`
- `views/Platform/ViviPmtWorkspace.tsx`
- `views/Platform/ViviReportsWorkspace.tsx`
- `views/Platform/WorkerNotificationsWorkspace.tsx`
