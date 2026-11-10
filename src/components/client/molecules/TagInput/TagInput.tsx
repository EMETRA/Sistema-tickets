"use client";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./TagInput.module.scss";
export type TagOption = { id: string; nombre: string; color?: string | null };
const fold = (value: string) =>
    value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("es")
        .trim()
        .replace(/\s+/g, " ");

export function TagInput({
    options,
    value,
    onChange,
    onCreate,
    disabled = false,
    max = 10,
}: {
    options: TagOption[];
    value: string[];
    onChange: (value: string[]) => void;
    onCreate?: (name: string) => Promise<boolean>;
    disabled?: boolean;
    max?: number;
}) {
    const id = useId(),
        input = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState(""),
        [open, setOpen] = useState(false),
        [active, setActive] = useState(0);
    const matching = options.filter(
        (tag) =>
            !value.includes(tag.id) && fold(tag.nombre).includes(fold(query)),
    );
    const exact = options.find((tag) => fold(tag.nombre) === fold(query));
    const canCreate =
        !!onCreate && !!query.trim() && !exact && value.length < max;
    const count =
        value.length < max ? matching.length + (canCreate ? 1 : 0) : 0;
    const activeIndex = count ? Math.min(active, count - 1) : -1;
    useEffect(() => {
        if (open && !disabled && activeIndex >= 0)
            document
                .getElementById(id + "-option-" + activeIndex)
                ?.scrollIntoView({ block: "nearest" });
    }, [id, open, disabled, activeIndex, query]);
    let emptyMessage = "El catálogo todavía no tiene etiquetas.";
    if (options.length) emptyMessage = "No hay otras etiquetas con ese nombre.";
    if (exact && value.includes(exact.id))
        emptyMessage = "Esta etiqueta ya está seleccionada.";
    if (value.length >= max)
        emptyMessage = `Puedes escoger hasta ${max} etiquetas.`;
    function remove(tagId: string) {
        onChange(value.filter((v) => v !== tagId));
        input.current?.focus();
    }
    async function choose(index: number) {
        if (disabled || value.length >= max || index < 0) return;
        if (index < matching.length) {
            onChange([...value, matching[index].id]);
        } else if (!canCreate || !(await onCreate?.(query.trim()))) return;
        setQuery("");
        setActive(0);
        requestAnimationFrame(() => input.current?.focus());
    }
    return (
        <div
            className={styles.root}
            onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
            }}
        >
            <label htmlFor={id}>Etiquetas de trabajo</label>
            <div className={styles.picker}>
                <div
                    className={styles.control}
                    data-disabled={disabled || undefined}
                    onClick={() => input.current?.focus()}
                >
                    {value.map((tagId) => {
                        const tag = options.find(
                            (option) => option.id === tagId,
                        );
                        return (
                            <span
                                key={tagId}
                                className={styles.chip}
                                style={{
                                    borderInlineStartColor:
                                        /^#[0-9A-F]{6}$/i.test(tag?.color || "")
                                            ? tag!.color!
                                            : undefined,
                                }}
                            >
                                <span>
                                    {tag?.nombre || "Etiqueta " + tagId}
                                </span>
                                <button
                                    type="button"
                                    aria-label={
                                        "Quitar " + (tag?.nombre || tagId)
                                    }
                                    disabled={disabled}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        remove(tagId);
                                    }}
                                >
                                    ×
                                </button>
                            </span>
                        );
                    })}
                    <input
                        ref={input}
                        id={id}
                        role="combobox"
                        aria-autocomplete="list"
                        aria-expanded={open && !disabled}
                        aria-controls={id + "-options"}
                        aria-activedescendant={
                            open && !disabled && activeIndex >= 0
                                ? id + "-option-" + activeIndex
                                : undefined
                        }
                        aria-describedby={id + "-hint"}
                        autoComplete="off"
                        value={query}
                        maxLength={50}
                        disabled={disabled}
                        placeholder={
                            value.length
                                ? "Agregar etiqueta…"
                                : "Buscar o agregar etiquetas…"
                        }
                        onFocus={() => setOpen(true)}
                        onClick={() => setOpen(true)}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setActive(0);
                            setOpen(true);
                        }}
                        onKeyDown={(e) => {
                            if (e.nativeEvent.isComposing) return;
                            if (e.key === "Escape") {
                                e.preventDefault();
                                setOpen(false);
                            }
                            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                                e.preventDefault();
                                setOpen(true);
                                if (count)
                                    setActive(
                                        (activeIndex +
                                            (e.key === "ArrowDown" ? 1 : -1) +
                                            count) %
                                            count,
                                    );
                            }
                            if (e.key === "Enter") {
                                e.preventDefault();
                                if (open && activeIndex >= 0)
                                    void choose(activeIndex);
                                else setOpen(true);
                            }
                            if (
                                e.key === "Backspace" &&
                                !query &&
                                value.length
                            ) {
                                e.preventDefault();
                                remove(value[value.length - 1]);
                            }
                        }}
                    />
                </div>
                {open && !disabled && (
                    <ul
                        id={id + "-options"}
                        className={styles.options}
                        role="listbox"
                        aria-label="Etiquetas disponibles"
                        aria-multiselectable="true"
                    >
                        {value.length < max &&
                            matching.map((tag, index) => (
                                <li
                                    id={id + "-option-" + index}
                                    key={tag.id}
                                    role="option"
                                    aria-selected="false"
                                    data-active={
                                        activeIndex === index || undefined
                                    }
                                    onMouseDown={(e) => e.preventDefault()}
                                    onMouseEnter={() => setActive(index)}
                                    onClick={() => void choose(index)}
                                >
                                    {tag.nombre}
                                </li>
                            ))}
                        {canCreate && (
                            <li
                                id={id + "-option-" + matching.length}
                                role="option"
                                aria-selected="false"
                                data-active={
                                    activeIndex === matching.length || undefined
                                }
                                onMouseDown={(e) => e.preventDefault()}
                                onMouseEnter={() => setActive(matching.length)}
                                onClick={() => void choose(matching.length)}
                            >
                                Crear «{query.trim()}»
                            </li>
                        )}
                        {!count && (
                            <li role="presentation" className={styles.empty}>
                                {emptyMessage}
                            </li>
                        )}
                    </ul>
                )}
            </div>
            <small id={id + "-hint"}>
                Escribe para buscar, pulsa Enter para agregar y × para quitar.
                Guarda los cambios para aplicarlos al ticket.
            </small>
        </div>
    );
}
