export type ObservedContainer = {
  nombre: string;
  estado: string;
  salud: string | null;
  imagen: string | null;
  version: string | null;
  logs?: string;
  logsEstado?: string;
};
export type ServerSnapshot = {
  disponible: boolean;
  estado: string;
  observadoEn: string | null;
  metricas: Record<string, number> | null;
  contenedores: ObservedContainer[];
};
export type ContainerFilter = "todos" | "running" | "atencion" | "detenidos";
export function needsAttention(c: ObservedContainer) {
  return c.salud === "unhealthy" || ["restarting", "dead"].includes(c.estado);
}
export function matchesContainer(
  c: ObservedContainer,
  query: string,
  filter: ContainerFilter,
) {
  const match = [c.nombre, c.imagen, c.version].some((value) =>
    value?.toLowerCase().includes(query.trim().toLowerCase()),
  );
  return (
    match &&
    (filter === "todos" ||
      (filter === "atencion"
        ? needsAttention(c)
        : filter === "running"
          ? c.estado === "running"
          : ["exited", "paused", "created"].includes(c.estado)))
  );
}
export function executionLabel(state: string) {
  return (
    (
      {
        running: "En ejecución",
        exited: "Detenido",
        paused: "En pausa",
        restarting: "Reiniciando",
        dead: "Error",
        created: "Creado",
        removing: "Eliminando",
      } as Record<string, string>
    )[state] || state
  );
}
export function healthLabel(state: string | null) {
  return (
    (
      {
        healthy: "Correcto",
        unhealthy: "Con fallos",
        starting: "Iniciando",
      } as Record<string, string>
    )[state || ""] || "Sin comprobación"
  );
}
export function logMessage(c?: ObservedContainer) {
  if (!c)
    return "Este contenedor ya no aparece en la última observación. Selecciona otro contenedor.";
  if (c.logs?.trim()) return "";
  return (
    (
      {
        NO_HABILITADO:
          "La lectura de logs de este contenedor no está habilitada en el observador del servidor. Solicita habilitar su nombre exacto en logContainers.",
        SIN_LINEAS:
          "La lectura está habilitada, pero no hubo líneas de log en los últimos cinco minutos.",
        ERROR_LECTURA:
          "El observador no pudo leer los logs de este contenedor. Las mediciones del servidor siguen disponibles.",
        LIMITE_ALCANZADO:
          "Se alcanzó el límite de logs de esta observación. Reduce la lista de contenedores habilitados en el servidor.",
      } as Record<string, string>
    )[c.logsEstado || ""] ||
    "Esta observación no incluye líneas de log. Comprueba que el nombre exacto esté habilitado y que haya actividad en los últimos cinco minutos. Si el observador es anterior, actualízalo para conocer el motivo."
  );
}
export function usagePercent(used?: number, total?: number) {
  return total && used !== undefined
    ? Math.min(100, Math.max(0, (used / total) * 100))
    : null;
}
export function gib(value: number) {
  return (value / 1073741824).toFixed(1);
}
export function uptime(seconds?: number) {
  if (seconds === undefined) return "No informado";
  const days = Math.floor(seconds / 86400),
    hours = Math.floor((seconds % 86400) / 3600);
  return days
    ? `${days} d ${hours} h`
    : `${hours} h ${Math.floor((seconds % 3600) / 60)} min`;
}
