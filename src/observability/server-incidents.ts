import { randomUUID } from "node:crypto";
import {
    mkdir,
    readFile,
    readdir,
    unlink,
    writeFile,
    link,
} from "node:fs/promises";
import { join } from "node:path";
import { getGraphqlEndpoint } from "@/api/config/env";
import {
    diagnosticoErrorGraphql,
    estadoErrorGraphql,
} from "@/api/graphql/server-error";
type Event = {
    referencia: string;
    origen: "PANEL";
    operacion: string;
    codigos: string[];
    ocurridoEn: string;
};
let flushing = false;
let timer: NodeJS.Timeout | undefined;
const directory = () =>
    process.env.TICKETS_ERROR_QUEUE_DIR || "/tmp/tickets-panel-incidents";
export function backendReference(error: unknown): string | undefined {
    const root = error as {
        response?: {
            errors?: {
                extensions?: {
                    referencia?: unknown;
                    originalError?: { referencia?: unknown };
                };
            }[];
        };
    };
    const e = root?.response?.errors?.[0]?.extensions;
    const value = e?.referencia || e?.originalError?.referencia;
    return typeof value === "string" && /^[a-f0-9-]{36}$/.test(value)
        ? value
        : undefined;
}
export async function queuePanelIncident(
    operacion: string,
    error: unknown,
    referencia = randomUUID(),
) {
    const existing = backendReference(error);
    if (existing) return existing;
    if ([401, 403].includes(estadoErrorGraphql(error))) return referencia;
    const diagnostic = diagnosticoErrorGraphql(error);
    if (
        diagnostic.codigosGraphql.some((c) =>
            ["BAD_USER_INPUT", "BAD_REQUEST"].includes(c),
        ) &&
        !diagnostic.codigosOracle.length
    )
        return referencia;
    const event: Event = {
        referencia,
        origen: "PANEL",
        operacion: operacion.replace(/[^A-Za-z0-9_.:/-]/g, "_").slice(0, 120),
        codigos: [
            ...diagnostic.codigosOracle,
            ...diagnostic.codigosTransporte,
            ...diagnostic.codigosGraphql,
        ].slice(0, 12),
        ocurridoEn: new Date().toISOString(),
    };
    try {
        await mkdir(directory(), { recursive: true, mode: 0o700 });
        if ((await readdir(directory())).length >= 10000)
            throw Error("QUEUE_FULL");
        const temporary = join(
            directory(),
            referencia + "." + randomUUID() + ".tmp",
        );
        try {
            await writeFile(temporary, JSON.stringify(event), {
                flag: "wx",
                mode: 0o600,
            });
            await link(temporary, join(directory(), referencia + ".json"));
        } finally {
            await unlink(temporary).catch(() => {});
        }
        if (!timer) {
            timer = setInterval(() => void flushPanelIncidents(), 30000);
            timer.unref();
        }
        void flushPanelIncidents();
    } catch {
        console.warn(
            JSON.stringify({
                evento: "PANEL_INCIDENCIA_NO_ENCOLADA",
                referencia,
            }),
        );
    }
    return referencia;
}
export async function flushPanelIncidents() {
    if (!timer) {
        timer = setInterval(() => void flushPanelIncidents(), 30000);
        timer.unref();
    }
    if (flushing || !process.env.TICKETS_PANEL_ERROR_TOKEN) return;
    flushing = true;
    try {
        const url = new URL(getGraphqlEndpoint());
        url.pathname =
            url.pathname.replace(/\/graphql\/?$/, "") +
            "/platform/integrations/panel-errors";
        url.search = "";
        const files = (await readdir(directory()))
            .filter((name) => /^[a-f0-9-]{36}\.json$/.test(name))
            .sort()
            .slice(0, 50);
        for (const name of files) {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization:
                        "Bearer " + process.env.TICKETS_PANEL_ERROR_TOKEN,
                },
                body: await readFile(join(directory(), name), "utf8"),
                redirect: "error",
                cache: "no-store",
                signal: AbortSignal.timeout(5000),
            });
            if (!response.ok) break;
            const result = (await response.json()) as { encolada?: boolean };
            if (result.encolada !== true) break;
            await unlink(join(directory(), name));
        }
    } catch {
        /* Se conserva en disco; no se registra otra incidencia por un fallo del emisor. */
    } finally {
        flushing = false;
    }
}
