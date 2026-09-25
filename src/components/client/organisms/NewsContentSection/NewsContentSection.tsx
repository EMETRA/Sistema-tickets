"use client";

import React, { useState } from "react";
import classNames from "classnames";
import { Button } from "../../atoms/Button";
import { Input } from "../../atoms/Input";
import { TextArea } from "../../atoms/TextArea";
import { FormField } from "../../molecules/FormField";
import { FileDropzone } from "../../molecules/FileDropzone";
import { FileItem } from "../../molecules/FileItem";
import { fileDescription, filterAcceptedFiles } from "../NewsForm/utils";
import type { NewsContentSectionProps } from "./types";
import styles from "./NewsContentSection.module.scss";

/**
 * Componente NewsContentSection - Bloque editable de una sección de contenido
 * (encabezado, contenido, imagen opcional, reordenar y eliminar).
 */
const NewsContentSection: React.FC<NewsContentSectionProps> = ({
    index,
    section,
    errors = {},
    accept,
    canMoveUp,
    canMoveDown,
    canRemove,
    onChange,
    onImageChange,
    onMoveUp,
    onMoveDown,
    onRemove,
    className,
}) => {
    const [rejectedFiles, setRejectedFiles] = useState<string[]>([]);
    const headingId = `seccion-${section.id}-encabezado`;
    const contentId = `seccion-${section.id}-contenido`;

    const handleFiles = (files: File[]) => {
        const { accepted, rejected } = filterAcceptedFiles(files, accept);
        setRejectedFiles(rejected);
        if (accepted.length > 0) onImageChange(accepted[0]);
    };

    return (
        <div className={classNames(styles.NewsContentSection, className)}>
            <div className={styles.header}>
                <span className={styles.label}>Sección {index + 1}</span>

                <div className={styles.controls}>
                    <Button
                        type="button"
                        variant="outlined"
                        color="neutral-light"
                        className={styles.moveButton}
                        onClick={onMoveUp}
                        state={canMoveUp ? "default" : "disabled"}
                        aria-label={`Subir sección ${index + 1}`}
                    >
                        ↑
                    </Button>
                    <Button
                        type="button"
                        variant="outlined"
                        color="neutral-light"
                        className={styles.moveButton}
                        onClick={onMoveDown}
                        state={canMoveDown ? "default" : "disabled"}
                        aria-label={`Bajar sección ${index + 1}`}
                    >
                        ↓
                    </Button>
                    <Button
                        type="button"
                        variant="outlined"
                        color="danger"
                        className={styles.removeButton}
                        onClick={onRemove}
                        state={canRemove ? "default" : "disabled"}
                    >
                        Eliminar
                    </Button>
                </div>
            </div>

            <FormField label="Encabezado" htmlFor={headingId} required>
                <Input
                    id={headingId}
                    value={section.encabezado}
                    onChange={(e) => onChange("encabezado", e.target.value)}
                    state={errors.encabezado ? "error" : "default"}
                    errorMessage={errors.encabezado}
                    aria-invalid={Boolean(errors.encabezado)}
                />
            </FormField>

            <FormField label="Contenido" htmlFor={contentId} required>
                <TextArea
                    id={contentId}
                    rows={4}
                    value={section.contenido}
                    onChange={(e) => onChange("contenido", e.target.value)}
                    state={errors.contenido ? "error" : "default"}
                    errorMessage={errors.contenido}
                    aria-invalid={Boolean(errors.contenido)}
                />
            </FormField>

            {section.imagen ? (
                <FileItem
                    name={section.imagen.name}
                    status={section.imagen.file ? "ready" : "done"}
                    description={fileDescription(section.imagen)}
                    onRemove={() => onImageChange(null)}
                />
            ) : (
                <FileDropzone
                    variant="compact"
                    multiple={false}
                    accept={accept}
                    title="Imagen de esta sección (opcional)"
                    subtitle="Puedes dejarla vacía."
                    onFiles={handleFiles}
                    rejectedFiles={rejectedFiles}
                />
            )}
        </div>
    );
};

export default NewsContentSection;
