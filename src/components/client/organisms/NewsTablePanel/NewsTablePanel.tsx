import React from "react";
import classNames from "classnames";
import {
  EstadoNoticia,
  EstadoNotificacion,
  type NoticiaListRow,
} from "@/api/graphql/COM03";
import { ToggleButton } from "../../atoms/ToggleButton";
import type { ToggleButtonOption } from "../../atoms/ToggleButton";
import { LabelChip } from "../../atoms/LabelChip";
import { Button } from "../../atoms/Button";
import { Icon } from "../../atoms/Icon";
import { SearchField } from "../../molecules/SearchField";
import type { NewsFilter, NewsTablePanelProps } from "./types";
import styles from "./NewsTablePanel.module.scss";

type ColumnKey =
  | "titulo"
  | "estado"
  | "notificacion"
  | "autor"
  | "fecha"
  | "acciones";

/** Columnas de la tabla, en orden. Notificación y Acciones se pueden ocultar por props. */
const COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "titulo", label: "Título" },
  { key: "estado", label: "Estado" },
  { key: "notificacion", label: "Notificación" },
  { key: "autor", label: "Autor" },
  { key: "fecha", label: "Fecha" },
  { key: "acciones", label: "Acciones" },
];
const FILTER_OPTIONS: ToggleButtonOption[] = [
  { label: "Todas", value: "all" },
  { label: "Publicadas", value: EstadoNoticia.PUBLICADA },
  { label: "Borradores", value: EstadoNoticia.BORRADOR },
  { label: "Programadas", value: EstadoNoticia.PROGRAMADA },
  { label: "Archivadas", value: EstadoNoticia.ARCHIVADA },
];

const ESTADO_NOTICIA_LABEL: Record<EstadoNoticia, string> = {
  [EstadoNoticia.PROGRAMADA]: "Programada",
  [EstadoNoticia.PUBLICADA]: "Publicada",
  [EstadoNoticia.BORRADOR]: "Borrador",
  [EstadoNoticia.ARCHIVADA]: "Archivada",
};

const ESTADO_NOTIFICACION_LABEL: Record<EstadoNotificacion, string> = {
  [EstadoNotificacion.ENVIADO]: "Enviada al proveedor",
  [EstadoNotificacion.PENDIENTE]: "Pendiente",
  [EstadoNotificacion.ERROR]: "Error",
  [EstadoNotificacion.PARCIAL]: "Envío parcial",
  [EstadoNotificacion.INCIERTA]: "Envío incierto",
  [EstadoNotificacion.SIN_DESTINATARIOS]: "Sin dispositivos",
  [EstadoNotificacion.SIN_PUBLICACION]: "Sin publicación",
  [EstadoNotificacion.NO_DISPONIBLE]: "Sin dato disponible",
};

const PILL_CLASS: Record<EstadoNoticia | EstadoNotificacion, string> = {
  [EstadoNoticia.PROGRAMADA]: styles["pill--warning"],
  [EstadoNoticia.PUBLICADA]: styles["pill--success"],
  [EstadoNoticia.BORRADOR]: styles["pill--neutral"],
  [EstadoNoticia.ARCHIVADA]: styles["pill--info"],
  [EstadoNotificacion.ENVIADO]: styles["pill--success"],
  [EstadoNotificacion.PENDIENTE]: styles["pill--warning"],
  [EstadoNotificacion.ERROR]: styles["pill--danger"],
  [EstadoNotificacion.PARCIAL]: styles["pill--warning"],
  [EstadoNotificacion.INCIERTA]: styles["pill--warning"],
  [EstadoNotificacion.SIN_DESTINATARIOS]: styles["pill--neutral"],
  [EstadoNotificacion.SIN_PUBLICACION]: styles["pill--neutral"],
  [EstadoNotificacion.NO_DISPONIBLE]: styles["pill--neutral"],
};

const EMPTY_VALUE = "—";

const dateFormatter = new Intl.DateTimeFormat("es-GT", {
  timeZone: "America/Guatemala",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatFecha(fecha: string | null): string {
  if (!fecha) return EMPTY_VALUE;
  const date = new Date(fecha);
  return Number.isNaN(date.getTime())
    ? EMPTY_VALUE
    : dateFormatter.format(date);
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
  onEdit,
  onArchive,
  onRestore,
  showNotifications = true,
  canEdit = true,
  errorMessage,
  onRetry,
  className,
}) => {
  const renderNotification = (noticia: NoticiaListRow) => {
    if (notificationsLoading) {
      return (
        <span
          className={classNames(styles.skeleton, styles["skeleton--short"])}
          aria-label="Cargando"
        />
      );
    }
    if (!noticia.estadoNotificacion) {
      return <span className={styles.muted}>{EMPTY_VALUE}</span>;
    }
    return (
      <LabelChip
        label={ESTADO_NOTIFICACION_LABEL[noticia.estadoNotificacion]}
        className={classNames(
          styles.pill,
          PILL_CLASS[noticia.estadoNotificacion],
        )}
      />
    );
  };

  const renderActions = (noticia: NoticiaListRow) => {
    if (noticia.estado === EstadoNoticia.ARCHIVADA) {
      return (
        <Button
          rounded
          color="success"
          className={styles.actionButton}
          onClick={() => onRestore?.(noticia.id)}
        >
          Restaurar
        </Button>
      );
    }

    // No hay borrado (README "Noticias CMS" sección 3): todas, incluidos los borradores, se archivan.
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
        <Button
          rounded
          className={styles.actionButton}
          onClick={() => onArchive?.(noticia.id)}
        >
          Archivar
        </Button>
      </>
    );
  };

  const visibleColumns = COLUMNS.filter(
    (column) =>
      (column.key !== "notificacion" || showNotifications) &&
      (column.key !== "acciones" || canEdit),
  );

  const renderCell = (key: ColumnKey, noticia: NoticiaListRow) => {
    switch (key) {
      case "titulo":
        return <span className={styles.title}>{noticia.titulo}</span>;
      case "estado":
        return (
          <LabelChip
            label={ESTADO_NOTICIA_LABEL[noticia.estado]}
            className={classNames(styles.pill, PILL_CLASS[noticia.estado])}
          />
        );
      case "notificacion":
        return renderNotification(noticia);
      case "autor":
        return <span className={styles.text}>{noticia.autor}</span>;
      case "fecha":
        return (
          <span className={styles.text}>{formatFecha(noticia.fecha)}</span>
        );
      case "acciones":
        return <div className={styles.actions}>{renderActions(noticia)}</div>;
    }
  };

  const renderBody = () => {
    if (errorMessage)
      return (
        <div className={styles.errorState} role="alert">
          <h2>No fue posible cargar las noticias</h2>
          <p>{errorMessage}</p>
          <Button variant="outlined" onClick={onRetry}>
            Reintentar noticias
          </Button>
        </div>
      );
    if (loading)
      return (
        <div
          className={styles.loadingState}
          role="status"
          aria-label="Cargando noticias"
        >
          {[1, 2, 3].map((n) => (
            <span key={n} className={styles.skeleton} />
          ))}
        </div>
      );
    if (!noticias.length)
      return (
        <div className={styles.emptyState}>
          <Icon name="file-lines-regular" size={24} />
          <h2>
            {isEmpty
              ? "Aún no hay noticias"
              : "No hay noticias que coincidan con el filtro."}
          </h2>
          <p>
            {isEmpty
              ? "Las noticias que registres aparecerán en este listado."
              : "Prueba con otro título o restablece los filtros."}
          </p>
          {!isEmpty && (
            <Button
              variant="outlined"
              onClick={() => {
                onFilterChange("all");
                onSearchChange("");
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      );
    return (
      <div
        className={styles.tableScroll}
        role="region"
        aria-label="Listado de noticias"
        tabIndex={0}
      >
        <table className={styles.table}>
          <caption>Noticias del filtro seleccionado</caption>
          <thead>
            <tr>
              {visibleColumns.map((c) => (
                <th key={c.key} scope="col">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {noticias.map((n) => (
              <tr key={n.id}>
                {visibleColumns.map((c) => (
                  <td key={c.key} data-column={c.key}>
                    {renderCell(c.key, n)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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

        <SearchField
          value={search}
          placeholder="Buscar noticia"
          onChange={onSearchChange}
          onSearch={() => onSearchChange(search)}
          className={styles.search}
        />
      </div>

      {renderBody()}
    </div>
  );
};

export default NewsTablePanel;
