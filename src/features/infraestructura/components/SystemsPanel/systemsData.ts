"use client";
import { useQuery } from "@tanstack/react-query";
import { platformKey, queryErrorMessage } from "@/platform/query";
import { platformFetch } from "@/platform/client";
import type { ServerSnapshot } from "@/platform/monitoring";
import type { PageResult, PlatformRecord } from "@/platform/types";
import { serverHealth, type ServerHealth } from "../ServerFleet/ServerFleet";

export type Portfolio = {
    apps: PlatformRecord[];
    repos: PlatformRecord[];
    deploys: PlatformRecord[];
    incidents: PlatformRecord[];
    schemas: PlatformRecord[];
    servers: Record<string, { name: string; health: ServerHealth }>;
};

const CLOSED = ["RESUELTO", "RESUELTA", "CERRADO", "CERRADA", "ATENDIDA", "INACTIVO"];
export const isOpenIncident = (r: PlatformRecord) => !CLOSED.includes(r.estado);
export const SEVERITY: Record<string, [string, string, number]> = {
    CRITICA: ["Crítica", "danger", 4],
    ALTA: ["Alta", "danger", 3],
    MEDIA: ["Media", "warning", 2],
    BAJA: ["Baja", "neutral", 1],
};
export const ENVIRONMENTS = ["PRODUCCION", "QA", "DESARROLLO"] as const;
export const ENV_LABEL: Record<string, string> = {
    PRODUCCION: "Producción",
    QA: "QA",
    DESARROLLO: "Desarrollo",
};
export const RESULT: Record<string, [string, string]> = {
    CORRECTO: ["Correcto", "success"],
    FALLIDO: ["Fallido", "danger"],
    REVERTIDO: ["Revertido", "warning"],
};

/** Último despliegue de una aplicación en un entorno. */
export function lastDeploy(deploys: PlatformRecord[], appId: string, env: string) {
    return deploys
        .filter((d) => d.datos.aplicacionId === appId && d.datos.entorno === env)
        .sort((a, b) => String(b.datos.fecha).localeCompare(String(a.datos.fecha)))[0];
}

/** Carga el portafolio completo; las listas no traen nombres de referencias, se cruzan aquí. */
export function usePortfolio(revision: number) {
    const query = useQuery({
        queryKey: [...platformKey("/portafolio"), revision],
        queryFn: async ({ signal }): Promise<Portfolio> => {
            const opts = { signal };
            const list = (type: string) =>
                platformFetch<PageResult<PlatformRecord>>(`/records/${type}?limit=100`, opts)
                    .then((r) => r.items)
                    .catch(() => [] as PlatformRecord[]);
            const [apps, repos, deploys, incidents, schemas, serverRows] = await Promise.all([
                platformFetch<PageResult<PlatformRecord>>("/records/aplicaciones?limit=100", opts).then(
                    (r) => r.items,
                ),
                list("repositorios"),
                list("despliegues"),
                list("incidencias"),
                list("esquemas"),
                list("servidores"),
            ]);
            const used = new Set(apps.map((a) => String(a.datos.servidorId || "")));
            const servers: Portfolio["servers"] = {};
            await Promise.all(
                serverRows
                    .filter((s) => used.has(s.id))
                    .map(async (s) => {
                        const snap = await platformFetch<ServerSnapshot>("/monitor/" + s.id, opts).catch(
                            () => null,
                        );
                        servers[s.id] = { name: s.nombre, health: serverHealth(snap) };
                    }),
            );
            return { apps, repos, deploys, incidents, schemas, servers };
        },
    });
    return {
        data: query.data ?? null,
        error: query.error ? queryErrorMessage(query.error, "No se pudo cargar el portafolio.") : "",
    };
}
