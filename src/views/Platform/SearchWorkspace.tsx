"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/client/atoms/Button";
import { platformFetch } from "@/platform/client";
import type { PlatformRecord } from "@/platform/types";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
type Result = {
    consulta: string;
    grupos: {
        tipo: string;
        titulo: string;
        grupo: string;
        items: PlatformRecord[];
        total: number;
    }[];
    limitePorGrupo: number;
};
export function SearchWorkspace() {
    const [q, setQuery] = useState(""),
        [result, setResult] = useState<Result | null>(null),
        [error, setError] = useState(""),
        [busy, setBusy] = useState(false);
    async function search() {
        setBusy(true);
        setError("");
        try {
            setResult(
                await platformFetch<Result>(
                    "/search?q=" + encodeURIComponent(q),
                ),
            );
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "No se pudo consultar la información.",
            );
        } finally {
            setBusy(false);
        }
    }
    return (
        <section className={styles.page}>
            <form
                className={styles.toolbar}
                onSubmit={(e) => {
                    e.preventDefault();
                    void search();
                }}
            >
                <label className={styles.search}>
                    Buscar en mi espacio de trabajo
                    <input
                        className={styles.control}
                        value={q}
                        minLength={2}
                        maxLength={100}
                        required
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </label>
                <Button type="submit" state={busy ? "loading" : "default"}>
                    Buscar
                </Button>
            </form>
            {error && (
                <p role="alert" className={styles.error}>
                    {error}
                </p>
            )}
            {result && (
                <>
                    <p className={styles.muted}>
                        Resultados autorizados por nombre para «
                        {result.consulta}».
                    </p>
                    {result.grupos.map((group) => (
                        <section key={group.tipo} className={styles.card}>
                            <h2>
                                {group.titulo} · {group.total}
                            </h2>
                            <ul className={styles.timeline}>
                                {group.items.map((item) => (
                                    <li key={item.id}>
                                        <Link
                                            className={styles.link}
                                            href={
                                                "/espacio/registro/" +
                                                group.tipo +
                                                "/" +
                                                item.id
                                            }
                                        >
                                            {item.nombre}
                                        </Link>
                                        <span className={styles.chip}>
                                            {item.estado}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            {group.total > result.limitePorGrupo && (
                                <p className={styles.muted}>
                                    Se muestran los primeros{" "}
                                    {result.limitePorGrupo} resultados. Abre la
                                    sección para consultar el resto.
                                </p>
                            )}
                        </section>
                    ))}
                    {!result.grupos.length && (
                        <p className={styles.card}>
                            No hay coincidencias dentro de tu alcance.
                        </p>
                    )}
                </>
            )}
        </section>
    );
}
