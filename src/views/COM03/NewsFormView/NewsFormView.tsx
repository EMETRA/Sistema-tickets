"use client";

import { useMemo } from "react";
import { useGetCategoriasNoticia, useGetEtiquetasNoticia, useGetNoticia } from "@/api/hooks";
import type { CategoriaNoticia, EtiquetaNoticia, NoticiaDetalle } from "@/api/graphql/COM03";
import { Button } from "@/components/client/atoms/Button";
import { Text } from "@/components/client/atoms/Text";
import { NewsForm, type NewsFormOptions } from "@/components/client/organisms/NewsForm";
import {
    IDIOMA_OPTIONS,
    NEWS_FORM_ACCEPT,
    SIN_SUBCATEGORIA_OPTION,
    TAG_CHIP_COLORS,
    VISIBILIDAD_OPTIONS,
} from "../constants";
import { useNewsForm } from "../hooks/useNewsForm";
import styles from "./NewsFormView.module.scss";

interface NewsFormViewProps {
    /** null = crear; con valor = editar */
    noticiaId: string | null;
    onBack: () => void;
}

/**
 * Pantalla del formulario. Espera el detalle (en edición) y los catálogos antes de montar
 * el formulario, porque useNewsForm solo lee los valores iniciales al montarse.
 */
export default function NewsFormView({ noticiaId, onBack }: NewsFormViewProps) {
    const { data: noticia, loading: loadingNoticia, error: noticiaError } = useGetNoticia(noticiaId);
    const { data: categorias, loading: loadingCategorias, error: categoriasError } = useGetCategoriasNoticia();
    const { data: etiquetas, loading: loadingEtiquetas, error: etiquetasError } = useGetEtiquetasNoticia();

    const loading = loadingCategorias || loadingEtiquetas || (Boolean(noticiaId) && loadingNoticia);
    const hasError = Boolean(categoriasError || etiquetasError || (noticiaId && (noticiaError || !noticia)));

    if (loading) {
        return (
            <Text variant="caption" className={styles.status}>
                {noticiaId ? "Cargando noticia..." : "Cargando formulario..."}
            </Text>
        );
    }

    if (hasError) {
        return (
            <div className={styles.statusBlock}>
                <Text variant="caption" className={styles.error}>
                    {noticiaId
                        ? "No fue posible cargar la noticia. Intenta nuevamente."
                        : "No fue posible cargar el formulario. Intenta nuevamente."}
                </Text>
                <Button variant="outlined" rounded onClick={onBack}>
                    Ver listado de noticias
                </Button>
            </div>
        );
    }

    return (
        <NewsFormContent
            key={noticia?.id ?? "nueva"}
            initial={noticia}
            categorias={categorias}
            etiquetas={etiquetas}
            onBack={onBack}
        />
    );
}

interface NewsFormContentProps {
    initial: NoticiaDetalle | null;
    categorias: CategoriaNoticia[];
    etiquetas: EtiquetaNoticia[];
    onBack: () => void;
}

function NewsFormContent({ initial, categorias, etiquetas, onBack }: NewsFormContentProps) {
    const form = useNewsForm(initial);
    const hasErrors = Object.keys(form.errors).length > 0;
    const { categoriaId } = form.values;

    const options: NewsFormOptions = useMemo(() => ({
        // Árbol TB_CATEGORIA: raíces en Categoría, hijas de la elegida en Subcategoría.
        categorias: categorias
            .filter((categoria) => categoria.categoriaPadreId === null)
            .map((categoria) => ({ value: categoria.id, label: categoria.nombre })),
        subcategorias: [
            SIN_SUBCATEGORIA_OPTION,
            ...categorias
                .filter((categoria) => categoriaId !== "" && categoria.categoriaPadreId === categoriaId)
                .map((categoria) => ({ value: categoria.id, label: categoria.nombre })),
        ],
        idiomas: IDIOMA_OPTIONS,
        visibilidades: VISIBILIDAD_OPTIONS,
        etiquetas: etiquetas.map((etiqueta) => ({
            value: etiqueta.id,
            label: etiqueta.nombre,
            ...TAG_CHIP_COLORS,
        })),
    }), [categorias, etiquetas, categoriaId]);

    const handleSaveDraft = () => {
        if (!form.validate("borrador")) return;
        // TODO [COM03-FLUJO]: abrir modal "Guardar borrador" (4139:704) y guardar.
        // Al enviar, convertir el contenido de cada sección con textToHtml (TB_SECCION_NOTICIA.contenido_html).
    };

    const handlePreview = () => {
        if (!form.validate("publicar")) return;
        // TODO [COM03-FLUJO]: mostrar la vista previa (4136:662).
    };

    const handlePublish = () => {
        if (!form.validate("publicar")) return;
        // TODO [COM03-FLUJO]: según form.publishIntent abrir "Confirmar publicación" (4052:1355)
        // o "Confirmar publicación programada" (4155:750).
    };

    return (
        <>
            {hasErrors && (
                <Text variant="caption" className={styles.errorSummary}>
                    Revisa los campos marcados antes de continuar.
                </Text>
            )}

            <NewsForm
                heading={initial ? "Editar noticia" : "Crear noticia"}
                values={form.values}
                errors={form.errors}
                options={options}
                accept={NEWS_FORM_ACCEPT}
                onTitleChange={form.setTitle}
                onSlugChange={form.setSlug}
                onFieldChange={form.setField}
                onTagsChange={form.setTags}
                onMainFileChange={form.setMainFile}
                onAddSection={form.addSection}
                onSectionChange={form.updateSection}
                onSectionImageChange={form.setSectionImage}
                onMoveSection={form.moveSection}
                onRemoveSection={form.removeSection}
                onAddGalleryFiles={form.addGalleryFiles}
                onRemoveGalleryFile={form.removeGalleryFile}
                onCancel={onBack}
                onSaveDraft={handleSaveDraft}
                onPreview={handlePreview}
                onPublish={handlePublish}
            />
        </>
    );
}
