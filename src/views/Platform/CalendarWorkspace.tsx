"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { WeeklyCalendar } from "@/components/client/organisms/WeeklyCalendar/WeeklyCalendar";
import { usePlatform } from "@/platform/context";
import { platformFetch } from "@/platform/client";
import type { PageResult, PlatformRecord } from "@/platform/types";
import { guatemalaDay } from "@/platform/dates";
import {
    activitiesForDay,
    activityScope,
    activityTime,
    calendarDate,
    calendarPeriod,
    monthCells,
    moveCalendar,
    shiftCalendarDay,
    validActivity,
    weekDays,
    type CalendarView,
} from "@/platform/calendar";
import { RecordEditor } from "@/components/client/organisms/ResourceWorkspace/RecordEditor";
import {
    RecordDetail,
    displayDate,
} from "@/components/client/organisms/ResourceWorkspace/RecordDetail";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
import calendar from "./CalendarWorkspace.module.scss";

type Scope = "EQUIPO" | "EMPRESA" | "PRIVADA";
const scopeNames = {
    EQUIPO: "De tu equipo",
    EMPRESA: "General de la empresa",
    PRIVADA: "Privada",
};
export function CalendarWorkspace() {
    const { data } = usePlatform();
    const def = data!.definitions.actividades;
    const today = guatemalaDay();
    const [anchor, setAnchor] = useState(today);
    const [view, setView] = useState<CalendarView>("week");
    const [weekends, setWeekends] = useState(
        new Date(today + "T12:00:00Z").getUTCDay() % 6 === 0,
    );
    const [scopes, setScopes] = useState<Scope[]>([
        "EQUIPO",
        "EMPRESA",
        "PRIVADA",
    ]);
    const [records, setRecords] = useState<PlatformRecord[]>([]),
        [total, setTotal] = useState<number | null>(null);
    const [error, setError] = useState(""),
        [loading, setLoading] = useState(true),
        [revision, setRevision] = useState(0);
    const [selected, setSelected] = useState<PlatformRecord | null>(null),
        [edit, setEdit] = useState<PlatformRecord | null | undefined>();
    const [initial, setInitial] = useState<Record<string, unknown>>({});
    const generation = useRef(0),
        controller = useRef<AbortController | null>(null);
    const period = calendarPeriod(anchor, view);
    const { from, to } = period;
    const load = useCallback(
        async (offset: number, signal: AbortSignal, version: number) => {
            setLoading(true);
            setError("");
            if (!offset) {
                setRecords([]);
                setTotal(null);
            }
            try {
                const result = await platformFetch<PageResult<PlatformRecord>>(
                    "/records/actividades?limit=100&offset=" +
                        offset +
                        "&desde=" +
                        encodeURIComponent(from) +
                        "&hasta=" +
                        encodeURIComponent(to),
                    { signal },
                );
                if (signal.aborted || generation.current !== version) return;
                setRecords((old) =>
                    offset ? [...old, ...result.items] : result.items,
                );
                setTotal(result.total);
            } catch (e) {
                if (!signal.aborted && generation.current === version)
                    setError(
                        e instanceof Error
                            ? e.message
                            : "No se pudo cargar el calendario.",
                    );
            } finally {
                if (!signal.aborted && generation.current === version)
                    setLoading(false);
            }
        },
        [from, to],
    );
    useEffect(() => {
        const c = new AbortController(),
            version = ++generation.current;
        controller.current = c;
        void load(0, c.signal, version);
        return () => c.abort();
    }, [load, revision]);
    function create(date = anchor, hour = 9) {
        const start = Date.parse(
            date + `T${String(hour).padStart(2, "0")}:00:00-06:00`,
        );
        setInitial({
            inicio: new Date(start).toISOString(),
            fin: new Date(start + 3600000).toISOString(),
        });
        setEdit(null);
    }
    const days = weekDays(anchor).slice(
        0,
        weekends || view === "agenda" ? 7 : 5,
    );
    const visible = records.filter(
        (row) => validActivity(row) && scopes.includes(activityScope(row)),
    );
    const weekendCount = visible.filter((row) =>
        weekDays(anchor)
            .slice(5)
            .some((date) => activitiesForDay([row], date).length),
    ).length;
    const endLabel =
        view === "month"
            ? shiftCalendarDay(period.until, -1)
            : days[days.length - 1];
    const rangeLabel =
        view === "month"
            ? calendarDate(anchor, { month: "long", year: "numeric" })
            : new Intl.DateTimeFormat("es-GT", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  timeZone: "America/Guatemala",
              }).formatRange(
                  new Date(period.first + "T12:00:00-06:00"),
                  new Date(endLabel + "T12:00:00-06:00"),
              );
    const sorted = [...visible].sort(
        (a, b) =>
            Date.parse(String(a.datos.inicio)) -
            Date.parse(String(b.datos.inicio)),
    );
    const canCreate = !!def?.actions.INSERTAR;
    return (
        <section className={calendar.page}>
            <div className={calendar.intro}>
                <p>
                    Mi equipo y actividades generales{" "}
                    <span>· Hora de Guatemala</span>
                </p>
                <div className={styles.actions}>
                    <Button
                        variant="outlined"
                        className={calendar.compact}
                        onClick={() => setRevision((n) => n + 1)}
                    >
                        Actualizar
                    </Button>
                    {canCreate && (
                        <Button
                            className={calendar.compact}
                            onClick={() => create()}
                        >
                            <span aria-hidden="true">＋ </span>Crear actividad
                        </Button>
                    )}
                </div>
            </div>
            <div className={calendar.toolbar}>
                <div
                    className={calendar.filters}
                    role="group"
                    aria-label="Filtrar actividades por visibilidad"
                >
                    {(["EQUIPO", "EMPRESA", "PRIVADA"] as Scope[]).map(
                        (scope) => (
                            <button
                                key={scope}
                                data-scope={scope}
                                aria-pressed={scopes.includes(scope)}
                                onClick={() =>
                                    setScopes((old) =>
                                        old.includes(scope)
                                            ? old.filter((s) => s !== scope)
                                            : [...old, scope],
                                    )
                                }
                            >
                                <span aria-hidden="true" />
                                {scope === "EQUIPO"
                                    ? data!.actor.admin
                                        ? "Equipos"
                                        : data!.memberships.length > 1
                                          ? "Mis equipos"
                                          : "Mi equipo"
                                    : scope === "EMPRESA"
                                      ? "General de la empresa"
                                      : "Privadas"}
                            </button>
                        ),
                    )}
                </div>
                <div className={calendar.navigation}>
                    <Button
                        variant="outlined"
                        className={calendar.compact}
                        onClick={() => {
                            setAnchor(today);
                            if (
                                new Date(today + "T12:00:00Z").getUTCDay() %
                                    6 ===
                                0
                            )
                                setWeekends(true);
                        }}
                    >
                        Hoy
                    </Button>
                    <div
                        className={calendar.views}
                        role="group"
                        aria-label="Vista del calendario"
                    >
                        {(
                            [
                                ["week", "Semana"],
                                ["month", "Mes"],
                                ["agenda", "Agenda"],
                            ] as const
                        ).map(([value, label]) => (
                            <button
                                key={value}
                                aria-pressed={view === value}
                                onClick={() => setView(value)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <section
                className={calendar.panel}
                aria-label="Actividades del calendario"
                aria-busy={loading}
            >
                <div className={calendar.period}>
                    <div className={calendar.range}>
                        <button
                            className={calendar.arrow}
                            onClick={() =>
                                setAnchor(moveCalendar(anchor, view, -1))
                            }
                            aria-label={
                                view === "month"
                                    ? "Mes anterior"
                                    : "Semana anterior"
                            }
                        >
                            ‹
                        </button>
                        <h2>{rangeLabel}</h2>
                        <button
                            className={calendar.arrow}
                            onClick={() =>
                                setAnchor(moveCalendar(anchor, view, 1))
                            }
                            aria-label={
                                view === "month"
                                    ? "Mes siguiente"
                                    : "Semana siguiente"
                            }
                        >
                            ›
                        </button>
                    </div>
                    <div className={calendar.dateTools}>
                        {view === "week" && (
                            <label className={calendar.weekends}>
                                <input
                                    type="checkbox"
                                    checked={weekends}
                                    onChange={(e) =>
                                        setWeekends(e.target.checked)
                                    }
                                />
                                Fin de semana
                            </label>
                        )}
                        <label className={calendar.date}>
                            <span>Ir a fecha</span>
                            <input
                                type="date"
                                value={anchor}
                                onChange={(e) => {
                                    if (e.target.value) {
                                        setAnchor(e.target.value);
                                        if (
                                            new Date(
                                                e.target.value + "T12:00:00Z",
                                            ).getUTCDay() %
                                                6 ===
                                            0
                                        )
                                            setWeekends(true);
                                    }
                                }}
                            />
                        </label>
                    </div>
                </div>
                {error && (
                    <p role="alert" className={styles.error}>
                        {error}{" "}
                        <button
                            className={styles.link}
                            onClick={() => setRevision((n) => n + 1)}
                        >
                            Reintentar calendario
                        </button>
                    </p>
                )}
                {loading && (
                    <p role="status" className={calendar.status}>
                        Consultando actividades…
                    </p>
                )}
                {view === "week" && (
                    <WeeklyCalendar
                        days={days}
                        today={today}
                        records={visible}
                        onSelect={setSelected}
                        onCreate={canCreate ? create : undefined}
                        companyReadOnly={!data!.actor.admin}
                    />
                )}
                {view === "month" && (
                    <div
                        className={calendar.monthScroll}
                        role="region"
                        aria-label="Calendario mensual"
                        tabIndex={0}
                    >
                        <div className={calendar.month}>
                            {[
                                "Lun",
                                "Mar",
                                "Mié",
                                "Jue",
                                "Vie",
                                "Sáb",
                                "Dom",
                            ].map((label) => (
                                <strong
                                    className={calendar.monthHeading}
                                    key={label}
                                >
                                    {label}
                                </strong>
                            ))}
                            {monthCells(anchor).map((date, index) => (
                                <div
                                    key={date || "empty" + index}
                                    className={calendar.monthDay}
                                    aria-current={
                                        date === today ? "date" : undefined
                                    }
                                >
                                    {date && (
                                        <>
                                            <div className={calendar.dayNumber}>
                                                <strong>
                                                    {Number(date.slice(-2))}
                                                </strong>
                                                {canCreate && (
                                                    <button
                                                        onClick={() =>
                                                            create(date)
                                                        }
                                                        aria-label={
                                                            "Crear actividad el " +
                                                            date
                                                        }
                                                    >
                                                        ＋
                                                    </button>
                                                )}
                                            </div>
                                            {activitiesForDay(
                                                visible,
                                                date,
                                            ).map(({ record }) => (
                                                <button
                                                    className={
                                                        calendar.activity
                                                    }
                                                    data-scope={activityScope(
                                                        record,
                                                    )}
                                                    key={record.id}
                                                    onClick={() =>
                                                        setSelected(record)
                                                    }
                                                >
                                                    <strong>
                                                        {record.nombre}
                                                    </strong>
                                                    <span>
                                                        {activityTime(
                                                            record.datos.inicio,
                                                        )}
                                                    </span>
                                                </button>
                                            ))}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {view === "agenda" && (
                    <ul
                        className={calendar.agenda}
                        aria-label="Agenda de actividades"
                    >
                        {sorted.map((record) => (
                            <li key={record.id}>
                                <button
                                    className={calendar.activity}
                                    data-scope={activityScope(record)}
                                    onClick={() => setSelected(record)}
                                >
                                    <div>
                                        <strong>{record.nombre}</strong>
                                        <span>
                                            {displayDate(record.datos.inicio)} –{" "}
                                            {displayDate(record.datos.fin)}
                                        </span>
                                    </div>
                                    <span>
                                        {scopeNames[activityScope(record)]}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                {!loading && !error && !visible.length && (
                    <p className={calendar.empty}>
                        {total === 0
                            ? view === "month"
                                ? "No hay actividades registradas para este mes."
                                : "No hay actividades registradas para esta semana."
                            : records.length < (total ?? 0)
                              ? "No hay actividades de este alcance entre las que ya se cargaron."
                              : "No hay actividades con los filtros seleccionados."}
                    </p>
                )}
                {view === "week" && !weekends && weekendCount > 0 && (
                    <p className={calendar.status}>
                        Hay {weekendCount}{" "}
                        {weekendCount === 1 ? "actividad" : "actividades"} el
                        fin de semana.{" "}
                        <button
                            className={styles.link}
                            onClick={() => setWeekends(true)}
                        >
                            Mostrar sábado y domingo
                        </button>
                    </p>
                )}
                <footer className={calendar.footer}>
                    <div className={calendar.legend}>
                        <span>Equipo: visibilidad restringida</span>
                        <span>
                            General:{" "}
                            {data!.actor.admin ? "administración" : "consulta"}
                        </span>
                        <span>Privada: solo dentro de tu alcance</span>
                    </div>
                    <span>
                        {total === null
                            ? loading
                                ? "Consultando el periodo…"
                                : "Total de actividades no disponible"
                            : `${records.length} de ${total} actividades cargadas`}
                    </span>
                    {total !== null && records.length < total && (
                        <Button
                            variant="outlined"
                            className={calendar.compact}
                            state={loading ? "loading" : "default"}
                            onClick={() => {
                                if (controller.current && !loading)
                                    void load(
                                        records.length,
                                        controller.current.signal,
                                        generation.current,
                                    );
                            }}
                        >
                            Cargar más actividades
                        </Button>
                    )}
                </footer>
            </section>
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
