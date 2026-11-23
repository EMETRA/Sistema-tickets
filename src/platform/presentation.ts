import type { PlatformContextData } from "./types";
import { homeNavigation } from "./navigation";

export const WORKSPACE_VIEWS = [
  { id: "USUARIO", label: "Usuario" },
  { id: "TECNICO", label: "Técnico" },
  { id: "DESARROLLADOR", label: "Desarrollador" },
  { id: "DEVOPS", label: "DevOps" },
  { id: "ASIGNACION", label: "Asignación" },
  { id: "JEFATURA", label: "Jefatura" },
] as const;
export type WorkspaceView = (typeof WORKSPACE_VIEWS)[number]["id"];
export type WorkspaceViewSelection = WorkspaceView | "ACTUAL";

const common = ["calendario", "metricas"];
export const VIEW_SECTIONS: Record<WorkspaceView, readonly string[]> = {
  USUARIO: [...common, "solicitudes"],
  TECNICO: [...common, "asignacion", "inventario", "red"],
  DESARROLLADOR: [...common, "asignacion", "sistemas"],
  DEVOPS: [...common, "asignacion", "sistemas", "infraestructura"],
  ASIGNACION: [...common, "asignacion"],
  JEFATURA: [...common, "organizacion", "solicitudes"],
};

export function isWorkspaceView(value: string): value is WorkspaceView {
  return WORKSPACE_VIEWS.some((view) => view.id === value);
}

/** Solo presentación: nunca sustituye el bootstrap ni el runtime de autorización. */
export function workspacePresentation(
  source: PlatformContextData,
  selection: string,
): PlatformContextData {
  if (!source.actor.admin || !isWorkspaceView(selection)) return source;
  const sections = VIEW_SECTIONS[selection];
  return {
    ...source,
    actor: { ...source.actor, admin: false, mode: selection },
    definitions: Object.fromEntries(
      Object.entries(source.definitions).filter(([, definition]) =>
        sections.includes(definition.group),
      ),
    ),
    capabilities: {
      ...source.capabilities,
      assign: source.capabilities.assign && selection === "ASIGNACION",
      attend:
        source.capabilities.attend &&
        ["TECNICO", "DESARROLLADOR", "DEVOPS"].includes(selection),
      teamMetrics: source.capabilities.teamMetrics && selection === "JEFATURA",
      corporateAccess: false,
      audit: false,
      logs: source.capabilities.logs && selection === "DEVOPS",
    },
  };
}

export function workspaceViewNavigation(
  source: PlatformContextData,
  selection: string,
) {
  const navigation = homeNavigation(workspacePresentation(source, selection));
  if (!source.actor.admin || !isWorkspaceView(selection)) return navigation;
  const paths = new Set(VIEW_SECTIONS[selection].map((id) => "/espacio/" + id));
  const visible = (item: { path: string }) =>
    !item.path.startsWith("/espacio/") || paths.has(item.path);
  return {
    primary: navigation.primary.filter(visible),
    secondary: navigation.secondary.filter(visible),
  };
}
