import type { CSSProperties } from "react";
import type { PlatformRecord } from "@/platform/types";
import {
    activitiesForDay,
    activityHours,
    activityScope,
    activityTime,
    calendarDate,
    placeActivities,
} from "@/platform/calendar";
import styles from "./WeeklyCalendar.module.scss";

const HOUR_HEIGHT = 56;
export function WeeklyCalendar({
    days,
    today,
    records,
    onSelect,
    onCreate,
    companyReadOnly = true,
}: {
    days: string[];
    today: string;
    records: PlatformRecord[];
    onSelect: (record: PlatformRecord) => void;
    onCreate?: (date: string, hour: number) => void;
    companyReadOnly?: boolean;
}) {
    const columns = days.map((date) => ({
        date,
        items: activitiesForDay(records, date),
    }));
    const { first, last } = activityHours(
        columns.flatMap((column) => column.items),
    );
    const hours = Array.from(
        { length: last - first },
        (_, index) => first + index,
    );
    const height = hours.length * HOUR_HEIGHT;
    const severalDays = columns.some((column) =>
        column.items.some((item) => item.multipleDays),
    );
    return (
        <div
            className={styles.scroll}
            role="region"
            aria-label="Calendario semanal"
            tabIndex={0}
        >
            <div
                className={styles.grid}
                style={{ "--calendar-days": days.length } as CSSProperties}
            >
                <div className={styles.corner}>Hora</div>
                {columns.map(({ date }) => (
                    <div
                        className={styles.heading}
                        key={date}
                        aria-current={date === today ? "date" : undefined}
                    >
                        <span>{calendarDate(date, { weekday: "short" })}</span>
                        <strong>{Number(date.slice(-2))}</strong>
                    </div>
                ))}
                {severalDays && (
                    <>
                        <div className={styles.severalLabel}>Varios días</div>
                        {columns.map(({ date, items }) => (
                            <div className={styles.several} key={date}>
                                {items
                                    .filter((item) => item.multipleDays)
                                    .map(({ record }) => (
                                        <button
                                            key={record.id}
                                            className={styles.event}
                                            data-scope={activityScope(record)}
                                            onClick={() => onSelect(record)}
                                        >
                                            <strong>{record.nombre}</strong>
                                            <small>
                                                Actividad de varios días
                                            </small>
                                        </button>
                                    ))}
                            </div>
                        ))}
                    </>
                )}
                <div className={styles.hours} style={{ height }}>
                    {hours.map((hour) => (
                        <div key={hour} style={{ height: HOUR_HEIGHT }}>
                            <span>{String(hour).padStart(2, "0")}:00</span>
                        </div>
                    ))}
                </div>
                {columns.map(({ date, items }) => (
                    <div
                        key={date}
                        className={styles.day}
                        style={{ height }}
                        aria-label={calendarDate(date, {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                        })}
                    >
                        {onCreate &&
                            hours.map((hour) => (
                                <button
                                    key={hour}
                                    className={styles.slot}
                                    style={{
                                        top: (hour - first) * HOUR_HEIGHT,
                                        height: HOUR_HEIGHT,
                                    }}
                                    aria-label={`Crear actividad el ${date} a las ${String(hour).padStart(2, "0")}:00`}
                                    onClick={() => onCreate(date, hour)}
                                >
                                    <span>+ Actividad</span>
                                </button>
                            ))}
                        {placeActivities(
                            items.filter((item) => !item.multipleDays),
                        ).map(({ record, start, end, lane, lanes }) => (
                            <button
                                key={record.id}
                                className={styles.event}
                                data-scope={activityScope(record)}
                                data-duration={
                                    end - start < 40
                                        ? "brief"
                                        : end - start < 90
                                            ? "short"
                                            : "long"
                                }
                                style={{
                                    top: Math.min(
                                        (start / 60 - first) * HOUR_HEIGHT,
                                        height - 28,
                                    ),
                                    height: Math.max(
                                        28,
                                        ((end - start) / 60) * HOUR_HEIGHT - 3,
                                    ),
                                    left: `calc(${(lane / lanes) * 100}% + 4px)`,
                                    width: `calc(${100 / lanes}% - 8px)`,
                                }}
                                aria-label={`${record.nombre} · ${activityTime(record.datos.inicio)}–${activityTime(record.datos.fin)} · ${activityScope(record)}`}
                                title={`${record.nombre} · ${activityTime(record.datos.inicio)}–${activityTime(record.datos.fin)} · ${activityScope(record)}`}
                                onClick={() => onSelect(record)}
                            >
                                <strong>{record.nombre}</strong>
                                <small>
                                    {activityTime(record.datos.inicio)}–
                                    {activityTime(record.datos.fin)}
                                </small>
                                <small>
                                    {record.visibilidad === "EMPRESA"
                                        ? companyReadOnly
                                            ? "General · Solo lectura"
                                            : "General de la empresa"
                                        : record.visibilidad === "PRIVADA"
                                            ? "Privada"
                                            : "De tu equipo"}
                                </small>
                            </button>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
