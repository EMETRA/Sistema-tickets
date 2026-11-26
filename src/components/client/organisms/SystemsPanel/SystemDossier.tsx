"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { PopOver } from "@/components/client/atoms/PopOver";
import { platformFetch } from "@/platform/client";
import { usePlatform } from "@/platform/context";
import type { PlatformRecord } from "@/platform/types";
import { daysFromToday, relativeDays } from "../AssetsPanel/assetDates";
import { RecordDetail } from "../ResourceWorkspace/RecordDetail";
import { RecordEditor } from "../ResourceWorkspace/RecordEditor";
import {
    ENVIRONMENTS,
    ENV_LABEL,
    RESULT,
    SEVERITY,
    isOpenIncident,
    lastDeploy,
    type Portfolio,
} from "./systemsData";
import common from "../../templates/PlatformPage/PlatformPage.module.scss";
import styles from "./SystemsPanel.module.scss";

type Sub = { type: string; record: PlatformRecord };

/** Expediente de un sistema: enlaces, servidor, entornos, repositorios, despliegues, incidentes y esquemas. */
export function SystemDossier({
    app,
    portfolio,
    onClose,
    onChanged,
}: {
    app: PlatformRecord;
    portfolio: Portfolio;
    onClose: () => void;
    onChanged: () => void;
}) {
    const { data } = usePlatform();
    const [detail, setDetail] = useState<PlatformRecord>(app);
    const [sub, setSub] = useState<Sub | null>(null);
    const [create, setCreate] = useState<string | null>(null);
    const [editing, setEditing] = useState<Sub | null>(null);
    // El detalle trae los nombres de las referencias (responsable, servidor).
    useEffect(() => {
        const c = new AbortController();
        platformFetch<PlatformRecord>(`/records/aplicaciones/${app.id}`, { signal: c.signal })
            .then((r) => !c.signal.aborted && setDetail(r))
            .catch(() => undefined);
        return () => c.abort();
    }, [app.id]);
    const can = (type: string, action: "INSERTAR" | "EDITAR") => !!data?.definitions[type]?.actions[action];
    const repos = portfolio.repos.filter((r) => r.datos.aplicacionId === app.id);
    const deploys = portfolio.deploys
        .filter((d) => d.datos.aplicacionId === app.id)
        .sort((a, b) => String(b.datos.fecha).localeCompare(String(a.datos.fecha)));
    const incidents = portfolio.incidents
        .filter((i) => i.datos.aplicacionId === app.id)
        .sort(
            (a, b) =>
                Number(isOpenIncident(b)) - Number(isOpenIncident(a)) ||
                (SEVERITY[String(b.datos.severidad)]?.[2] || 0) -
                    (SEVERITY[String(a.datos.severidad)]?.[2] || 0),
        );
    const schemas = portfolio.schemas.filter((s) => s.datos.aplicacionId === app.id);
    const server = portfolio.servers[String(app.datos.servidorId || "")];
    const busy = !!(sub || create || editing);

    return (
        <>
            <PopOver
                isOpen={!busy}
                onClose={onClose}
                ariaLabel={"Expediente de " + app.nombre}
                className={styles.dossier}
            >
                <header className={styles.dossierHead}>
                    <span className={styles.monogram} aria-hidden="true">
                        {app.nombre
                            .split(/\s+/)
                            .slice(0, 2)
                            .map((w) => w[0])
                            .join("")
                            .toUpperCase()}
                    </span>
                    <div>
                        <p className={styles.eyebrow}>Sistema · {String(app.datos.codigo || "Sin código")}</p>
                        <h2>{app.nombre}</h2>
                        {!!app.datos.descripcion && (
                            <p className={styles.lead}>{String(app.datos.descripcion)}</p>
                        )}
                    </div>
                    <button
                        type="button"
                        className={styles.close}
                        onClick={onClose}
                        aria-label="Cerrar expediente"
                    >
                        ×
                    </button>
                </header>
                <div className={styles.dossierBody}>
                    <dl className={styles.facts}>
                        <div>
                            <dt>Responsable</dt>
                            <dd>{detail.labels?.responsableId || "Sin asignar"}</dd>
                        </div>
                        <div>
                            <dt>Servidor</dt>
                            <dd>
                                {server ? (
                                    <span className={styles.health} data-health={server.health}>
                                        {server.name}
                                    </span>
                                ) : (
                                    detail.labels?.servidorId || "Sin servidor"
                                )}
                            </dd>
                        </div>
                        <div>
                            <dt>Enlaces</dt>
                            <dd className={styles.urls}>
                                {app.datos.frontUrl ? (
                                    <a href={String(app.datos.frontUrl)} target="_blank" rel="noreferrer">
                                        Aplicación ↗
                                    </a>
                                ) : null}
                                {app.datos.backUrl ? (
                                    <a href={String(app.datos.backUrl)} target="_blank" rel="noreferrer">
                                        API ↗
                                    </a>
                                ) : null}
                                {!app.datos.frontUrl && !app.datos.backUrl && "Sin enlaces"}
                            </dd>
                        </div>
                    </dl>

                    <section className={styles.block}>
                        <h3>Entornos</h3>
                        <div className={styles.envs}>
                            {ENVIRONMENTS.map((env) => {
                                const d = lastDeploy(portfolio.deploys, app.id, env);
                                const [label, tone] = d
                                    ? RESULT[String(d.datos.resultado)] || ["Registrado", "neutral"]
                                    : ["Sin despliegue", "none"];
                                return (
                                    <span key={env} className={styles.env} data-tone={tone}>
                                        <small>{ENV_LABEL[env]}</small>
                                        <code>{d ? String(d.datos.revision) : "—"}</code>
                                        <em>
                                            {d
                                                ? `${label} · ${relativeDays(daysFromToday(d.datos.fecha)).toLowerCase()}`
                                                : label}
                                        </em>
                                    </span>
                                );
                            })}
                        </div>
                    </section>

                    <div className={styles.columns}>
                        <section className={styles.block}>
                            <div className={styles.blockHead}>
                                <h3>Incidentes ({incidents.filter(isOpenIncident).length} abiertos)</h3>
                                {can("incidencias", "INSERTAR") && (
                                    <button
                                        type="button"
                                        className={common.link}
                                        onClick={() => setCreate("incidencias")}
                                    >
                                        + Registrar incidente
                                    </button>
                                )}
                            </div>
                            <ul className={styles.rows}>
                                {incidents.map((i) => {
                                    const [label, tone] = SEVERITY[String(i.datos.severidad)] || [
                                        "Sin severidad",
                                        "neutral",
                                    ];
                                    const open = isOpenIncident(i);
                                    return (
                                        <li key={i.id} data-closed={!open || undefined}>
                                            <button
                                                type="button"
                                                onClick={() => setSub({ type: "incidencias", record: i })}
                                            >
                                                <span
                                                    className={common.chip}
                                                    data-tone={open ? tone : "neutral"}
                                                >
                                                    {open ? label : "Cerrado"}
                                                </span>
                                                <span className={styles.rowText}>
                                                    {i.nombre}
                                                    <small>
                                                        {relativeDays(daysFromToday(i.creadoEn))}
                                                        {i.datos.ticketId
                                                            ? ` · Ticket #${String(i.datos.ticketId)}`
                                                            : ""}
                                                    </small>
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })}
                                {!incidents.length && (
                                    <li className={styles.none}>Sin incidentes registrados.</li>
                                )}
                            </ul>
                        </section>
                        <section className={styles.block}>
                            <div className={styles.blockHead}>
                                <h3>Despliegues</h3>
                                {can("despliegues", "INSERTAR") && (
                                    <button
                                        type="button"
                                        className={common.link}
                                        onClick={() => setCreate("despliegues")}
                                    >
                                        + Registrar despliegue
                                    </button>
                                )}
                            </div>
                            <ol className={styles.timeline}>
                                {deploys.slice(0, 6).map((d) => {
                                    const [label, tone] = RESULT[String(d.datos.resultado)] || [
                                        "Registrado",
                                        "neutral",
                                    ];
                                    return (
                                        <li key={d.id} data-tone={tone}>
                                            <button
                                                type="button"
                                                onClick={() => setSub({ type: "despliegues", record: d })}
                                            >
                                                <code>{String(d.datos.revision)}</code>
                                                <span className={styles.rowText}>
                                                    {ENV_LABEL[String(d.datos.entorno)] ||
                                                        String(d.datos.entorno)}{" "}
                                                    · {label}
                                                    <small>
                                                        {relativeDays(daysFromToday(d.datos.fecha))}
                                                    </small>
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })}
                                {!deploys.length && (
                                    <li className={styles.none}>Sin despliegues registrados.</li>
                                )}
                            </ol>
                        </section>
                    </div>

                    <div className={styles.columns}>
                        <section className={styles.block}>
                            <h3>Repositorios</h3>
                            <ul className={styles.rows}>
                                {repos.map((r) => (
                                    <li key={r.id}>
                                        <button
                                            type="button"
                                            onClick={() => setSub({ type: "repositorios", record: r })}
                                        >
                                            <span className={common.chip}>
                                                {String(r.datos.componente || "OTRO")}
                                            </span>
                                            <span className={styles.rowText}>
                                                {r.nombre}
                                                <small>Rama {String(r.datos.rama || "—")}</small>
                                            </span>
                                        </button>
                                    </li>
                                ))}
                                {!repos.length && (
                                    <li className={styles.none}>Sin repositorios vinculados.</li>
                                )}
                            </ul>
                        </section>
                        <section className={styles.block}>
                            <h3>Esquemas Oracle</h3>
                            <ul className={styles.rows}>
                                {schemas.map((s) => (
                                    <li key={s.id}>
                                        <button
                                            type="button"
                                            onClick={() => setSub({ type: "esquemas", record: s })}
                                        >
                                            <code>{String(s.datos.owner || "—")}</code>
                                            <span className={styles.rowText}>
                                                {s.nombre}
                                                {!!s.datos.descripcion && (
                                                    <small>{String(s.datos.descripcion)}</small>
                                                )}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                                {!schemas.length && (
                                    <li className={styles.none}>Sin esquemas registrados.</li>
                                )}
                            </ul>
                        </section>
                    </div>
                </div>
                <footer className={styles.dossierFoot}>
                    <Button
                        variant="outlined"
                        onClick={() => setSub({ type: "aplicaciones", record: detail })}
                    >
                        Ver ficha completa
                    </Button>
                    {can("aplicaciones", "EDITAR") && (
                        <Button onClick={() => setEditing({ type: "aplicaciones", record: detail })}>
                            Editar sistema
                        </Button>
                    )}
                </footer>
            </PopOver>
            {sub && !editing && (
                <RecordDetail
                    type={sub.type}
                    record={sub.record}
                    onClose={() => setSub(null)}
                    onEdit={(r) => setEditing({ type: sub.type, record: r })}
                    onChanged={onChanged}
                />
            )}
            {(create || editing) && (
                <RecordEditor
                    type={editing?.type || create!}
                    record={editing?.record}
                    initial={create ? { aplicacionId: app.id } : undefined}
                    onClose={() => {
                        setCreate(null);
                        setEditing(null);
                    }}
                    onSaved={() => {
                        setCreate(null);
                        setEditing(null);
                        setSub(null);
                        onChanged();
                    }}
                />
            )}
        </>
    );
}
export default SystemDossier;
