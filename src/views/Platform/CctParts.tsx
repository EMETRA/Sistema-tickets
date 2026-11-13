"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { platformFetch, PlatformError } from "@/platform/client";
import {
    cctLabel,
    cctQuery,
    CCT_STATES,
    type CctPage,
    type CctRow,
} from "@/platform/cct";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
import local from "./CctWorkspace.module.scss";
export const cctError = (e: unknown) =>
    (e instanceof Error ? e.message : "No se pudo completar la operación.") +
    (e instanceof PlatformError && e.reference
        ? " Referencia: " + e.reference
        : "");
function shownValue(key: string, value: string | null, row: CctRow) {
    if (value == null) return "No registrado";
    if (key === "ESTATUS" && row.AVISO) return CCT_STATES[value] || value;
    if (/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(value))
        return (
            value.slice(8, 10) +
            "/" +
            value.slice(5, 7) +
            "/" +
            value.slice(0, 4) +
            " · " +
            value.slice(11)
        );
    return value;
}
export function CctData({ row }: { row: CctRow }) {
    return (
        <dl className={local.data}>
            {Object.entries(row)
                .filter(([, value]) => value !== null && value !== "")
                .map(([key, value]) => (
                    <div key={key}>
                        <dt>{cctLabel(key)}</dt>
                        <dd>{shownValue(key, value, row)}</dd>
                    </div>
                ))}
        </dl>
    );
}
export function CctTable({
    items,
    onSelect,
    label = "Resultados",
    columns,
    wide = false,
}: {
    items: CctRow[];
    onSelect?: (row: CctRow) => void;
    label?: string;
    columns?: string[];
    wide?: boolean;
}) {
    const preferred = [
        "AVISO",
        "SERIE",
        "REMISION",
        "FECHA",
        "CONDUCTOR",
        "LICENCIA",
        "CODIGO_PILOTO",
        "TIPO_PLACA",
        "PLACA",
        "TPLACA",
        "NPLACA",
        "CHAPA",
        "NOMBRE",
        "NOMBRE_PROPIETARIO",
        "MARCA",
        "MODELO",
        "ESTATUS",
        "FECHA_INICIAL",
        "FECHA_FINAL",
        "CONDICION_PAGO",
        "PAGO_RESUMEN",
        "REGISTRADO_SERVICIO",
        "REGISTRO_SERVICIO",
        "REGISTRO",
        "SERVICIO",
        "LUGAR",
        "MONTO",
        "RECEPTOR",
        "RECIBO",
        "FECPAGO",
        "RECEPTORT",
        "RECIBOT",
        "MONTOT",
        "FECPAGOT",
        "OBSERVACION",
        "OBSERVACIONES",
    ];
    const keys = items.length
        ? (
              columns || preferred.filter((k) => items.some((r) => k in r))
          ).filter((k) => items.some((r) => k in r))
        : [];
    const shown = keys.length ? keys : Object.keys(items[0] || {}).slice(0, 5);
    if (!items.length)
        return (
            <p className={local.empty}>No hay registros para esta consulta.</p>
        );
    return (
        <div
            className={styles.tableRegion}
            tabIndex={wide ? 0 : undefined}
            role={wide ? "region" : undefined}
            aria-label={wide ? label : undefined}
        >
            <table
                className={
                    styles.table +
                    (onSelect ? " " + local.selectable : "") +
                    (wide ? " " + local.wideTable : "")
                }
            >
                <caption className={local.tableCaption}>{label}</caption>
                <thead>
                    <tr>
                        {shown.map((k) => (
                            <th key={k}>{cctLabel(k)}</th>
                        ))}
                        {onSelect && <th>Acción</th>}
                    </tr>
                </thead>
                <tbody>
                    {items.map((row, i) => (
                        <tr key={i}>
                            {shown.map((k) => (
                                <td key={k} data-label={cctLabel(k)}>
                                    {row[k] == null
                                        ? "—"
                                        : shownValue(k, row[k], row)}
                                </td>
                            ))}
                            {onSelect && (
                                <td>
                                    <Button
                                        variant="outlined"
                                        onClick={() => onSelect(row)}
                                    >
                                        Ver detalle
                                    </Button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export function CctPager({
    data,
    onPage,
    disabled,
}: {
    data: CctPage;
    onPage: (offset: number) => void;
    disabled: boolean;
}) {
    return (
        <div className={styles.toolbar}>
            <span className={styles.muted}>
                {data.total} registros · Página{" "}
                {Math.floor(data.offset / 50) + 1}
            </span>
            <div className={local.buttons}>
                <Button
                    variant="outlined"
                    state={disabled || !data.offset ? "disabled" : "default"}
                    onClick={() => onPage(Math.max(0, data.offset - 50))}
                >
                    Anterior
                </Button>
                <Button
                    variant="outlined"
                    state={disabled || !data.hayMas ? "disabled" : "default"}
                    onClick={() => onPage(data.offset + 50)}
                >
                    Siguiente
                </Button>
            </div>
        </div>
    );
}
export function CctPicker({
    kind,
    label,
    value,
    onChange,
    disabled = false,
    optional = false,
    module,
    id,
}: {
    kind: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
    disabled?: boolean;
    optional?: boolean;
    module?: string;
    id?: string;
}) {
    const [q, setQ] = useState(""),
        [items, setItems] = useState<CctRow[]>([]),
        [offset, setOffset] = useState(0),
        [more, setMore] = useState(false),
        [error, setError] = useState(""),
        [busy, setBusy] = useState(false);
    const request = useRef<AbortController | null>(null);
    async function load(next = 0) {
        request.current?.abort();
        const ctl = new AbortController();
        request.current = ctl;
        setBusy(true);
        setError("");
        try {
            const r = await platformFetch<{ items: CctRow[]; hayMas: boolean }>(
                "/cct/catalogos?" +
                    cctQuery({
                        tipo: kind,
                        q,
                        offset: String(next),
                        ...(module ? { modulo: module } : {}),
                    }),
                { signal: ctl.signal },
            );
            if (ctl.signal.aborted) return;
            setItems((previous) => {
                if (next) return [...previous, ...r.items];
                const selected = previous.find((item) => item.ID === value);
                return selected && !r.items.some((item) => item.ID === value)
                    ? [selected, ...r.items]
                    : r.items;
            });
            setOffset(next);
            setMore(r.hayMas);
        } catch (e) {
            if (!ctl.signal.aborted) setError(cctError(e));
        } finally {
            if (!ctl.signal.aborted) setBusy(false);
        }
    }
    useEffect(() => {
        void load();
        return () => request.current?.abort();
    }, [kind]);
    return (
        <fieldset className={local.picker} disabled={disabled}>
            <legend>
                {label}
                {optional ? " (opcional)" : " *"}
            </legend>
            <select
                aria-label={label}
                id={id}
                className={styles.control}
                value={value}
                required={!optional}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="">
                    {optional ? "Todos" : "Selecciona una opción"}
                </option>
                {value && !items.some((r) => r.ID === value) && (
                    <option value={value}>Código {value} · valor actual</option>
                )}
                {items.map((r) => (
                    <option value={r.ID!} key={r.ID}>
                        {r.NOMBRE} · {r.ID}
                    </option>
                ))}
            </select>
            <details className={local.pickerSearch}>
                <summary>Buscar otras opciones</summary>
                <div className={local.inline}>
                    <input
                        className={styles.control}
                        aria-label={"Buscar " + label.toLowerCase()}
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Buscar por descripción"
                    />
                    <Button
                        type="button"
                        variant="outlined"
                        state={busy ? "disabled" : "default"}
                        onClick={() => void load()}
                    >
                        Buscar
                    </Button>
                </div>
                {more && (
                    <Button
                        type="button"
                        variant="outlined"
                        state={busy ? "disabled" : "default"}
                        onClick={() => void load(offset + 50)}
                    >
                        Cargar más opciones
                    </Button>
                )}
            </details>
            {error && (
                <p role="alert" className={styles.error}>
                    {error}
                </p>
            )}
        </fieldset>
    );
}
