"use client";
import { useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { usePlatform } from "@/platform/context";
import type { PlatformRecord } from "@/platform/types";
import { daysFromToday } from "../AssetsPanel/assetDates";
import { RecordEditor } from "@/features/registros/components/ResourceWorkspace/RecordEditor";
import {
    ENVIRONMENTS,
    ENV_LABEL,
    RESULT,
    SEVERITY,
    isOpenIncident,
    lastDeploy,
    usePortfolio,
} from "./systemsData";
import { SystemDossier } from "./SystemDossier";
import common from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
import tiles from "../AssetsPanel/AssetsPanel.module.scss";
import styles from "./SystemsPanel.module.scss";

const HEALTH: Record<string, string> = { ok: "Operativo", warn: "Revisar", down: "Sin datos" };
const shortAgo = (days: number | null) =>
    days === null ? "—" : days === 0 ? "hoy" : days === -1 ? "ayer" : `${-days} d`;

/** Propuesta: los sistemas a cargo como portafolio, con su salud operativa a la vista. */
export function SystemsPortfolio({ onShowRecords }: { onShowRecords: () => void }) {
    const { data: context } = usePlatform();
    const [revision, setRevision] = useState(0);
    const { data, error } = usePortfolio(revision);
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState<"todos" | "incidentes" | "fallos">("todos");
    const [open, setOpen] = useState<PlatformRecord | null>(null);
    const [creating, setCreating] = useState(false);
    const canCreate = !!context?.definitions.aplicaciones?.actions.INSERTAR;

    if (error)
        return (
            <p role="alert" className={common.error}>
                {error}
            </p>
        );
    if (!data) return <p className={common.muted}>Consultando el portafolio de sistemas…</p>;

    const openIncidents = data.incidents.filter(isOpenIncident);
    const severe = openIncidents.filter((i) => (SEVERITY[String(i.datos.severidad)]?.[2] || 0) >= 3);
    const recentDeploys = data.deploys.filter((d) => (daysFromToday(d.datos.fecha) ?? -99) >= -30);
    const badDeploys = recentDeploys.filter((d) => d.datos.resultado !== "CORRECTO");
    const prodBroken = (appId: string) => {
        const d = lastDeploy(data.deploys, appId, "PRODUCCION");
        return d && d.datos.resultado !== "CORRECTO";
    };
    const apps = data.apps
        .filter((a) =>
            `${a.nombre} ${a.datos.codigo || ""}`.toLowerCase().includes(query.trim().toLowerCase()),
        )
        .filter((a) =>
            filter === "incidentes"
                ? openIncidents.some((i) => i.datos.aplicacionId === a.id)
                : filter === "fallos"
                  ? data.deploys.some(
                        (d) =>
                            d.datos.aplicacionId === a.id &&
                            d.datos.resultado !== "CORRECTO" &&
                            (daysFromToday(d.datos.fecha) ?? -99) >= -30,
                    )
                  : true,
        )
        // Lo que requiere atención primero: incidentes graves y producción revertida o fallida.
        .sort((a, b) => {
            const weight = (x: PlatformRecord) =>
                openIncidents
                    .filter((i) => i.datos.aplicacionId === x.id)
                    .reduce((n, i) => n + (SEVERITY[String(i.datos.severidad)]?.[2] || 0), 0) +
                (prodBroken(x.id) ? 5 : 0);
            return weight(b) - weight(a) || a.nombre.localeCompare(b.nombre);
        });

    return (
        <section className={styles.portfolio} aria-label="Portafolio de sistemas">
            <div className={tiles.overview} role="group" aria-label="Resumen del portafolio">
                <button
                    type="button"
                    className={tiles.tile}
                    data-tone="info"
                    onClick={() => setFilter("todos")}
                >
                    <span className={tiles.tileLabel}>Sistemas a cargo</span>
                    <strong>{data.apps.length}</strong>
                    <small>{Object.keys(data.servers).length} servidores asociados</small>
                </button>
                <button
                    type="button"
                    className={tiles.tile}
                    data-tone={severe.length ? "danger" : "neutral"}
                    onClick={() => setFilter("incidentes")}
                >
                    <span className={tiles.tileLabel}>Incidentes abiertos</span>
                    <strong>{openIncidents.length}</strong>
                    <small>
                        {severe.length ? `${severe.length} altos o críticos` : "Ninguno alto o crítico"}
                    </small>
                </button>
                <button
                    type="button"
                    className={tiles.tile}
                    data-tone="neutral"
                    onClick={() => setFilter("todos")}
                >
                    <span className={tiles.tileLabel}>Despliegues · 30 días</span>
                    <strong>{recentDeploys.length}</strong>
                    <small>En todos los entornos</small>
                </button>
                <button
                    type="button"
                    className={tiles.tile}
                    data-tone={badDeploys.length ? "warning" : "neutral"}
                    onClick={() => setFilter("fallos")}
                >
                    <span className={tiles.tileLabel}>Fallidos o revertidos</span>
                    <strong>{badDeploys.length}</strong>
                    <small>Últimos 30 días</small>
                </button>
            </div>
            <div className={styles.bar}>
                <input
                    type="search"
                    className={styles.search}
                    placeholder="Buscar sistema por nombre o código…"
                    aria-label="Buscar sistema"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <div className={styles.filters} role="group" aria-label="Filtrar sistemas">
                    {(
                        [
                            ["todos", "Todos"],
                            ["incidentes", "Con incidentes"],
                            ["fallos", "Con despliegues con problemas"],
                        ] as const
                    ).map(([id, label]) => (
                        <button
                            key={id}
                            type="button"
                            aria-pressed={filter === id}
                            onClick={() => setFilter(id)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <div className={common.actions}>
                    <Button variant="outlined" onClick={onShowRecords}>
                        Ver registros
                    </Button>
                    {canCreate && <Button onClick={() => setCreating(true)}>Registrar sistema</Button>}
                </div>
            </div>
            <div className={styles.grid}>
                {apps.map((a) => {
                    const incidents = openIncidents.filter((i) => i.datos.aplicacionId === a.id);
                    const worst = incidents.reduce<string | null>(
                        (w, i) =>
                            (SEVERITY[String(i.datos.severidad)]?.[2] || 0) > (SEVERITY[w || ""]?.[2] || 0)
                                ? String(i.datos.severidad)
                                : w,
                        null,
                    );
                    const server = data.servers[String(a.datos.servidorId || "")];
                    const repos = data.repos.filter((r) => r.datos.aplicacionId === a.id).length;
                    return (
                        <button
                            key={a.id}
                            type="button"
                            className={styles.card}
                            data-alert={(worst && SEVERITY[worst][2] >= 3) || prodBroken(a.id) || undefined}
                            onClick={() => setOpen(a)}
                        >
                            <span className={styles.cardHead}>
                                <span className={styles.monogram} aria-hidden="true">
                                    {a.nombre
                                        .split(/\s+/)
                                        .slice(0, 2)
                                        .map((w) => w[0])
                                        .join("")
                                        .toUpperCase()}
                                </span>
                                <span className={styles.cardTitle}>
                                    <strong>{a.nombre}</strong>
                                    <small>{String(a.datos.codigo || "Sin código")}</small>
                                </span>
                                {server && (
                                    <span
                                        className={styles.health}
                                        data-health={server.health}
                                        title={`${server.name}: ${HEALTH[server.health]}`}
                                    >
                                        {HEALTH[server.health]}
                                    </span>
                                )}
                            </span>
                            <span className={styles.envs}>
                                {ENVIRONMENTS.map((env) => {
                                    const d = lastDeploy(data.deploys, a.id, env);
                                    const [label, tone] = d
                                        ? RESULT[String(d.datos.resultado)] || ["Registrado", "neutral"]
                                        : ["Sin despliegue", "none"];
                                    return (
                                        <span key={env} className={styles.env} data-tone={tone}>
                                            <small>{ENV_LABEL[env]}</small>
                                            <code>{d ? String(d.datos.revision) : "—"}</code>
                                            <em>
                                                {d
                                                    ? `${label} · ${shortAgo(daysFromToday(d.datos.fecha))}`
                                                    : label}
                                            </em>
                                        </span>
                                    );
                                })}
                            </span>
                            <span className={styles.cardFoot}>
                                {incidents.length ? (
                                    <span className={common.chip} data-tone={SEVERITY[worst || "BAJA"][1]}>
                                        {incidents.length}{" "}
                                        {incidents.length === 1 ? "incidente abierto" : "incidentes abiertos"}
                                        {worst ? ` · ${SEVERITY[worst][0].toLowerCase()}` : ""}
                                    </span>
                                ) : (
                                    <span className={common.chip} data-tone="success">
                                        Sin incidentes
                                    </span>
                                )}
                                <span className={styles.meta}>
                                    {repos} {repos === 1 ? "repositorio" : "repositorios"}
                                    {server ? ` · ${server.name}` : ""}
                                </span>
                            </span>
                        </button>
                    );
                })}
                {!apps.length && (
                    <p className={styles.empty}>Ningún sistema coincide con la búsqueda o el filtro.</p>
                )}
            </div>
            {open && (
                <SystemDossier
                    app={open}
                    portfolio={data}
                    onClose={() => setOpen(null)}
                    onChanged={() => setRevision((r) => r + 1)}
                />
            )}
            {creating && (
                <RecordEditor
                    type="aplicaciones"
                    onClose={() => setCreating(false)}
                    onSaved={() => {
                        setCreating(false);
                        setRevision((r) => r + 1);
                    }}
                />
            )}
        </section>
    );
}
export default SystemsPortfolio;
