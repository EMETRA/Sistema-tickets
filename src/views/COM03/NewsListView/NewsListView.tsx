"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    useArchivarNoticia,
    useGetNoticias,
    useRestaurarNoticia,
} from "@/api/hooks";
import { EstadoNoticia, type NoticiaListRow } from "@/api/graphql/COM03";
import { Title } from "@/components/client/atoms/Title";
import { Text } from "@/components/client/atoms/Text";
import { Button } from "@/components/client/atoms/Button";
import { ModalContent } from "@/components/client/molecules/ModalContent";
import { LoadingModal } from "@/components/client/molecules/LoadingModal";
import { NewsTablePanel } from "@/components/client/organisms/NewsTablePanel";
import type { NewsFilter } from "../types";
import styles from "./NewsListView.module.scss";

interface NewsListViewProps {
    onCreate: () => void;
    onEdit: (id: string) => void;
    /**
     * false = solo lectura: sin "Crear noticia" ni acciones por fila (sin VIVI_NOTICIAS_EDITAR).
     * @default true
     */
    canEdit?: boolean;
}

/** No hay "eliminar": el Panel archiva, no borra (README "Noticias CMS" sección 3). */
type ListAction = "archivar" | "restaurar";

/** El listado REST incluye el estado real del push de cada publicación. */
const MOSTRAR_NOTIFICACIONES = true;

/**
 * Explicación de archivar según el estado de la noticia.
 * El título viene del diseño; las descripciones de programada y borrador, el aviso del push y
 * Restaurar no están en el Figma (TODO [COM03-FLUJO]: textos propuestos, los valida diseño).
 * README sección 3: archivar o restaurar no deshace un push ya enviado.
 */
const ARCHIVAR_DESCRIPCION: Record<EstadoNoticia, string> = {
    [EstadoNoticia.PUBLICADA]: "Dejará de mostrarse en el Portal. La notificación push que ya se envió a VIVI no se puede deshacer.",
    [EstadoNoticia.PROGRAMADA]: "Ya no se publicará en la fecha programada. Podrás restaurarla después.",
    [EstadoNoticia.BORRADOR]: "Saldrá de borradores. Podrás restaurarla después.",
    [EstadoNoticia.ARCHIVADA]: "",
};

/** Los textos de carga no están en el diseño (siguen el estilo de "Programando tu noticia"). */
function getActionTexts(type: ListAction, noticia: NoticiaListRow) {
    if (type === "archivar") {
        return {
            title: "¿Archivar esta noticia?",
            description: ARCHIVAR_DESCRIPCION[noticia.estado],
            loadingTitle: "Archivando la noticia",
            error: "No fue posible archivar la noticia. Intenta nuevamente.",
        };
    }
    return {
        title: "¿Restaurar esta noticia?",
        description: "Volverá a borradores. Podrás editarla y publicarla de nuevo.",
        loadingTitle: "Restaurando la noticia",
        error: "No fue posible restaurar la noticia. Intenta nuevamente.",
    };
}

const LOADING_DESCRIPTION = "Esto tomará unos segundos";

export default function NewsListView({ onCreate, onEdit, canEdit = true }: NewsListViewProps) {
    const [filter, setFilter] = useState<NewsFilter>("all");
    const [search, setSearch] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [page, setPage] = useState(1);
    useEffect(() => {
        const timer = setTimeout(() => { setAppliedSearch(search); setPage(1); }, 300);
        return () => clearTimeout(timer);
    }, [search]);
    const { data: noticias, total, loading, error, refetch } = useGetNoticias({
        estado: filter === 'all' ? null : filter as EstadoNoticia, busqueda: appliedSearch, page, limit: 20,
    });
    const pages = Math.max(1, Math.ceil(total / 20));
    useEffect(() => { if (!loading && page > pages) setPage(pages); }, [loading, page, pages]);
    const { archivarNoticia } = useArchivarNoticia();
    const { restaurarNoticia } = useRestaurarNoticia();
    // Acción en curso: primero se confirma y luego se procesa con el modal de carga.
    const [pendingAction, setPendingAction] = useState<{ type: ListAction; noticia: NoticiaListRow } | null>(null);
    const [processing, setProcessing] = useState(false);
    const processingRef = useRef(false);
    const [actionError, setActionError] = useState<string | null>(null);

    const rows: NoticiaListRow[] = useMemo(
        () => noticias.map((noticia) => ({ ...noticia, estadoNotificacion: noticia.estadoNotificacion ?? null })),
        [noticias]
    );

    const isEmpty = !loading && !error && noticias.length === 0;

    // Archivar y restaurar necesitan la fila completa (slug, idioma, visibilidad) para guardarNoticiaCms.
    const openAction = (type: ListAction, id: string) => {
        const noticia = rows.find((row) => row.id === id);
        if (!noticia) return;
        setActionError(null);
        setPendingAction({ type, noticia });
    };

    const actionHandlers: Record<ListAction, (noticia: NoticiaListRow) => Promise<unknown>> = {
        archivar: archivarNoticia,
        restaurar: restaurarNoticia,
    };

    const confirmAction = async () => {
        // processingRef bloquea el doble clic antes de que React vuelva a pintar.
        if (!pendingAction || processingRef.current) return;
        processingRef.current = true;
        // Se cierra la confirmación y se muestra el modal de carga mientras se procesa.
        setProcessing(true);
        try {
            await actionHandlers[pendingAction.type](pendingAction.noticia);
            await refetch();
        } catch {
            setActionError(getActionTexts(pendingAction.type, pendingAction.noticia).error);
        } finally {
            processingRef.current = false;
            setProcessing(false);
            setPendingAction(null);
        }
    };

    const pendingTexts = pendingAction ? getActionTexts(pendingAction.type, pendingAction.noticia) : null;

    return (
        <>
            <div className={styles.header}>
                <Title variant="mid" tag="h1" className={styles.title}>Noticias</Title>
                <Text variant="caption" className={styles.subtitle}>
                    Publica avisos que se muestran en el Portal y se envían como push a VIVI.
                </Text>
                {loading && <Text variant="caption" className={styles.loadingText}>Cargando noticias...</Text>}
            </div>

            {canEdit && !loading && !isEmpty && (
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

            {actionError && (
                <Text variant="caption" className={styles.errorText}>
                    {actionError}
                </Text>
            )}

            <NewsTablePanel
                noticias={rows}
                loading={loading}
                showNotifications={MOSTRAR_NOTIFICACIONES}
                canEdit={canEdit}
                isEmpty={isEmpty}
                filter={filter}
                onFilterChange={(value) => { setPage(1); setFilter(value); }}
                search={search}
                onSearchChange={setSearch}
                onCreate={onCreate}
                onEdit={onEdit}
                onArchive={(id) => openAction("archivar", id)}
                onRestore={(id) => openAction("restaurar", id)}
            />

            {!error && total > 0 && (
                <div className={styles.headerActions}>
                    <Button variant="outlined" state={loading || page <= 1 ? 'disabled' : 'default'} onClick={() => setPage(p => p - 1)}>Anterior</Button>
                    <Text variant="caption">Página {page} de {pages} · {total} noticias</Text>
                    <Button variant="outlined" state={loading || page >= pages ? 'disabled' : 'default'} onClick={() => setPage(p => p + 1)}>Siguiente</Button>
                </div>
            )}

            {pendingTexts && (
                <>
                    <ModalContent
                        variant="compact"
                        isOpen={!processing}
                        title={pendingTexts.title}
                        description={pendingTexts.description}
                        onClose={() => setPendingAction(null)}
                        onConfirm={confirmAction}
                    />
                    <LoadingModal
                        isOpen={processing}
                        title={pendingTexts.loadingTitle}
                        description={LOADING_DESCRIPTION}
                    />
                </>
            )}
        </>
    );
}
