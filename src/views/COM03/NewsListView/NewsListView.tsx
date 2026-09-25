"use client";

import { useMemo, useRef, useState } from "react";
import {
    useArchivarNoticia,
    useEliminarNoticia,
    useGetEstadosNotificacion,
    useGetNoticias,
    useRestaurarNoticia,
} from "@/api/hooks";
import type { NoticiaListRow } from "@/api/graphql/COM03";
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
}

type ListAction = "archivar" | "eliminar" | "restaurar";

/**
 * Textos de las acciones de la lista. Archivar y Eliminar vienen del diseño.
 * Restaurar y todos los textos de carga no están en el diseño (siguen el estilo de "Programando tu noticia").
 */
const ACTION_TEXTS: Record<ListAction, {
    title: string;
    description: string;
    loadingTitle: string;
    error: string;
}> = {
    archivar: {
        title: "¿Archivar esta noticia?",
        description: "Dejará de mostrarse en el Portal.",
        loadingTitle: "Archivando la noticia",
        error: "No fue posible archivar la noticia. Intenta nuevamente.",
    },
    eliminar: {
        title: "¿Eliminar esta noticia?",
        description: "Esta acción no se puede deshacer.",
        loadingTitle: "Eliminando la noticia",
        error: "No fue posible eliminar la noticia. Intenta nuevamente.",
    },
    restaurar: {
        title: "¿Restaurar esta noticia?",
        description: "Volverá a borradores. Podrás editarla y publicarla de nuevo, o eliminarla.",
        loadingTitle: "Restaurando la noticia",
        error: "No fue posible restaurar la noticia. Intenta nuevamente.",
    },
};

const LOADING_DESCRIPTION = "Esto tomará unos segundos";

export default function NewsListView({ onCreate, onEdit }: NewsListViewProps) {
    const { data: noticias, loading, error, refetch } = useGetNoticias();
    const { archivarNoticia } = useArchivarNoticia();
    const { eliminarNoticia } = useEliminarNoticia();
    const { restaurarNoticia } = useRestaurarNoticia();
    // Acción en curso: primero se confirma y luego se procesa con el modal de carga.
    const [pendingAction, setPendingAction] = useState<{ type: ListAction; id: string } | null>(null);
    const [processing, setProcessing] = useState(false);
    const processingRef = useRef(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [filter, setFilter] = useState<NewsFilter>("all");
    const [search, setSearch] = useState("");

    // El estado de la push viene de VIVI, aparte del listado; si falla, el listado se sigue mostrando.
    const noticiaIds = useMemo(() => noticias.map((noticia) => noticia.id), [noticias]);
    const {
        data: estadosNotificacion,
        loading: loadingNotificaciones,
        error: notificacionesError,
    } = useGetEstadosNotificacion(noticiaIds);

    const rows: NoticiaListRow[] = useMemo(
        () => noticias.map((noticia) => ({
            ...noticia,
            estadoNotificacion: estadosNotificacion[noticia.id] ?? null,
        })),
        [noticias, estadosNotificacion]
    );

    const filteredNoticias = useMemo(() => {
        const term = search.trim().toLowerCase();
        return rows.filter((noticia) => {
            if (filter !== "all" && noticia.estado !== filter) return false;
            if (term && !noticia.titulo.toLowerCase().includes(term)) return false;
            return true;
        });
    }, [rows, filter, search]);

    const isEmpty = !loading && !error && noticias.length === 0;

    const openAction = (type: ListAction, id: string) => {
        setActionError(null);
        setPendingAction({ type, id });
    };

    const actionHandlers: Record<ListAction, (id: string) => Promise<unknown>> = {
        archivar: archivarNoticia,
        eliminar: eliminarNoticia,
        restaurar: restaurarNoticia,
    };

    const confirmAction = async () => {
        // processingRef bloquea el doble clic antes de que React vuelva a pintar.
        if (!pendingAction || processingRef.current) return;
        processingRef.current = true;
        // Se cierra la confirmación y se muestra el modal de carga mientras se procesa.
        setProcessing(true);
        try {
            await actionHandlers[pendingAction.type](pendingAction.id);
            // TODO [COM03-BACKEND]: con los datos dummy el listado no cambia al recargar;
            // con la API real se verá la noticia archivada, restaurada o sin el borrador eliminado.
            await refetch();
        } catch {
            setActionError(ACTION_TEXTS[pendingAction.type].error);
        } finally {
            processingRef.current = false;
            setProcessing(false);
            setPendingAction(null);
        }
    };

    const pendingTexts = pendingAction ? ACTION_TEXTS[pendingAction.type] : null;

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

            {notificacionesError && !loading && (
                <Text variant="caption" className={styles.warningText}>
                    No fue posible consultar el estado de las notificaciones push. Se muestran como &quot;—&quot;.
                </Text>
            )}

            {actionError && (
                <Text variant="caption" className={styles.errorText}>
                    {actionError}
                </Text>
            )}

            <NewsTablePanel
                noticias={filteredNoticias}
                loading={loading}
                notificationsLoading={loadingNotificaciones}
                isEmpty={isEmpty}
                filter={filter}
                onFilterChange={setFilter}
                search={search}
                onSearchChange={setSearch}
                onCreate={onCreate}
                onEdit={onEdit}
                onArchive={(id) => openAction("archivar", id)}
                onDelete={(id) => openAction("eliminar", id)}
                onRestore={(id) => openAction("restaurar", id)}
            />

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
