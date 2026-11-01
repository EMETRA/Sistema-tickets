"use client";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { usePlatform } from "@/platform/context";
import { platformFetch } from "@/platform/client";
import type { PageResult, PlatformRecord } from "@/platform/types";
import { RecordEditor } from "@/components/client/organisms/ResourceWorkspace/RecordEditor";
import {
    RecordDetail,
    displayDate,
} from "@/components/client/organisms/ResourceWorkspace/RecordDetail";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
function day(value: unknown) {
    return new Intl.DateTimeFormat("fr-CA", {
        timeZone: "America/Guatemala",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date(String(value)));
}
export function CalendarWorkspace() {
    const { data } = usePlatform(),
        def = data!.definitions.actividades,
        now = day(new Date().toISOString()),
        [month, setMonth] = useState(now.slice(0, 7)),
        [records, setRecords] = useState<PlatformRecord[]>([]),
        [total, setTotal] = useState(0),
        [error, setError] = useState(""),
        [loading, setLoading] = useState(false),
        [revision, setRevision] = useState(0),
        [selected, setSelected] = useState<PlatformRecord | null>(null),
        [edit, setEdit] = useState<PlatformRecord | null | undefined>(),
        [initial, setInitial] = useState<Record<string, unknown>>({}),
        [list, setList] = useState(false);
    const [year, m] = month.split("-").map(Number),
        count = new Date(Date.UTC(year, m, 0)).getUTCDate(),
        start = (new Date(Date.UTC(year, m - 1, 1)).getUTCDay() + 6) % 7;
    const load = useCallback(
        async (offset = 0) => {
            setLoading(true);
            setError("");
            try {
                const from = new Date(
                        month + "-01T00:00:00-06:00",
                    ).toISOString(),
                    next = new Date(Date.UTC(year, m, 1, 6)).toISOString(),
                    result = await platformFetch<PageResult<PlatformRecord>>(
                        "/records/actividades?limit=100&offset=" +
                            offset +
                            "&desde=" +
                            encodeURIComponent(from) +
                            "&hasta=" +
                            encodeURIComponent(next),
                    );
                setRecords((previous) =>
                    offset ? [...previous, ...result.items] : result.items,
                );
                setTotal(result.total);
            } catch (e) {
                setError(
                    e instanceof Error
                        ? e.message
                        : "No se pudo cargar el calendario.",
                );
            } finally {
                setLoading(false);
            }
        },
        [month, year, m],
    );
    useEffect(() => {
        void load();
    }, [load, revision]);
    const move = (n: number) =>
        setMonth(
            new Date(Date.UTC(year, m - 1 + n, 1)).toISOString().slice(0, 7),
        );
    function create(date = now) {
        setInitial({
            inicio: new Date(date + "T09:00:00-06:00").toISOString(),
            fin: new Date(date + "T10:00:00-06:00").toISOString(),
        });
        setEdit(null);
    }
    return (
        <section className={styles.page}>
            <div className={styles.toolbar}>
                <div>
                    <h2>Calendario de actividades</h2>
                    <p className={styles.muted}>
                        Actividades generales y de tus equipos · Hora de
                        Guatemala.
                    </p>
                </div>
                <div className={styles.actions}>
                    <Button
                        variant="outlined"
                        onClick={() => setRevision((n) => n + 1)}
                    >
                        Actualizar
                    </Button>
                    {def?.actions.INSERTAR && (
                        <Button onClick={() => create()}>
                            Crear actividad
                        </Button>
                    )}
                </div>
            </div>
            <div className={styles.toolbar}>
                <div className={styles.actions}>
                    <Button
                        variant="outlined"
                        onClick={() => move(-1)}
                        aria-label="Mes anterior"
                    >
                        Anterior
                    </Button>
                    <label className={styles.field}>
                        Mes
                        <input
                            className={styles.control}
                            type="month"
                            value={month}
                            onChange={(e) => {
                                if (e.target.value) setMonth(e.target.value);
                            }}
                        />
                    </label>
                    <Button
                        variant="outlined"
                        onClick={() => move(1)}
                        aria-label="Mes siguiente"
                    >
                        Siguiente
                    </Button>
                </div>
                <Button variant="outlined" onClick={() => setList((v) => !v)}>
                    {list ? "Ver mes" : "Ver lista"}
                </Button>
            </div>
            {error && (
                <p role="alert" className={styles.error}>
                    {error}{" "}
                    <button className={styles.link} onClick={() => void load()}>
                        Reintentar
                    </button>
                </p>
            )}
            {loading && (
                <p role="status" className={styles.muted}>
                    Cargando actividades…
                </p>
            )}
            {list ? (
                <ul className={styles.timeline}>
                    {[...records]
                        .sort((a, b) =>
                            String(a.datos.inicio).localeCompare(
                                String(b.datos.inicio),
                            ),
                        )
                        .map((row) => (
                            <li key={row.id}>
                                <button
                                    className={styles.link}
                                    onClick={() => setSelected(row)}
                                >
                                    {row.nombre}
                                </button>
                                <p className={styles.muted}>
                                    {displayDate(row.datos.inicio)} ·{" "}
                                    {row.visibilidad === "EMPRESA"
                                        ? "General de la empresa"
                                        : row.visibilidad === "PRIVADA"
                                          ? "Privada"
                                          : data!.teams.find(
                                                (t) => t.id === row.equipoId,
                                            )?.nombre}
                                </p>
                            </li>
                        ))}
                </ul>
            ) : (
                <div
                    className={styles.calendar}
                    aria-label="Actividades del mes"
                >
                    {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(
                        (d) => (
                            <div
                                className={styles.day}
                                key={d}
                                style={{ minHeight: 30 }}
                            >
                                <strong>{d}</strong>
                            </div>
                        ),
                    )}
                    {Array.from({ length: start }, (_, i) => (
                        <div
                            className={styles.day}
                            key={"empty" + i}
                            aria-hidden="true"
                        />
                    ))}
                    {Array.from({ length: count }, (_, i) => {
                        const date =
                                month + "-" + String(i + 1).padStart(2, "0"),
                            items = records.filter(
                                (r) =>
                                    day(r.datos.inicio) <= date &&
                                    day(r.datos.fin) >= date &&
                                    r.estado !== "CANCELADO",
                            );
                        return (
                            <div key={date} className={styles.day}>
                                <strong>{i + 1}</strong>
                                {def?.actions.INSERTAR && (
                                    <button
                                        aria-label={
                                            "Crear actividad el " + date
                                        }
                                        onClick={() => create(date)}
                                    >
                                        + Actividad
                                    </button>
                                )}
                                {items.map((row) => (
                                    <button
                                        key={row.id}
                                        onClick={() => setSelected(row)}
                                    >
                                        {row.nombre}
                                        {row.visibilidad === "EMPRESA"
                                            ? " · General"
                                            : ""}
                                    </button>
                                ))}
                            </div>
                        );
                    })}
                </div>
            )}
            <div className={styles.toolbar}>
                <p className={styles.muted}>
                    {records.length} de {total} actividades cargadas
                </p>
                {records.length < total && (
                    <Button
                        variant="outlined"
                        state={loading ? "loading" : "default"}
                        onClick={() => void load(records.length)}
                    >
                        Cargar más actividades
                    </Button>
                )}
            </div>
            {!loading && !error && !total && (
                <p className={styles.muted}>
                    No hay actividades registradas para este mes.
                </p>
            )}
            {edit !== undefined && (
                <RecordEditor
                    type="actividades"
                    record={edit || undefined}
                    initial={initial}
                    onClose={() => setEdit(undefined)}
                    onSaved={() => {
                        setEdit(undefined);
                        setSelected(null);
                        setRevision((n) => n + 1);
                    }}
                />
            )}
            {selected && edit === undefined && (
                <RecordDetail
                    type="actividades"
                    record={selected}
                    onClose={() => setSelected(null)}
                    onEdit={() => setEdit(selected)}
                    onChanged={() => setRevision((n) => n + 1)}
                />
            )}
        </section>
    );
}
