"use client";

import React, { useState } from "react";
import NextImage from "next/image";
import classNames from "classnames";
import { Button } from "../../atoms/Button";
import { Icon } from "../../atoms/Icon";
import { LabelChip } from "../../atoms/LabelChip";
import { Title } from "../../atoms/Title";
import { FormActions } from "../../molecules/FormActions";
import type { NewsFormFile } from "../NewsForm/types";
import { textToHtml } from "@/helpers/textHtml";
import { formatLongDate } from "@/helpers/formatLongDate";
import { useObjectUrl } from "./useObjectUrl";
import type { NewsPreviewProps } from "./types";
import styles from "./NewsPreview.module.scss";

interface PreviewMediaProps {
    media: NewsFormFile;
    placeholder: string;
    className?: string;
}

/**
 * Imagen o video de la vista previa. Los archivos nuevos se muestran con una URL temporal;
 * los guardados, con su URL. Si no hay fuente o no carga, se muestra el recuadro del diseño.
 */
const PreviewMedia: React.FC<PreviewMediaProps> = ({ media, placeholder, className }) => {
    const objectUrl = useObjectUrl(media.file);
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const src = objectUrl ?? media.url ?? null;
    const isVideo = media.mimeType.startsWith("video/") || /\.mp4$/i.test(media.name);

    if (!src || failedSrc === src) {
        return (
            <div className={classNames(styles.media, styles.mediaPlaceholder, className)}>
                <span>{placeholder}</span>
            </div>
        );
    }

    return (
        <div className={classNames(styles.media, className)}>
            {isVideo ? (
                <video className={styles.mediaContent} src={src} controls muted onError={() => setFailedSrc(src)} />
            ) : (
                <NextImage
                    className={styles.mediaContent}
                    src={src}
                    alt={media.name}
                    fill
                    unoptimized
                    onError={() => setFailedSrc(src)}
                />
            )}
        </div>
    );
};

/**
 * Componente NewsPreview - Muestra la noticia como se verá en el Portal
 * a partir de los valores del formulario (sin guardarla).
 */
const NewsPreview: React.FC<NewsPreviewProps> = ({
    values,
    categoryLabels,
    tagLabels,
    disabled = false,
    onBack,
    onPublish,
    className,
}) => {
    const fecha = formatLongDate(values.fechaPublicacion);
    const chips = [...categoryLabels, ...tagLabels];

    return (
        <div className={classNames(styles.NewsPreview, className)}>
            <Title variant="mid" tag="h1" className={styles.heading}>Vista previa</Title>

            <div className={styles.notice}>
                <LabelChip label="Vista previa" className={styles.noticeBadge} />
                <span>
                    Así se ve la noticia en el Portal: <strong>listado y detalle</strong> comparten este mismo
                    título, autor, fecha y secciones de contenido.
                </span>
            </div>

            <article className={styles.card}>
                {values.archivoPrincipal && (
                    <PreviewMedia
                        media={values.archivoPrincipal}
                        placeholder="Imagen o video principal"
                        className={styles.mainMedia}
                    />
                )}

                <div className={styles.titleRow}>
                    <h2 className={styles.title}>{values.titulo}</h2>
                    <span className={styles.titleLine} aria-hidden="true" />
                </div>

                <div className={styles.meta}>
                    <span className={styles.metaItem}>
                        <Icon name="user-regular" size={12} />
                        Por {values.autor}
                    </span>
                    {fecha && (
                        <span className={styles.metaItem}>
                            <Icon name="calendar-regular" size={12} />
                            {fecha}
                        </span>
                    )}
                    {values.tiempoLectura && (
                        <span className={styles.metaItem}>
                            <Icon name="clock-rotate-left-solid" size={12} />
                            {values.tiempoLectura} min de lectura
                        </span>
                    )}
                </div>

                {chips.length > 0 && (
                    <div className={styles.chips}>
                        {chips.map((chip, index) => (
                            <LabelChip key={`${chip}-${index}`} label={chip} className={styles.chip} />
                        ))}
                    </div>
                )}

                <hr className={styles.divider} />

                {values.secciones.map((section) => (
                    <section key={section.id} className={styles.section}>
                        <h3 className={styles.sectionHeading}>{section.encabezado}</h3>
                        {/* textToHtml escapa el texto: es el mismo HTML seguro que se guardará */}
                        <div
                            className={styles.sectionContent}
                            dangerouslySetInnerHTML={{ __html: textToHtml(section.contenido) }}
                        />
                        {section.imagen && (
                            <PreviewMedia
                                media={section.imagen}
                                placeholder="Imagen de esta sección"
                                className={styles.sectionMedia}
                            />
                        )}
                    </section>
                ))}

                {values.galeria.length > 0 && (
                    <section className={styles.section}>
                        <h3 className={styles.sectionHeading}>Galería y adjuntos</h3>
                        <div className={styles.gallery}>
                            {values.galeria.map((media) => (
                                <PreviewMedia
                                    key={media.id}
                                    media={media}
                                    placeholder={media.name}
                                    className={styles.galleryItem}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </article>

            <FormActions align="right" className={styles.actions}>
                <Button
                    type="button"
                    variant="outlined"
                    color="neutral-light"
                    rounded
                    onClick={onBack}
                    state={disabled ? "disabled" : "default"}
                >
                    Volver a editar
                </Button>
                <Button type="button" rounded onClick={onPublish} state={disabled ? "disabled" : "default"}>
                    Publicar
                </Button>
            </FormActions>
        </div>
    );
};

export default NewsPreview;
