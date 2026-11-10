"use client";
import { useId, useState } from "react";
import styles from "./AccessChoices.module.scss";
export function AccessChoices({
    label,
    options,
    value,
    onChange,
    disabled = false,
    readOnly = false,
}: {
    label: string;
    options: { id: number; nombre: string; descripcion?: string }[];
    value: number[];
    onChange: (value: number[]) => void;
    disabled?: boolean;
    readOnly?: boolean;
}) {
    const [query, setQuery] = useState("");
    const countId = useId();
    const visible = options.filter((option) =>
        (option.nombre + " " + (option.descripcion || ""))
            .toLocaleLowerCase("es-GT")
            .includes(query.toLocaleLowerCase("es-GT")),
    );
    return (
        <fieldset className={styles.field} aria-describedby={countId}>
            <legend>{label}</legend>
            <input
                type="search"
                aria-label={"Filtrar " + label.toLocaleLowerCase("es-GT")}
                placeholder="Buscar por nombre o descripción…"
                value={query}
                disabled={disabled}
                onChange={(event) => setQuery(event.target.value)}
            />
            <div className={styles.choices}>
                {visible.map((option) => (
                    <label
                        key={option.id}
                        className={
                            value.includes(option.id)
                                ? styles.selected
                                : undefined
                        }
                    >
                        <input
                            type="checkbox"
                            checked={value.includes(option.id)}
                            disabled={disabled || readOnly}
                            onChange={() =>
                                onChange(
                                    value.includes(option.id)
                                        ? value.filter((id) => id !== option.id)
                                        : [...value, option.id],
                                )
                            }
                        />
                        <span>
                            <strong>{option.nombre}</strong>
                            {option.descripcion && (
                                <small>{option.descripcion}</small>
                            )}
                        </span>
                    </label>
                ))}
                {!visible.length && (
                    <p>No hay opciones que coincidan con la búsqueda.</p>
                )}
            </div>
            <small id={countId}>
                {value.length} seleccionadas · {options.length} disponibles ·{" "}
                {visible.length} mostradas
            </small>
        </fieldset>
    );
}
