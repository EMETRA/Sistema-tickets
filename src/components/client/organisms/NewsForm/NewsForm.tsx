"use client";

import React, { useMemo, useState } from "react";
import classNames from "classnames";
import { Button } from "../../atoms/Button";
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
import { NewsContentSection } from "../NewsContentSection";
import { fileDescription, filterAcceptedFiles } from "./utils";
import type { NewsFormProps, NewsSectionField } from "./types";
import styles from "./NewsForm.module.scss";

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
    onCancel,
    onSaveDraft,
    onPreview,
    onPublish,
    className,
}) => {
    const [rejectedMain, setRejectedMain] = useState<string[]>([]);
    const [rejectedGallery, setRejectedGallery] = useState<string[]>([]);

    const fieldState = (path: string) => (errors[path] ? "error" : "default");

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
        if (accepted.length > 0) onMainFileChange(accepted[0]);
    };

    const handleGalleryFiles = (files: File[]) => {
        const { accepted, rejected } = filterAcceptedFiles(files, accept.galeria);
        setRejectedGallery(rejected);
        if (accepted.length > 0) onAddGalleryFiles(accepted);
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
                        state={fieldState("titulo")}
                        errorMessage={errors.titulo}
                    />
                </FormField>

                <FormField label="Resumen" htmlFor="noticia-resumen" required>
                    <TextArea
                        id="noticia-resumen"
                        rows={2}
                        value={values.resumen}
                        onChange={(e) => onFieldChange("resumen", e.target.value)}
                        state={fieldState("resumen")}
                        errorMessage={errors.resumen}
                    />
                </FormField>

                <FormField label="Autor" htmlFor="noticia-autor" required>
                    <Input
                        id="noticia-autor"
                        value={values.autor}
                        onChange={(e) => onFieldChange("autor", e.target.value)}
                        state={fieldState("autor")}
                        errorMessage={errors.autor}
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
                            state={fieldState("categoriaId")}
                            errorMessage={errors.categoriaId}
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
                            state={fieldState("idioma")}
                            errorMessage={errors.idioma}
                        />
                    </FormField>

                    <FormField label="Visibilidad" htmlFor="noticia-visibilidad" required>
                        <Select
                            id="noticia-visibilidad"
                            placeholder="Selecciona la visibilidad"
                            options={options.visibilidades}
                            value={values.visibilidad}
                            onChange={(e) => onFieldChange("visibilidad", e.target.value)}
                            state={fieldState("visibilidad")}
                            errorMessage={errors.visibilidad}
                        />
                    </FormField>
                </div>

                <div className={styles.row}>
                    <FormField label="Fecha de publicación" htmlFor="noticia-fecha" required>
                        <Input
                            id="noticia-fecha"
                            type="date"
                            value={values.fechaPublicacion}
                            onChange={(e) => onFieldChange("fechaPublicacion", e.target.value)}
                            state={fieldState("fechaPublicacion")}
                            errorMessage={errors.fechaPublicacion}
                        />
                    </FormField>

                    <FormField label="URL (slug)" htmlFor="noticia-slug" required>
                        <Input
                            id="noticia-slug"
                            value={values.slug}
                            onChange={(e) => onSlugChange(e.target.value)}
                            state={fieldState("slug")}
                            errorMessage={errors.slug}
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
                            state={fieldState("tiempoLectura")}
                            errorMessage={errors.tiempoLectura}
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
                        onRemove={() => onMainFileChange(null)}
                    />
                ) : (
                    <FileDropzone
                        variant="compact"
                        multiple={false}
                        accept={accept.principal}
                        title="Arrastra la imagen o video principal aquí"
                        subtitle="Se usa como portada en el listado y en el detalle. Obligatorio."
                        onFiles={handleMainFiles}
                        rejectedFiles={rejectedMain}
                        hasError={Boolean(errors.archivoPrincipal)}
                    />
                )}
                {errors.archivoPrincipal && (
                    <span className={styles.error}>{errors.archivoPrincipal}</span>
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
                            onMoveUp={() => onMoveSection(section.id, "up")}
                            onMoveDown={() => onMoveSection(section.id, "down")}
                            onRemove={() => onRemoveSection(section.id)}
                        />
                    ))}
                </div>
                {errors.secciones && <span className={styles.error}>{errors.secciones}</span>}

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

                <FileDropzone
                    variant="compact"
                    accept={accept.galeria}
                    title="Arrastra imágenes o videos adicionales aquí"
                    subtitle={`Opcional. ${accept.formatsLabel}`}
                    onFiles={handleGalleryFiles}
                    rejectedFiles={rejectedGallery}
                />

                {values.galeria.length > 0 && (
                    <div className={styles.fileList}>
                        {values.galeria.map((file) => (
                            <FileItem
                                key={file.id}
                                name={file.name}
                                status={file.file ? "ready" : "done"}
                                description={fileDescription(file)}
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
