"use client";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "../../atoms/Icon";
import styles from "./ApplicationSwitcher.module.scss";

export interface ApplicationLink {
  id: string;
  title: string;
  href: string;
}
export function ApplicationSwitcher({
    applications,
}: {
  applications: ApplicationLink[];
}) {
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const root = useRef<HTMLDivElement>(null);
    const listId = useId();
    useEffect(() => {
        const close = (event: PointerEvent) => {
            if (!root.current?.contains(event.target as Node)) setOpen(false);
        };
        document.addEventListener("pointerdown", close);
        return () => document.removeEventListener("pointerdown", close);
    }, []);
    const results = applications.filter((app) =>
        app.title
            .toLocaleLowerCase("es")
            .includes(search.trim().toLocaleLowerCase("es")),
    );
    return (
        <div
            className={styles.root}
            ref={root}
            onKeyDown={(event) => {
                if (event.key === "Escape") setOpen(false);
            }}
        >
            <label className={styles.search}>
                <Icon name="magnifying-glass-solid" size={15} color="#8190a7" />
                <span className={styles.srOnly}>Buscar una aplicación</span>
                <input
                    value={search}
                    placeholder="Buscar una aplicación"
                    onChange={(event) => {
                        setSearch(event.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    aria-controls={listId}
                />
            </label>
            {open && (
                <div id={listId} className={styles.results}>
                    <span className={styles.caption}>Tus aplicaciones</span>
                    {results.length ? (
                        <ul>
                            {results.map((app) => (
                                <li key={app.id}>
                                    <Link
                                        href={app.href}
                                        onClick={() => {
                                            setOpen(false);
                                            setSearch("");
                                        }}
                                    >
                                        {app.title}
                                        <span aria-hidden="true">→</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p role="status">
                            {applications.length
                                ? "No hay aplicaciones que coincidan."
                                : "No tienes aplicaciones asignadas."}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
