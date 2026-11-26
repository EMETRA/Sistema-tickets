"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { platformFetch } from "@/platform/client";
import { usePlatform } from "@/platform/context";
import type { PageResult, PlatformRecord } from "@/platform/types";
import { RecordDetail } from "../ResourceWorkspace/RecordDetail";
import { RecordEditor } from "../ResourceWorkspace/RecordEditor";
import common from "../../templates/PlatformPage/PlatformPage.module.scss";
import styles from "./PeoplePanel.module.scss";

const ROLE: Record<string, string> = {
    JEFATURA: "Jefatura",
    ASIGNADOR: "Asignación",
    TECNICO: "Técnicos",
    DESARROLLADOR: "Desarrollo",
    DEVOPS: "DevOps",
    MIEMBRO: "Miembros",
};
const initials = (name: string) =>
    name
        .split(/\s+/)
        .filter((w) => w.length > 2)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase() || "?";

/** Propuesta: los equipos de trabajo como tarjetas con su gente, sus jefaturas y su umbral de atención. */
export function TeamsBoard({
    revision: outer = 0,
    onShowTable,
}: {
    revision?: number;
    onShowTable: () => void;
}) {
    const { data } = usePlatform();
    const [teams, setTeams] = useState<PlatformRecord[] | null>(null);
    const [members, setMembers] = useState<PlatformRecord[]>([]);
    const [revision, setRevision] = useState(0);
    const [selected, setSelected] = useState<PlatformRecord | null>(null);
    const [editing, setEditing] = useState<PlatformRecord | null | undefined>(undefined);
    const canCreate = !!data?.definitions.equipos?.actions.INSERTAR;
    useEffect(() => {
        const c = new AbortController();
        const list = (type: string) =>
            platformFetch<PageResult<PlatformRecord>>(`/records/${type}?limit=100`, {
                signal: c.signal,
            }).then((r) => r.items);
        Promise.all([list("equipos"), list("miembros").catch(() => [] as PlatformRecord[])])
            .then(([t, m]) => {
                if (c.signal.aborted) return;
                setTeams(t);
                setMembers(m);
            })
            .catch(() => !c.signal.aborted && setTeams([]));
        return () => c.abort();
    }, [revision, outer]);

    if (!teams) return <p className={common.muted}>Consultando equipos…</p>;
    return (
        <section className={styles.teams} aria-label="Equipos de trabajo">
            <div className={styles.bar}>
                <span className={styles.count}>
                    {teams.length} {teams.length === 1 ? "equipo" : "equipos"} · {members.length}{" "}
                    responsabilidades asignadas
                </span>
                <div className={common.actions}>
                    <Button variant="outlined" onClick={onShowTable}>
                        Ver como tabla
                    </Button>
                    {canCreate && <Button onClick={() => setEditing(null)}>Registrar equipo</Button>}
                </div>
            </div>
            <div className={styles.teamGrid}>
                {teams.map((t) => {
                    const people = members.filter((m) => m.equipoId === t.id);
                    const heads = people.filter((m) => m.datos.funcion === "JEFATURA");
                    const roles = Object.entries(
                        people.reduce<Record<string, number>>((acc, m) => {
                            const key = String(m.datos.funcion || "MIEMBRO");
                            acc[key] = (acc[key] || 0) + 1;
                            return acc;
                        }, {}),
                    ).sort(([a], [b]) => Object.keys(ROLE).indexOf(a) - Object.keys(ROLE).indexOf(b));
                    return (
                        <button
                            key={t.id}
                            type="button"
                            className={styles.team}
                            onClick={() => setSelected(t)}
                        >
                            <span className={styles.teamHead}>
                                <strong>{t.nombre}</strong>
                                {t.datos.informatica === true && (
                                    <span className={common.chip} data-tone="info">
                                        Atiende tickets
                                    </span>
                                )}
                            </span>
                            <span className={styles.teamMeta}>
                                {t.datos.unidadRh
                                    ? `Unidad RRHH ${String(t.datos.unidadRh)}`
                                    : "Sin unidad de RRHH vinculada"}
                                {t.datos.minutosAlerta
                                    ? ` · Primera atención en ${String(t.datos.minutosAlerta)} min`
                                    : ""}
                            </span>
                            <span className={styles.stack} aria-label={`${people.length} personas`}>
                                {people.slice(0, 6).map((m) => (
                                    <span
                                        key={m.id}
                                        className={styles.avatar}
                                        data-account
                                        title={m.nombre}
                                        aria-hidden="true"
                                    >
                                        {initials(m.nombre)}
                                    </span>
                                ))}
                                {people.length > 6 && (
                                    <span className={styles.avatar} aria-hidden="true">
                                        +{people.length - 6}
                                    </span>
                                )}
                                <em>
                                    {people.length} {people.length === 1 ? "persona" : "personas"}
                                </em>
                            </span>
                            <span className={styles.roles}>
                                {roles.map(([role, n]) => (
                                    <span key={role}>
                                        {ROLE[role] || role} <b>{n}</b>
                                    </span>
                                ))}
                                {!roles.length && <span>Sin responsabilidades asignadas</span>}
                            </span>
                            <span className={styles.heads}>
                                {heads.length
                                    ? `Jefatura: ${heads.map((h) => h.nombre).join(", ")}`
                                    : "Sin jefatura asignada"}
                            </span>
                        </button>
                    );
                })}
                {!teams.length && <p className={styles.empty}>Todavía no hay equipos registrados.</p>}
            </div>
            {editing !== undefined && (
                <RecordEditor
                    type="equipos"
                    record={editing || undefined}
                    onClose={() => setEditing(undefined)}
                    onSaved={() => {
                        setEditing(undefined);
                        setSelected(null);
                        setRevision((r) => r + 1);
                    }}
                />
            )}
            {selected && editing === undefined && (
                <RecordDetail
                    type="equipos"
                    record={selected}
                    onClose={() => setSelected(null)}
                    onEdit={(r) => setEditing(r)}
                    onChanged={() => setRevision((r) => r + 1)}
                />
            )}
        </section>
    );
}
export default TeamsBoard;
