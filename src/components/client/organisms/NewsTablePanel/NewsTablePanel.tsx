import React from "react";
import classNames from "classnames";
import { EstadoNoticia, EstadoNotificacion, type NoticiaListRow } from "@/api/graphql/COM03";
import { ToggleButton } from "../../atoms/ToggleButton";
import type { ToggleButtonOption } from "../../atoms/ToggleButton";
import { LabelChip } from "../../atoms/LabelChip";
import { Button } from "../../atoms/Button";
import { Icon } from "../../atoms/Icon";
import { Text } from "../../atoms/Text";
import { SearchField } from "../../molecules/SearchField";
import { TableRow } from "../../molecules/TableRow";
import type { TableCellConfig } from "../../molecules/TableRow/types";
import type { NewsFilter, NewsTablePanelProps } from "./types";
import styles from "./NewsTablePanel.module.scss";

const GRID = "minmax(0, 2.2fr) minmax(0, 1.1fr) minmax(0, 1.1fr) minmax(0, 1.5fr) minmax(0, 1fr) minmax(0, 1.8fr)";
const LOADING_GRID = "minmax(0, 1.2fr) minmax(0, 1.6fr) minmax(0, 1.2fr) minmax(0, 1.2fr) minmax(0, 1fr)";
const SKELETON_ROWS = 3;

const FILTER_OPTIONS: ToggleButtonOption[] = [
    { label: "Todas", value: "all" },
    { label: "Publicadas", value: EstadoNoticia.PUBLICADA },
    { label: "Borradores", value: EstadoNoticia.BORRADOR },
    { label: "Programadas", value: EstadoNoticia.PROGRAMADA },
    { label: "Archivadas", value: EstadoNoticia.ARCHIVADA },
];

const HEADER_CELLS: TableCellConfig[] = [
    { label: "Título" },
    { label: "Estado" },
    { label: "Notificación" },
    { label: "Autor" },
    { label: "Fecha" },
    { label: "Acciones" },
];

const LOADING_HEADER_CELLS: TableCellConfig[] = [
    { label: "Título" },
    { label: "Estado" },
    { label: "Autor" },
    { label: "Fecha" },
    { label: "Acción" },
];

const ESTADO_NOTICIA_LABEL: Record<EstadoNoticia, string> = {
    [EstadoNoticia.PROGRAMADA]: "Programada",
    [EstadoNoticia.PUBLICADA]: "Publicada",
    [EstadoNoticia.BORRADOR]: "Borrador",
    [EstadoNoticia.ARCHIVADA]: "Archivada",
};

const ESTADO_NOTIFICACION_LABEL: Record<EstadoNotificacion, string> = {
    [EstadoNotificacion.ENVIADO]: "Enviado",
    [EstadoNotificacion.PENDIENTE]: "Pendiente",
    [EstadoNotificacion.ERROR]: "Error",
};

const PILL_CLASS: Record<EstadoNoticia | EstadoNotificacion, string> = {
    [EstadoNoticia.PROGRAMADA]: styles["pill--warning"],
    [EstadoNoticia.PUBLICADA]: styles["pill--success"],
    [EstadoNoticia.BORRADOR]: styles["pill--neutral"],
    [EstadoNoticia.ARCHIVADA]: styles["pill--info"],
    [EstadoNotificacion.ENVIADO]: styles["pill--success"],
    [EstadoNotificacion.PENDIENTE]: styles["pill--warning"],
    [EstadoNotificacion.ERROR]: styles["pill--danger"],
};

const EMPTY_VALUE = "—";

const dateFormatter = new Intl.DateTimeFormat("es-GT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
});

function formatFecha(fecha: string | null): string {
    if (!fecha) return EMPTY_VALUE;
    const date = new Date(fecha);
    return Number.isNaN(date.getTime()) ? EMPTY_VALUE : dateFormatter.format(date);
}

/**
 * Componente NewsTablePanel - Listado de noticias con tabs, buscador,
 * estado de carga (skeleton) y estado vacío.
 */
const NewsTablePanel: React.FC<NewsTablePanelProps> = ({
    noticias,
    loading = false,
    notificationsLoading = false,
    isEmpty = false,
    filter,
    onFilterChange,
    search,
    onSearchChange,
    onCreate,
    onEdit,
    onArchive,
    onDelete,
    onRestore,
    className,
}) => {
    const renderNotification = (noticia: NoticiaListRow) => {
        if (notificationsLoading) {
            return <span className={classNames(styles.skeleton, styles["skeleton--short"])} aria-label="Cargando" />;
        }
        if (!noticia.estadoNotificacion) {
            return <span className={styles.muted}>{EMPTY_VALUE}</span>;
        }
        return (
            <LabelChip
                label={ESTADO_NOTIFICACION_LABEL[noticia.estadoNotificacion]}
                className={classNames(styles.pill, PILL_CLASS[noticia.estadoNotificacion])}
            />
        );
    };

    const renderActions = (noticia: NoticiaListRow) => {
        if (noticia.estado === EstadoNoticia.ARCHIVADA) {
            return (
                <Button rounded color="success" className={styles.actionButton} onClick={() => onRestore?.(noticia.id)}>
                    Restaurar
                </Button>
            );
        }

        const isDraft = noticia.estado === EstadoNoticia.BORRADOR;

        return (
            <>
                <Button
                    rounded
                    variant="outlined"
                    color="neutral-light"
                    className={styles.actionButton}
                    onClick={() => onEdit?.(noticia.id)}
                >
                    Editar
                </Button>
                {isDraft ? (
                    <Button rounded color="danger" className={styles.actionButton} onClick={() => onDelete?.(noticia.id)}>
                        Eliminar
                    </Button>
                ) : (
                    <Button rounded className={styles.actionButton} onClick={() => onArchive?.(noticia.id)}>
                        Archivar
                    </Button>
                )}
            </>
        );
    };

    const buildRowCells = (noticia: NoticiaListRow): TableCellConfig[] => [
        { content: <span className={styles.title}>{noticia.titulo}</span> },
        {
            content: (
                <LabelChip
                    label={ESTADO_NOTICIA_LABEL[noticia.estado]}
                    className={classNames(styles.pill, PILL_CLASS[noticia.estado])}
                />
            ),
        },
        { content: renderNotification(noticia) },
        { content: <span className={styles.text}>{noticia.autor}</span> },
        { content: <span className={styles.text}>{formatFecha(noticia.fecha)}</span> },
        { content: <div className={styles.actions}>{renderActions(noticia)}</div> },
    ];

    const renderBody = () => {
        if (loading) {
            return (
                <div className={styles.table}>
                    <TableRow isHeader gridTemplate={LOADING_GRID} cells={LOADING_HEADER_CELLS} className={styles.headerRow} />
                    {Array.from({ length: SKELETON_ROWS }, (_, index) => (
                        <TableRow
                            key={index}
                            gridTemplate={LOADING_GRID}
                            className={styles.row}
                            cells={[
                                { content: <span className={classNames(styles.skeleton, styles["skeleton--long"])} /> },
                                { content: <span className={classNames(styles.skeleton, styles["skeleton--short"])} /> },
                                { content: <span className={classNames(styles.skeleton, styles["skeleton--mid"])} /> },
                                { content: <span className={classNames(styles.skeleton, styles["skeleton--long"])} /> },
                                { content: <span className={classNames(styles.skeleton, styles["skeleton--action"])} /> },
                            ]}
                        />
                    ))}
                </div>
            );
        }

        if (isEmpty) {
            return (
                <div className={styles.emptyState}>
                    <Icon name="file-lines-regular" size={24} />
                    <Text variant="body" className={styles.emptyTitle}>Aún no hay noticias</Text>
                    <Text variant="caption" className={styles.emptyDescription}>
                        Crea la primera noticia para que aparezca en el Portal.
                    </Text>
                    <Button rounded onClick={onCreate}>
                        Crear noticia
                    </Button>
                </div>
            );
        }

        return (
            <div className={styles.table}>
                <TableRow isHeader gridTemplate={GRID} cells={HEADER_CELLS} className={styles.headerRow} />
                {noticias.length === 0 ? (
                    <div className={styles.noResults}>
                        <Text variant="caption">No hay noticias que coincidan con el filtro.</Text>
                    </div>
                ) : (
                    noticias.map((noticia) => (
                        <TableRow
                            key={noticia.id}
                            id={noticia.id}
                            gridTemplate={GRID}
                            cells={buildRowCells(noticia)}
                            className={styles.row}
                        />
                    ))
                )}
            </div>
        );
    };

    return (
        <div className={classNames(styles.NewsTablePanel, className)}>
            <div className={styles.toolbar}>
                <ToggleButton
                    variant="segmented"
                    options={FILTER_OPTIONS}
                    value={filter}
                    onChange={(value) => onFilterChange(value as NewsFilter)}
                    disabled={loading}
                />

                {!loading && !isEmpty && (
                    <SearchField
                        value={search}
                        placeholder="Buscar noticia"
                        onChange={onSearchChange}
                        onSearch={() => onSearchChange(search)}
                        className={styles.search}
                    />
                )}
            </div>

            {renderBody()}
        </div>
    );
};

export default NewsTablePanel;
