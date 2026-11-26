"use client";
import { useMemo, useState } from "react";
import { usePlatformQueries } from "@/platform/query";
import { Button } from "@/components/client/atoms/Button";
import { usePlatform } from "@/platform/context";
import type { PageResult, PlatformRecord } from "@/platform/types";
import { displayDate } from "@/helpers/displayDate";
import { RecordDetail } from "@/features/registros/components/ResourceWorkspace/RecordDetail";
import { RecordEditor } from "@/features/registros/components/ResourceWorkspace/RecordEditor";
import { daysFromToday, latestByAsset, relativeDays } from "./assetDates";
import common from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
import styles from "./AssetsPanel.module.scss";

const TYPE: Record<string, [string, string]> = {
    PREVENTIVO: ["Preventivo", "info"],
    CORRECTIVO: ["Correctivo", "warning"],
    VISITA_TECNICA: ["Visita técnica", "neutral"],
};

/** Propuesta: mantenimientos como tablero de lo que vence, lo que viene y lo hecho. */
export function MaintenanceBoard({
    onShowTable,
    onChanged,
}: {
    onShowTable: () => void;
    onChanged?: () => void;
}) {
    const { data } = usePlatform();
    // Las listas no traen nombres de referencias; se resuelven con fichas y ubicaciones.
    const [selected, setSelected] = useState<PlatformRecord | null>(null);
    const [editing, setEditing] = useState<PlatformRecord | null | undefined>(undefined);
    const canCreate = !!data?.definitions.intervenciones?.actions.INSERTAR;

    const lists = usePlatformQueries<PageResult<PlatformRecord>>([
        "/records/intervenciones?limit=100",
        "/records/activos?limit=100",
        "/records/instalaciones?limit=100",
    ]);
    const [work, activos, sitios] = lists.data;
    const rows = work?.items ?? null;
    const names = useMemo(
        () =>
            Object.fromEntries(
                [...(activos?.items ?? []), ...(sitios?.items ?? [])].map((x) => [x.id, x.nombre]),
            ) as Record<string, string>,
        [activos, sitios],
    );
    // Sin la lista de mantenimientos no hay tablero; las demás solo aportan nombres.
    const error =
        !lists.pending && !work
            ? lists.error instanceof Error
                ? lists.error.message
                : "No se pudieron cargar los mantenimientos."
            : "";

    const latest = latestByAsset(rows || []).map((r) => ({ r, due: daysFromToday(r.datos.proximaRevision) }));
    const overdue = latest.filter((x) => x.due !== null && x.due < 0).sort((a, b) => a.due! - b.due!);
    const upcoming = latest
        .filter((x) => x.due !== null && x.due >= 0 && x.due <= 30)
        .sort((a, b) => a.due! - b.due!);
    const recent = [...(rows || [])]
        .sort((a, b) => String(b.datos.fecha).localeCompare(String(a.datos.fecha)))
        .slice(0, 6);

    const card = (r: PlatformRecord, note: string, tone?: string) => {
        const [label, typeTone] = TYPE[String(r.datos.tipo)] || [
            String(r.datos.tipo || "Registro"),
            "neutral",
        ];
        return (
            <li key={r.id}>
                <button
                    type="button"
                    className={styles.workCard}
                    data-tone={tone}
                    onClick={() => setSelected(r)}
                >
                    <span className={styles.workTop}>
                        <span className={common.chip} data-tone={typeTone}>
                            {label}
                        </span>
                        <span className={styles.when} data-tone={tone}>
                            {note}
                        </span>
                    </span>
                    <strong>{r.nombre}</strong>
                    <small>
                        {names[String(r.datos.activoId)] || r.labels?.activoId || "Bien sin ficha vinculada"}
                    </small>
                    {(names[String(r.datos.instalacionId)] || r.labels?.instalacionId) && (
                        <small className={styles.who}>
                            {names[String(r.datos.instalacionId)] || r.labels?.instalacionId}
                        </small>
                    )}
                </button>
            </li>
        );
    };

    return (
        <section className={styles.board} aria-label="Mantenimientos y visitas">
            <div className={styles.boardHead}>
                <p className={common.muted}>
                    La próxima revisión de cada bien se toma de su último mantenimiento registrado.
                </p>
                <div className={common.actions}>
                    <Button variant="outlined" onClick={onShowTable}>
                        Ver todos como tabla
                    </Button>
                    {canCreate && <Button onClick={() => setEditing(null)}>Registrar mantenimiento</Button>}
                </div>
            </div>
            {error && (
                <p role="alert" className={common.error}>
                    {error}
                </p>
            )}
            {rows === null && !error && <p className={common.muted}>Consultando mantenimientos…</p>}
            {rows && (
                <div className={styles.lanes}>
                    <div className={styles.lane} data-tone="danger">
                        <h3>
                            Revisión vencida <span>{overdue.length}</span>
                        </h3>
                        <ul>
                            {overdue.map(({ r, due }) =>
                                card(r, `Venció ${relativeDays(due).toLowerCase()}`, "danger"),
                            )}
                            {!overdue.length && (
                                <li className={styles.laneEmpty}>Ningún bien con revisión vencida.</li>
                            )}
                        </ul>
                    </div>
                    <div className={styles.lane} data-tone="warning">
                        <h3>
                            Próximos 30 días <span>{upcoming.length}</span>
                        </h3>
                        <ul>
                            {upcoming.map(({ r, due }) => card(r, relativeDays(due), "warning"))}
                            {!upcoming.length && (
                                <li className={styles.laneEmpty}>Sin revisiones en los próximos 30 días.</li>
                            )}
                        </ul>
                    </div>
                    <div className={styles.lane} data-tone="neutral">
                        <h3>
                            Trabajo reciente <span>{recent.length}</span>
                        </h3>
                        <ul>
                            {recent.map((r) => card(r, displayDate(String(r.datos.fecha)).split(",")[0]))}
                            {!recent.length && (
                                <li className={styles.laneEmpty}>
                                    Todavía no hay mantenimientos registrados.
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            )}
            {editing !== undefined && (
                <RecordEditor
                    type="intervenciones"
                    record={editing || undefined}
                    onClose={() => setEditing(undefined)}
                    onSaved={() => {
                        setEditing(undefined);
                        setSelected(null);
                        void lists.refetch();
                        onChanged?.();
                    }}
                />
            )}
            {selected && editing === undefined && (
                <RecordDetail
                    type="intervenciones"
                    record={selected}
                    onClose={() => setSelected(null)}
                    onEdit={(r) => setEditing(r)}
                    onChanged={() => {
                        void lists.refetch();
                        onChanged?.();
                    }}
                />
            )}
        </section>
    );
}
export default MaintenanceBoard;
