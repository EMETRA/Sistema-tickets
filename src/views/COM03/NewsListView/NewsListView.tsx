"use client";

import { useMemo, useState } from "react";
import { useGetNoticias } from "@/api/hooks";
import { Title } from "@/components/client/atoms/Title";
import { Text } from "@/components/client/atoms/Text";
import { Button } from "@/components/client/atoms/Button";
import { NewsTablePanel } from "@/components/client/organisms/NewsTablePanel";
import type { NewsFilter } from "../types";
import styles from "./NewsListView.module.scss";

interface NewsListViewProps {
    onCreate: () => void;
    onEdit: (id: string) => void;
}

export default function NewsListView({ onCreate, onEdit }: NewsListViewProps) {
    const { data: noticias, loading, error } = useGetNoticias();
    const [filter, setFilter] = useState<NewsFilter>("all");
    const [search, setSearch] = useState("");

    const filteredNoticias = useMemo(() => {
        const term = search.trim().toLowerCase();
        return noticias.filter((noticia) => {
            if (filter !== "all" && noticia.estado !== filter) return false;
            if (term && !noticia.titulo.toLowerCase().includes(term)) return false;
            return true;
        });
    }, [noticias, filter, search]);

    const isEmpty = !loading && !error && noticias.length === 0;

    // TODO [COM03-FLUJO]: abrir modal "Archivar noticia" (4125:646).
    const handleArchive = (id: string) => {
        void id;
    };
    // TODO [COM03-FLUJO]: abrir modal "Eliminar noticia" (4127:713).
    const handleDelete = (id: string) => {
        void id;
    };
    // TODO [COM03-FLUJO]: restaurar noticia archivada.
    const handleRestore = (id: string) => {
        void id;
    };

    return (
        <>
            <div className={styles.header}>
                <Title variant="mid" tag="h1" className={styles.title}>Noticias</Title>
                <Text variant="caption" className={styles.subtitle}>
                    Publica avisos que se muestran en el Portal y se envían como push a VIVI.
                </Text>
                {loading && <Text variant="caption" className={styles.loadingText}>Cargando noticias...</Text>}
            </div>

            {!loading && !isEmpty && (
                <div className={styles.headerActions}>
                    <Button rounded onClick={onCreate}>
                        Crear noticia
                    </Button>
                </div>
            )}

            {error && (
                <Text variant="caption" className={styles.errorText}>
                    No fue posible cargar las noticias. Intenta nuevamente.
                </Text>
            )}

            <NewsTablePanel
                noticias={filteredNoticias}
                loading={loading}
                isEmpty={isEmpty}
                filter={filter}
                onFilterChange={setFilter}
                search={search}
                onSearchChange={setSearch}
                onCreate={onCreate}
                onEdit={onEdit}
                onArchive={handleArchive}
                onDelete={handleDelete}
                onRestore={handleRestore}
            />
        </>
    );
}
