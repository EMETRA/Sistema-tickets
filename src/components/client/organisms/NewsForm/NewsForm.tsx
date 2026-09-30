"use client";

import React, { useMemo, useRef, useState } from "react";
import classNames from "classnames";
import { Button } from "../../atoms/Button";
import { IconButton } from "../../atoms/IconButton";
import { Input } from "../../atoms/Input";
import { TextArea } from "../../atoms/TextArea";
import { Select } from "../../atoms/Select";
import { LabelChip } from "../../atoms/LabelChip";
import { Title } from "../../atoms/Title";
import { Text } from "../../atoms/Text";
import { FormField } from "../../molecules/FormField";
import { FormActions } from "../../molecules/FormActions";
import { FileDropzone } from "../../molecules/FileDropzone";
import { FileItem } from "../../molecules/FileItem";
import { LabelChipGroup } from "../../molecules/LabelChipGroup";
import { YouTubeLinkField } from "../../molecules/YouTubeLinkField";
import { NewsContentSection } from "../NewsContentSection";
import { apiDateToDdMmYyyy, ddMmYyyyToIsoDate, maskDateInput } from "@/helpers/dateInput";
import {
    fileDescription,
    filterAcceptedFiles,
    fitFilesInLimit,
    newImagesBytes,
    sizeLimitMessage,
} from "./utils";
import { mediaThumbnail } from "./mediaThumbnail";
import type { NewsFormProps, NewsSectionField } from "./types";
import styles from "./NewsForm.module.scss";

interface CalendarPickerButtonProps {
    /** Fecha actual del campo, dd/mm/aaaa */
    value: string;
    disabled: boolean;
    /** Fecha elegida, dd/mm/aaaa */
    onPick: (fecha: string) => void;
}

/**
 * Botón de calendario para el campo de fecha. Abre el selector nativo del navegador sobre un
 * input type="date" oculto (su valor siempre es YYYY-MM-DD) y devuelve la fecha en dd/mm/aaaa.
 */
function CalendarPickerButton({ value, disabled, onPick }: CalendarPickerButtonProps) {
    const pickerRef = useRef<HTMLInputElement>(null);

    const openPicker = () => {
        const picker = pickerRef.current;
        if (!picker) return;
        try {
            picker.showPicker();
        } catch {
            // Navegadores sin showPicker: se intenta abrir con foco y clic.
            picker.focus();
            picker.click();
        }
    };

    return (
        <>
            <IconButton
                icon="calendar-regular"
                size={18}
                // Color explícito (mismo del texto del Input): sin él, el ícono toma el color del
                // botón y en modo oscuro (color-scheme: dark en globals.css) sale blanco.
                iconColor="#262626"
                borderless
                disabled={disabled}
                onClick={openPicker}
                aria-label="Elegir fecha en el calendario"
            />
            <input
                ref={pickerRef}
                type="date"
                tabIndex={-1}
                aria-hidden="true"
                className={styles.hiddenDatePicker}
                value={ddMmYyyyToIsoDate(value) ?? ""}
                onChange={(e) => {
                    if (e.target.value) onPick(apiDateToDdMmYyyy(e.target.value));
                }}
            />
        </>
    );
}

/**
 * Componente NewsForm - Formulario de creación / edición de noticias.
 * Solo presenta los datos: el estado y la validación viven en la vista (useNewsForm).
 */
const NewsForm: React.FC<NewsFormProps> = ({
    heading,
    values,
    errors,
    options,
    accept,
    disabled = false,
    onTitleChange,
    onSlugChange,
    onFieldChange,
    onTagsChange,
    onMainFileChange,
    onAddSection,
    onSectionChange,
    onSectionImageChange,
    onMoveSection,
    onRemoveSection,
    onAddGalleryFiles,
    onRemoveGalleryFile,
    onMainVideoAdd,
    onSectionVideoAdd,
    onAddGalleryVideo,
    onCancel,
    onSaveDraft,
    onPreview,
    onPublish,
    className,
}) => {
    const [rejectedMain, setRejectedMain] = useState<string[]>([]);
    const [rejectedGallery, setRejectedGallery] = useState<string[]>([]);
    // Imágenes que no se agregaron por superar el límite total (accept.maxTotalBytes)
    const [sizeErrorMain, setSizeErrorMain] = useState<string | null>(null);
    const [sizeErrorGallery, setSizeErrorGallery] = useState<string | null>(null);

    // Props de error de un campo. aria-invalid también permite ubicar el primer error para hacer scroll.
    const errorProps = (path: string) => ({
        state: errors[path] ? ("error" as const) : ("default" as const),
        errorMessage: errors[path],
        "aria-invalid": Boolean(errors[path]),
    });

    const sectionErrors = (index: number): Partial<Record<NewsSectionField, string>> => ({
        encabezado: errors[`secciones.${index}.encabezado`],
        contenido: errors[`secciones.${index}.contenido`],
    });

    // Etiquetas seleccionadas, en el orden en que se agregaron
    const selectedTags = useMemo(
        () => values.etiquetaIds
            .map((id) => options.etiquetas.find((option) => option.value === id))
            .filter((option): option is NonNullable<typeof option> => Boolean(option)),
        [values.etiquetaIds, options.etiquetas]
    );

    const handleMainFiles = (files: File[]) => {
        const { accepted, rejected } = filterAcceptedFiles(files, accept.principal);
        setRejectedMain(rejected);
        // La imagen principal reemplaza a la anterior: la anterior no cuenta para el límite.
        const used = newImagesBytes(values, values.archivoPrincipal);
        const { fitting, tooLarge } = fitFilesInLimit(accepted.slice(0, 1), used, accept.maxTotalBytes);
        setSizeErrorMain(tooLarge.length > 0 && accept.maxTotalBytes
            ? sizeLimitMessage(tooLarge, used, accept.maxTotalBytes)
            : null);
        if (fitting.length > 0) onMainFileChange(fitting[0]);
    };

    const handleGalleryFiles = (files: File[]) => {
        const { accepted, rejected } = filterAcceptedFiles(files, accept.galeria);
        setRejectedGallery(rejected);
        const used = newImagesBytes(values);
        const { fitting, tooLarge } = fitFilesInLimit(accepted, used, accept.maxTotalBytes);
        const usedAfter = used + fitting.reduce((total, file) => total + file.size, 0);
        setSizeErrorGallery(tooLarge.length > 0 && accept.maxTotalBytes
            ? sizeLimitMessage(tooLarge, usedAfter, accept.maxTotalBytes)
            : null);
        if (fitting.length > 0) onAddGalleryFiles(fitting);
    };

    /** Bytes que puede usar la imagen de una sección (su imagen actual no cuenta: se reemplaza). */
    const sectionImageLimit = (index: number) => {
        if (accept.maxTotalBytes === undefined) return undefined;
        const used = newImagesBytes(values, values.secciones[index]?.imagen);
        return { usedBytes: used, maxBytes: accept.maxTotalBytes };
    };

    return (
        <div className={classNames(styles.NewsForm, className)}>
            <div className={styles.pageHeader}>
                <Title variant="mid" tag="h1" className={styles.heading}>{heading}</Title>
                <Text variant="caption" className={styles.hint}>
                    Los campos con * son obligatorios. Los marcados como automáticos no se editan aquí.
                </Text>
            </div>

            {/* ============ Información general ============ */}
            <section className={styles.card}>
                <h2 className={styles.cardTitle}>Información general</h2>

                <FormField label="Título" htmlFor="noticia-titulo" required>
                    <Input
                        id="noticia-titulo"
                        value={values.titulo}
                        onChange={(e) => onTitleChange(e.target.value)}
                        {...errorProps("titulo")}
                    />
                </FormField>

                <FormField label="Resumen" htmlFor="noticia-resumen" required>
                    <TextArea
                        id="noticia-resumen"
                        rows={2}
                        value={values.resumen}
                        onChange={(e) => onFieldChange("resumen", e.target.value)}
                        {...errorProps("resumen")}
                    />
                </FormField>

                <FormField label="Autor" htmlFor="noticia-autor" required>
                    <Input
                        id="noticia-autor"
                        value={values.autor}
                        onChange={(e) => onFieldChange("autor", e.target.value)}
                        {...errorProps("autor")}
                    />
                </FormField>

                <div className={styles.row}>
                    <FormField label="Categoría" htmlFor="noticia-categoria" required>
                        <Select
                            id="noticia-categoria"
                            placeholder="Selecciona una categoría"
                            options={options.categorias}
                            value={values.categoriaId}
                            onChange={(e) => onFieldChange("categoriaId", e.target.value)}
                            {...errorProps("categoriaId")}
                        />
                    </FormField>

                    <FormField label="Subcategoría" htmlFor="noticia-subcategoria">
                        <Select
                            id="noticia-subcategoria"
                            options={options.subcategorias}
                            value={values.subcategoriaId}
                            onChange={(e) => onFieldChange("subcategoriaId", e.target.value)}
                            state={options.subcategorias.length <= 1 ? "disabled" : "default"}
                        />
                    </FormField>
                </div>

                <div className={styles.tagsField}>
                    <span className={styles.fieldLabel}>Etiquetas</span>
                    <LabelChipGroup
                        editable
                        labels={selectedTags}
                        availableOptions={options.etiquetas}
                        onChange={(labels) => onTagsChange(labels.map((label) => label.value))}
                    />
                </div>

                <div className={styles.row}>
                    <FormField label="Idioma" htmlFor="noticia-idioma" required>
                        <Select
                            id="noticia-idioma"
                            placeholder="Selecciona un idioma"
                            options={options.idiomas}
                            value={values.idioma}
                            onChange={(e) => onFieldChange("idioma", e.target.value)}
                            {...errorProps("idioma")}
                        />
                    </FormField>

                    <FormField label="Visibilidad" htmlFor="noticia-visibilidad" required>
                        <Select
                            id="noticia-visibilidad"
                            placeholder="Selecciona la visibilidad"
                            options={options.visibilidades}
                            value={values.visibilidad}
                            onChange={(e) => onFieldChange("visibilidad", e.target.value)}
                            {...errorProps("visibilidad")}
                        />
                    </FormField>
                </div>

                <div className={styles.row}>
                    <FormField label="Fecha de publicación" htmlFor="noticia-fecha" required>
                        {/* Se escribe dd/mm/aaaa (no type="date": su formato depende del navegador)
                            o se elige en el calendario del botón. */}
                        <Input
                            id="noticia-fecha"
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            placeholder="dd/mm/aaaa"
                            maxLength={10}
                            value={values.fechaPublicacion}
                            onChange={(e) => onFieldChange("fechaPublicacion", maskDateInput(e.target.value))}
                            icon={
                                <CalendarPickerButton
                                    value={values.fechaPublicacion}
                                    disabled={disabled}
                                    onPick={(fecha) => onFieldChange("fechaPublicacion", fecha)}
                                />
                            }
                            {...errorProps("fechaPublicacion")}
                        />
                    </FormField>

                    <FormField label="URL (slug)" htmlFor="noticia-slug" required>
                        <Input
                            id="noticia-slug"
                            value={values.slug}
                            onChange={(e) => onSlugChange(e.target.value)}
                            {...errorProps("slug")}
                        />
                        <span className={styles.helper}>
                            Sugerido a partir del título. Puedes editarlo; el valor que quede aquí es el que se guarda.
                        </span>
                    </FormField>
                </div>

                <div className={styles.row}>
                    <FormField label="Tiempo de lectura (minutos)" htmlFor="noticia-tiempo">
                        <Input
                            id="noticia-tiempo"
                            type="number"
                            min={1}
                            placeholder="Ej. 4"
                            value={values.tiempoLectura}
                            onChange={(e) => onFieldChange("tiempoLectura", e.target.value)}
                            {...errorProps("tiempoLectura")}
                        />
                        <span className={styles.helper}>Puede dejarse vacío.</span>
                    </FormField>
                </div>
            </section>

            {/* ============ Imagen o video principal ============ */}
            <section className={styles.card}>
                <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Imagen o video principal</h2>
                    <LabelChip label="Único, obligatorio" className={styles.badge} />
                </div>

                {values.archivoPrincipal ? (
                    <FileItem
                        name={values.archivoPrincipal.name}
                        status={values.archivoPrincipal.file ? "ready" : "done"}
                        description={fileDescription(values.archivoPrincipal)}
                        thumbnail={mediaThumbnail(values.archivoPrincipal)}
                        onRemove={() => onMainFileChange(null)}
                    />
                ) : (
                    <div className={styles.mediaPicker}>
                        <FileDropzone
                            variant="compact"
                            multiple={false}
                            accept={accept.principal}
                            title="Arrastra la imagen principal aquí"
                            subtitle="Se usa como portada en el listado y en el detalle. Obligatorio."
                            onFiles={handleMainFiles}
                            rejectedFiles={rejectedMain}
                            hasError={Boolean(errors.archivoPrincipal)}
                        />
                        {sizeErrorMain && <span className={styles.error} role="alert">{sizeErrorMain}</span>}
                        {onMainVideoAdd && (
                            <YouTubeLinkField
                                id="noticia-principal-video"
                                disabled={disabled}
                                onAdd={onMainVideoAdd}
                            />
                        )}
                    </div>
                )}
                {errors.archivoPrincipal && (
                    <span className={styles.error} data-error="true">{errors.archivoPrincipal}</span>
                )}
            </section>

            {/* ============ Contenido ============ */}
            <section className={styles.card}>
                <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Contenido</h2>
                    <LabelChip label="Varias secciones" className={styles.badge} />
                </div>

                <div className={styles.sections}>
                    {values.secciones.map((section, index) => (
                        <NewsContentSection
                            key={section.id}
                            index={index}
                            section={section}
                            errors={sectionErrors(index)}
                            accept={accept.seccion}
                            canMoveUp={index > 0}
                            canMoveDown={index < values.secciones.length - 1}
                            canRemove={values.secciones.length > 1}
                            onChange={(field, value) => onSectionChange(section.id, field, value)}
                            onImageChange={(file) => onSectionImageChange(section.id, file)}
                            imageLimit={sectionImageLimit(index)}
                            onVideoAdd={onSectionVideoAdd
                                ? (url, youtubeId) => onSectionVideoAdd(section.id, url, youtubeId)
                                : undefined}
                            onMoveUp={() => onMoveSection(section.id, "up")}
                            onMoveDown={() => onMoveSection(section.id, "down")}
                            onRemove={() => onRemoveSection(section.id)}
                        />
                    ))}
                </div>
                {errors.secciones && <span className={styles.error} data-error="true">{errors.secciones}</span>}

                <div className={styles.addSection}>
                    <Button type="button" variant="outlined" rounded onClick={onAddSection} className={styles.addSectionButton}>
                        + Agregar sección
                    </Button>
                </div>
            </section>

            {/* ============ Galería y adjuntos ============ */}
            <section className={styles.card}>
                <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Galería y adjuntos</h2>
                    <LabelChip label="Varios, opcional" className={styles.badge} />
                </div>

                <div className={styles.mediaPicker}>
                    <FileDropzone
                        variant="compact"
                        accept={accept.galeria}
                        title="Arrastra imágenes adicionales aquí"
                        subtitle={`Opcional. ${accept.formatsLabel}`}
                        onFiles={handleGalleryFiles}
                        rejectedFiles={rejectedGallery}
                    />
                    {sizeErrorGallery && <span className={styles.error} role="alert">{sizeErrorGallery}</span>}
                    {onAddGalleryVideo && (
                        <YouTubeLinkField
                            id="noticia-galeria-video"
                            label="¿Quieres agregar un video? Pega el enlace de YouTube"
                            disabled={disabled}
                            onAdd={onAddGalleryVideo}
                        />
                    )}
                </div>

                {values.galeria.length > 0 && (
                    <div className={styles.fileList}>
                        {values.galeria.map((file) => (
                            <FileItem
                                key={file.id}
                                name={file.name}
                                status={file.file ? "ready" : "done"}
                                description={fileDescription(file)}
                                thumbnail={mediaThumbnail(file)}
                                onRemove={() => onRemoveGalleryFile(file.id)}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* ============ Acciones ============ */}
            <FormActions align="space-between" className={styles.actions}>
                <Button type="button" variant="outlined" color="neutral-light" rounded onClick={onCancel} state={disabled ? "disabled" : "default"}>
                    Cancelar
                </Button>

                <div className={styles.actionsRight}>
                    <Button type="button" variant="outlined" color="neutral-light" rounded onClick={onSaveDraft} state={disabled ? "disabled" : "default"}>
                        Guardar borrador
                    </Button>
                    <Button type="button" rounded onClick={onPreview} className={styles.previewButton} state={disabled ? "disabled" : "default"}>
                        Vista previa
                    </Button>
                    <Button type="button" rounded onClick={onPublish} state={disabled ? "disabled" : "default"}>
                        Publicar
                    </Button>
                </div>
            </FormActions>
        </div>
    );
};

export default NewsForm;
