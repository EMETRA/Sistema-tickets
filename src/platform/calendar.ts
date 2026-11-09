import type { PlatformRecord } from "./types";
import { guatemalaDay } from "./dates";

export type CalendarView = "week" | "month" | "agenda";
export type ActivitySegment = {
    record: PlatformRecord;
    start: number;
    end: number;
    multipleDays: boolean;
};
export type PlacedActivity = ActivitySegment & { lane: number; lanes: number };
const DAY = 86400000;
const localMidnight = (day: string) => Date.parse(day + "T00:00:00-06:00");

export function shiftCalendarDay(day: string, amount: number): string {
    return new Date(Date.parse(day + "T12:00:00Z") + amount * DAY)
        .toISOString()
        .slice(0, 10);
}
export function startOfCalendarWeek(day: string): string {
    const weekday = new Date(day + "T12:00:00Z").getUTCDay();
    return shiftCalendarDay(day, -((weekday + 6) % 7));
}
export function weekDays(day: string): string[] {
    const start = startOfCalendarWeek(day);
    return Array.from({ length: 7 }, (_, index) =>
        shiftCalendarDay(start, index),
    );
}
export function calendarPeriod(day: string, view: CalendarView) {
    const first =
        view === "month" ? day.slice(0, 7) + "-01" : startOfCalendarWeek(day);
    const until =
        view === "month"
            ? new Date(
                  Date.UTC(Number(day.slice(0, 4)), Number(day.slice(5, 7)), 1),
              )
                  .toISOString()
                  .slice(0, 10)
            : shiftCalendarDay(first, 7);
    return {
        first,
        until,
        from: new Date(localMidnight(first)).toISOString(),
        to: new Date(localMidnight(until)).toISOString(),
    };
}
export function moveCalendar(
    day: string,
    view: CalendarView,
    amount: number,
): string {
    if (view !== "month") return shiftCalendarDay(day, amount * 7);
    // Navegar meses no salta otro mes cuando el ancla era un día 29, 30 o 31.
    return new Date(
        Date.UTC(
            Number(day.slice(0, 4)),
            Number(day.slice(5, 7)) - 1 + amount,
            1,
        ),
    )
        .toISOString()
        .slice(0, 10);
}
export function monthCells(day: string): (string | null)[] {
    const first = day.slice(0, 7) + "-01";
    const weekday = (new Date(first + "T12:00:00Z").getUTCDay() + 6) % 7;
    const count = new Date(
        Date.UTC(Number(day.slice(0, 4)), Number(day.slice(5, 7)), 0),
    ).getUTCDate();
    return Array.from(
        { length: Math.ceil((weekday + count) / 7) * 7 },
        (_, i) =>
            i < weekday || i >= weekday + count
                ? null
                : shiftCalendarDay(first, i - weekday),
    );
}
export function validActivity(record: PlatformRecord): boolean {
    const start = Date.parse(String(record.datos.inicio));
    const end = Date.parse(String(record.datos.fin));
    return (
        Number.isFinite(start) &&
        Number.isFinite(end) &&
        end > start &&
        record.estado !== "CANCELADO"
    );
}
export function activitiesForDay(
    records: PlatformRecord[],
    day: string,
): ActivitySegment[] {
    const from = localMidnight(day),
        to = from + DAY;
    return records
        .filter(validActivity)
        .flatMap((record) => {
            const start = Date.parse(String(record.datos.inicio)),
                end = Date.parse(String(record.datos.fin));
            if (start >= to || end <= from) return [];
            return [
                {
                    record,
                    start: (Math.max(start, from) - from) / 60000,
                    end: (Math.min(end, to) - from) / 60000,
                    multipleDays:
                        guatemalaDay(new Date(start)) !==
                        guatemalaDay(new Date(end - 1)),
                },
            ];
        })
        .sort(
            (a, b) =>
                a.start - b.start ||
                b.end - a.end ||
                a.record.id.localeCompare(b.record.id),
        );
}
/** Reparte actividades solapadas sin ocultar ninguna detrás de otra. */
export function placeActivities(segments: ActivitySegment[]): PlacedActivity[] {
    const result: PlacedActivity[] = [];
    let group: PlacedActivity[] = [],
        laneEnds: number[] = [],
        until = -1;
    const finish = () => {
        result.push(
            ...group.map((item) => ({ ...item, lanes: laneEnds.length })),
        );
        group = [];
        laneEnds = [];
        until = -1;
    };
    for (const item of [...segments].sort(
        (a, b) => a.start - b.start || b.end - a.end,
    )) {
        if (item.start >= until) finish();
        let lane = laneEnds.findIndex((end) => end <= item.start);
        if (lane === -1) lane = laneEnds.length;
        // También reserva espacio para la altura mínima legible de una tarjeta.
        const collisionEnd = Math.max(item.end, item.start + 30);
        laneEnds[lane] = collisionEnd;
        until = Math.max(until, collisionEnd);
        group.push({ ...item, lane, lanes: 1 });
    }
    finish();
    return result;
}
export function activityHours(segments: ActivitySegment[]) {
    const timed = segments.filter((item) => !item.multipleDays);
    return {
        first: Math.min(9, ...timed.map((item) => Math.floor(item.start / 60))),
        last: Math.max(17, ...timed.map((item) => Math.ceil(item.end / 60))),
    };
}
export function activityScope(
    record: PlatformRecord,
): "EMPRESA" | "PRIVADA" | "EQUIPO" {
    return record.visibilidad === "EMPRESA"
        ? "EMPRESA"
        : record.visibilidad === "PRIVADA"
          ? "PRIVADA"
          : "EQUIPO";
}
export function calendarDate(day: string, options: Intl.DateTimeFormatOptions) {
    return new Intl.DateTimeFormat("es-GT", {
        ...options,
        timeZone: "America/Guatemala",
    }).format(new Date(day + "T12:00:00-06:00"));
}
export function activityTime(value: unknown) {
    return new Intl.DateTimeFormat("es-GT", {
        timeZone: "America/Guatemala",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).format(new Date(String(value)));
}
