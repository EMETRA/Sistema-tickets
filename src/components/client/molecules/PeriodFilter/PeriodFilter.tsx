"use client";
import { useEffect, useState } from "react";
import { guatemalaDay } from "@/platform/dates";
import styles from "./PeriodFilter.module.scss";

type Preset = { id: string; label: string; range: () => [string, string] };

const daysAgo = (days: number) =>
    guatemalaDay(new Date(Date.now() - days * 86400000));

export const PERIOD_PRESETS: Preset[] = [
    { id: "7", label: "7 días", range: () => [daysAgo(7), guatemalaDay()] },
    { id: "30", label: "30 días", range: () => [daysAgo(30), guatemalaDay()] },
    { id: "90", label: "90 días", range: () => [daysAgo(90), guatemalaDay()] },
    {
        id: "anio",
        label: "Este año",
        range: () => {
            const today = guatemalaDay();
            return [today.slice(0, 4) + "-01-01", today];
        },
    },
];

const VALID = /^\d{4}-\d{2}-\d{2}$/;

/** Formato legible del periodo aplicado: "26 oct – 25 nov 2026". */
export function formatPeriod(from: string, to: string) {
    const date = (v: string) => new Date(v + "T12:00:00Z");
    const sameYear = from.slice(0, 4) === to.slice(0, 4);
    const fmt = (v: string, withYear: boolean) =>
        new Intl.DateTimeFormat("es-GT", {
            timeZone: "UTC",
            day: "numeric",
            month: "short",
            ...(withYear ? { year: "numeric" } : {}),
        })
            .format(date(v))
            .replace(".", "");
    return `${fmt(from, !sameYear)} – ${fmt(to, true)}`;
}

/**
 * Periodo con atajos (7/30/90 días, este año) y rango personalizado.
 * Los atajos se aplican al instante; el rango personalizado, cuando ambas
 * fechas son válidas.
 */
export function PeriodFilter({
    from,
    to,
    onChange,
    disabled,
}: {
    from: string;
    to: string;
    onChange: (from: string, to: string) => void;
    disabled?: boolean;
}) {
    const matching = PERIOD_PRESETS.find((p) => {
        const [a, b] = p.range();
        return a === from && b === to;
    });
    const [custom, setCustom] = useState(!matching);
    const [draft, setDraft] = useState({ from, to });

    // Aplica el rango personalizado al terminar de editar (sin un botón extra).
    useEffect(() => {
        if (!custom) return;
        if (draft.from === from && draft.to === to) return;
        if (!VALID.test(draft.from) || !VALID.test(draft.to)) return;
        if (draft.to < draft.from) return;
        const timer = setTimeout(() => onChange(draft.from, draft.to), 450);
        return () => clearTimeout(timer);
    }, [custom, draft, from, to, onChange]);

    const invalid = custom && draft.from && draft.to && draft.to < draft.from;
    return (
        <div className={styles.period}>
            <span className={styles.label} id="periodo-label">
                Periodo
            </span>
            <div
                className={styles.segmented}
                role="group"
                aria-labelledby="periodo-label"
            >
                {PERIOD_PRESETS.map((preset) => (
                    <button
                        key={preset.id}
                        type="button"
                        disabled={disabled}
                        aria-pressed={!custom && matching?.id === preset.id}
                        onClick={() => {
                            const [a, b] = preset.range();
                            setCustom(false);
                            setDraft({ from: a, to: b });
                            onChange(a, b);
                        }}
                    >
                        {preset.label}
                    </button>
                ))}
                <button
                    type="button"
                    disabled={disabled}
                    aria-pressed={custom}
                    onClick={() => {
                        setDraft({ from, to });
                        setCustom(true);
                    }}
                >
                    Personalizado
                </button>
            </div>
            {custom && (
                <div className={styles.range}>
                    <label>
                        <span>Desde</span>
                        <input
                            type="date"
                            value={draft.from}
                            max={draft.to || undefined}
                            disabled={disabled}
                            onChange={(e) =>
                                setDraft((d) => ({ ...d, from: e.target.value }))
                            }
                        />
                    </label>
                    <span aria-hidden="true" className={styles.dash}>
                        –
                    </span>
                    <label>
                        <span>Hasta</span>
                        <input
                            type="date"
                            value={draft.to}
                            min={draft.from || undefined}
                            disabled={disabled}
                            onChange={(e) =>
                                setDraft((d) => ({ ...d, to: e.target.value }))
                            }
                        />
                    </label>
                    {invalid && (
                        <span role="alert" className={styles.invalid}>
                            Hasta debe ser igual o posterior a Desde.
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
export default PeriodFilter;
