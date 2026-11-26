"use client";
import { useEffect, useId, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { platformFetch } from "@/platform/client";
import styles from "./PeoplePicker.module.scss";

export type Person = { id: number; nombre: string };
/** Búsqueda de personas; por defecto consulta el API (`/people?q=`). */
export type PeopleSearch = (query: string, signal: AbortSignal) => Promise<Person[]>;

const apiSearch =
    (lookupPath: string): PeopleSearch =>
    (query, signal) =>
        platformFetch<Person[]>(lookupPath + "?q=" + encodeURIComponent(query), { signal });

/** Clave de caché compartida (TanStack Query) para las búsquedas de personas. */
const peopleKey = (lookupPath: string, query: string) => ["personas", lookupPath, query] as const;

function initials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]!.toUpperCase())
        .join("");
}

/** Nombres de personas por id: usa la lista de `/people` y cualquier búsqueda ya hecha (caché compartida). */
export function usePeopleNames(ids: number[], lookupPath = "/people", search?: PeopleSearch) {
    const client = useQueryClient();
    useQuery({
        queryKey: peopleKey(lookupPath, ""),
        queryFn: ({ signal }) => (search || apiSearch(lookupPath))("", signal),
        enabled: ids.length > 0,
        staleTime: 5 * 60_000,
    });
    const names = new Map<number, string>();
    for (const [, people] of client.getQueriesData<Person[]>({ queryKey: ["personas", lookupPath] }))
        for (const p of people || []) names.set(Number(p.id), p.nombre);
    return (id: number) => names.get(id);
}

export function PersonChip({
    name,
    onRemove,
    disabled,
}: {
    name: string;
    onRemove?: () => void;
    disabled?: boolean;
}) {
    return (
        <span className={styles.chip}>
            <span className={styles.avatar} aria-hidden="true">
                {initials(name)}
            </span>
            {name}
            {onRemove && (
                <button type="button" onClick={onRemove} disabled={disabled} aria-label={"Quitar a " + name}>
                    ×
                </button>
            )}
        </span>
    );
}

/**
 * Selector de participantes: buscar y tocar para agregar; cada persona queda
 * como una ficha con su botón «Quitar». Sustituye la lista múltiple con
 * Ctrl/Cmd, difícil de usar para muchas personas.
 */
export function PeoplePicker({
    id,
    label,
    value,
    onChange,
    disabled,
    lookupPath = "/people",
    search,
}: {
    id?: string;
    label: string;
    value: number[];
    onChange: (value: number[]) => void;
    disabled?: boolean;
    lookupPath?: string;
    /** Inyecta la búsqueda (Storybook, pruebas u otro origen de personas). */
    search?: PeopleSearch;
}) {
    const auto = useId(),
        inputId = id || auto,
        listId = inputId + "-opciones",
        [query, setQuery] = useState(""),
        [open, setOpen] = useState(false),
        [active, setActive] = useState(0),
        [term, setTerm] = useState(""),
        box = useRef<HTMLDivElement>(null);
    const nameOf = usePeopleNames(value, lookupPath, search);
    // Espera 200 ms después de la última tecla antes de buscar.
    useEffect(() => {
        const timer = setTimeout(() => setTerm(query.trim()), 200);
        return () => clearTimeout(timer);
    }, [query]);
    const results = useQuery({
        queryKey: peopleKey(lookupPath, term),
        queryFn: ({ signal }) => (search || apiSearch(lookupPath))(term, signal),
        enabled: open,
        staleTime: 60_000,
    });
    const options = (results.data || []).map((p) => ({ id: Number(p.id), nombre: p.nombre }));
    const error = results.error
        ? results.error instanceof Error
            ? results.error.message
            : "No se pudo buscar personas."
        : "";
    const available = options.filter((o) => !value.includes(o.id)).slice(0, 8);
    function add(person: Person) {
        onChange([...value, person.id]);
        setQuery("");
        setActive(0);
        setOpen(false);
    }
    return (
        <div
            ref={box}
            className={styles.picker}
            onBlur={(e) => {
                if (!box.current?.contains(e.relatedTarget as Node)) setOpen(false);
            }}
        >
            {value.length > 0 && (
                <ul className={styles.chips} aria-label={label + " seleccionados"}>
                    {value.map((pid) => (
                        <li key={pid}>
                            <PersonChip
                                name={nameOf(pid) || "Persona " + pid}
                                disabled={disabled}
                                onRemove={() => onChange(value.filter((v) => v !== pid))}
                            />
                        </li>
                    ))}
                </ul>
            )}
            <div className={styles.combo}>
                <input
                    id={inputId}
                    role="combobox"
                    aria-expanded={open && available.length > 0}
                    aria-controls={listId}
                    aria-autocomplete="list"
                    aria-activedescendant={
                        open && available[active] ? `${listId}-${available[active].id}` : undefined
                    }
                    className={styles.input}
                    placeholder="Escribe un nombre para agregar…"
                    value={query}
                    disabled={disabled}
                    autoComplete="off"
                    onFocus={() => setOpen(true)}
                    onClick={() => setOpen(true)}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                        setActive(0);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setOpen(true);
                            setActive((a) => Math.min(a + 1, available.length - 1));
                        } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            setActive((a) => Math.max(a - 1, 0));
                        } else if (e.key === "Enter" && open && available[active]) {
                            e.preventDefault();
                            add(available[active]);
                        } else if (e.key === "Escape" && open) {
                            e.stopPropagation();
                            e.preventDefault();
                            setOpen(false);
                        } else if (e.key === "Backspace" && !query && value.length) {
                            onChange(value.slice(0, -1));
                        }
                    }}
                />
                {open && (
                    <ul
                        id={listId}
                        role="listbox"
                        className={styles.options}
                        aria-label={"Personas para " + label}
                    >
                        {available.map((p, i) => (
                            <li
                                key={p.id}
                                id={`${listId}-${p.id}`}
                                role="option"
                                aria-selected={i === active}
                                data-active={i === active || undefined}
                                onMouseDown={(e) => e.preventDefault()}
                                onMouseEnter={() => setActive(i)}
                                onClick={() => add(p)}
                            >
                                <span className={styles.avatar} aria-hidden="true">
                                    {initials(p.nombre)}
                                </span>
                                {p.nombre}
                            </li>
                        ))}
                        {!available.length && (
                            <li className={styles.none} role="presentation">
                                {error ||
                                    (query
                                        ? "No hay coincidencias con «" + query + "»."
                                        : "No hay más personas disponibles.")}
                            </li>
                        )}
                    </ul>
                )}
            </div>
            <small className={styles.hint}>
                {value.length
                    ? `${value.length} ${value.length === 1 ? "persona agregada" : "personas agregadas"}. Usa × para quitar.`
                    : "Busca por nombre y toca una persona para agregarla."}
            </small>
        </div>
    );
}
