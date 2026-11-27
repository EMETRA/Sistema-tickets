"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/client/atoms/Icon";
import { WorkspaceIcon } from "@/components/client/atoms/WorkspaceIcon/WorkspaceIcon";
import { TicketDetail } from "@/features/tickets/components/TicketDetail";
import { usePlatformQuery } from "@/platform/query";
import { readRecents } from "@/platform/recents";
import { useCommandPalette } from "@/store/useCommandPalette";
import styles from "./CommandPalette.module.scss";

export type PaletteItem = {
    id: string;
    label: string;
    group: "Acciones" | "Ir a" | "Aplicaciones" | "Módulos" | "Informática" | "Tickets" | "Recientes";
    hint?: string;
    icon?: string;
    /** Icono del catálogo (Icon) en lugar del icono de navegación. */
    catalogIcon?: boolean;
    accent?: string;
    href?: string;
    run?: () => void;
    keywords?: string;
};

type TicketRow = { id: number; codigo: string; titulo: string; estadoNombre?: string; estado?: number };
const STATE: Record<number, string> = {
    1: "Sin asignar",
    2: "Asignado",
    3: "En atención",
    4: "Cancelado",
    5: "Resuelto",
};
const ORDER: PaletteItem["group"][] = [
    "Recientes",
    "Acciones",
    "Tickets",
    "Ir a",
    "Aplicaciones",
    "Módulos",
    "Informática",
];

const normalize = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function score(item: PaletteItem, terms: string[]) {
    const label = normalize(item.label);
    const haystack = normalize(`${item.label} ${item.hint || ""} ${item.keywords || ""}`);
    if (!terms.every((t) => haystack.includes(t))) return -1;
    let value = 0;
    for (const t of terms) {
        if (label.startsWith(t)) value += 6;
        else if (label.split(/\s+/).some((w) => w.startsWith(t))) value += 4;
        else if (label.includes(t)) value += 2;
        else value += 1;
    }
    return value;
}

/** Buscador global: ⌘K / Ctrl+K o la tecla «/» fuera de un campo de texto. */
export function CommandPalette({ items, ticketScope }: { items: PaletteItem[]; ticketScope?: string }) {
    const router = useRouter();
    const { open, hide, toggle } = useCommandPalette();
    const [query, setQuery] = useState("");
    const [active, setActive] = useState(0);
    const [ticketId, setTicketId] = useState<string | null>(null);
    const dialog = useRef<HTMLDialogElement>(null);
    const input = useRef<HTMLInputElement>(null);
    const list = useRef<HTMLUListElement>(null);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            const typing = !!target?.closest("input, textarea, select, [contenteditable=true]");
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                toggle();
            } else if (event.key === "/" && !typing && !document.querySelector("dialog[open]")) {
                event.preventDefault();
                toggle();
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [toggle]);

    useEffect(() => {
        const node = dialog.current;
        if (!node) return;
        if (open && !node.open) {
            node.showModal();
            requestAnimationFrame(() => input.current?.focus());
        }
        if (!open && node.open) node.close();
    }, [open]);

    // Tickets propios (o de la bandeja) para encontrarlos por código o asunto.
    // Tickets para buscar por código o título (solo mientras el buscador está abierto).
    const ticketsQuery = usePlatformQuery<{ items: TicketRow[] }>(
        open && ticketScope ? `/tickets?scope=${ticketScope}&limit=50` : null,
    );
    const tickets = useMemo(() => ticketsQuery.data?.items ?? [], [ticketsQuery.data]);

    const results = useMemo(() => {
        const terms = normalize(query).split(/\s+/).filter(Boolean);
        const ticketItems: PaletteItem[] = tickets.map((t) => ({
            id: "ticket-" + t.id,
            label: `${t.codigo || "#" + t.id} · ${t.titulo}`,
            hint: t.estadoNombre || STATE[t.estado || 0],
            group: "Tickets",
            icon: "ticket-solid",
            run: () => setTicketId(String(t.id)),
        }));
        if (!terms.length) {
            const recents: PaletteItem[] = (open ? readRecents() : []).slice(0, 4).map((r) => ({
                id: "reciente-" + r.path,
                label: r.title,
                hint: r.area,
                group: "Recientes",
                icon: "clock-rotate-left-solid",
                href: r.path,
            }));
            return [
                ...recents,
                ...items.filter((i) => i.group === "Acciones"),
                ...ticketItems.slice(0, 3),
                ...items.filter((i) => i.group === "Ir a").slice(0, 6),
                ...items.filter((i) => i.group === "Aplicaciones"),
            ];
        }
        return [...items, ...ticketItems]
            .map((item) => ({ item, value: score(item, terms) }))
            .filter((r) => r.value >= 0)
            .sort((a, b) => ORDER.indexOf(a.item.group) - ORDER.indexOf(b.item.group) || b.value - a.value)
            .reduce<PaletteItem[]>((acc, { item }) => {
                // Hasta 6 por grupo: la lista sigue siendo legible.
                if (acc.filter((i) => i.group === item.group).length < 6) acc.push(item);
                return acc;
            }, []);
    }, [items, query, tickets, open]);

    const groups = ORDER.map((group) => ({
        group,
        entries: results.filter((r) => r.group === group),
    })).filter((g) => g.entries.length);
    const flat = groups.flatMap((g) => g.entries);
    const current = Math.min(active, Math.max(0, flat.length - 1));

    useEffect(() => {
        list.current
            ?.querySelector<HTMLElement>(`[data-index="${current}"]`)
            ?.scrollIntoView({ block: "nearest" });
    }, [current]);

    const close = () => {
        hide();
        setQuery("");
        setActive(0);
    };
    const choose = (item: PaletteItem | undefined) => {
        if (!item) return;
        close();
        if (item.run) item.run();
        else if (item.href) router.push(item.href);
    };

    return (
        <>
            <dialog
                ref={dialog}
                className={styles.dialog}
                aria-label="Buscar en el panel"
                onCancel={(e) => {
                    e.preventDefault();
                    close();
                }}
                onClick={(e) => {
                    if (e.target === dialog.current) close();
                }}
            >
                <div className={styles.searchRow}>
                    <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        aria-hidden="true"
                        className={styles.searchIcon}
                    >
                        <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                        <path
                            d="m20 20-3.5-3.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                    <input
                        ref={input}
                        role="combobox"
                        aria-expanded="true"
                        aria-controls="palette-results"
                        aria-activedescendant={flat[current] ? "palette-" + current : undefined}
                        aria-label="Buscar aplicaciones, módulos, tickets o secciones"
                        placeholder="Buscar aplicaciones, módulos, tickets o secciones…"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setActive(0);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "ArrowDown") {
                                e.preventDefault();
                                setActive((current + 1) % Math.max(1, flat.length));
                            } else if (e.key === "ArrowUp") {
                                e.preventDefault();
                                setActive((current - 1 + flat.length) % Math.max(1, flat.length));
                            } else if (e.key === "Enter") {
                                e.preventDefault();
                                choose(flat[current]);
                            }
                        }}
                    />
                    <kbd className={styles.esc}>esc</kbd>
                </div>
                <ul ref={list} id="palette-results" role="listbox" className={styles.results}>
                    {groups.map(({ group, entries }) => (
                        <li key={group} role="presentation">
                            <span className={styles.groupLabel} role="presentation">
                                {group}
                            </span>
                            <ul role="group" aria-label={group}>
                                {entries.map((item) => {
                                    const i = flat.indexOf(item);
                                    return (
                                        <li
                                            key={item.id}
                                            id={"palette-" + i}
                                            data-index={i}
                                            role="option"
                                            aria-selected={i === current}
                                            className={styles.option}
                                            onMouseMove={() => setActive(i)}
                                            onClick={() => choose(item)}
                                        >
                                            <span
                                                className={styles.optionIcon}
                                                style={
                                                    item.accent
                                                        ? ({ "--accent": item.accent } as React.CSSProperties)
                                                        : undefined
                                                }
                                            >
                                                {item.catalogIcon && item.icon ? (
                                                    <Icon name={item.icon} size={15} color="currentColor" />
                                                ) : (
                                                    <WorkspaceIcon
                                                        name={item.icon || "table-cells-large-solid"}
                                                        size={17}
                                                    />
                                                )}
                                            </span>
                                            <span className={styles.optionLabel}>{item.label}</span>
                                            {item.hint && (
                                                <span className={styles.optionHint}>{item.hint}</span>
                                            )}
                                            <span className={styles.enter} aria-hidden="true">
                                                ↵
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </li>
                    ))}
                    {!flat.length && (
                        <li className={styles.empty} role="presentation">
                            Sin resultados para «{query}». Prueba con el nombre de un área, un módulo o el
                            código de un ticket.
                        </li>
                    )}
                </ul>
                <footer className={styles.footer}>
                    <span>
                        <kbd>↑</kbd>
                        <kbd>↓</kbd> navegar
                    </span>
                    <span>
                        <kbd>↵</kbd> abrir
                    </span>
                    <span>
                        <kbd>esc</kbd> cerrar
                    </span>
                    <span className={styles.footerHint}>
                        Ábrelo desde cualquier pantalla con <kbd>⌘</kbd>
                        <kbd>K</kbd> o <kbd>/</kbd>
                    </span>
                </footer>
            </dialog>
            <TicketDetail isOpen={!!ticketId} ticketId={ticketId || ""} onClose={() => setTicketId(null)} />
        </>
    );
}
export default CommandPalette;
