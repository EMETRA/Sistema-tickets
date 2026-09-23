"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { scrollToTop } from "@/helpers/scrollToTop";
import { scrollToFirstError } from "@/helpers/scrollToFirstError";
import { useGetCategoriasNoticia, useGetEtiquetasNoticia, useGetNoticia } from "@/api/hooks";
import type { CategoriaNoticia, EtiquetaNoticia, NoticiaDetalle } from "@/api/graphql/COM03";
import { Button } from "@/components/client/atoms/Button";
import { Text } from "@/components/client/atoms/Text";
import { NewsForm, type NewsFormOptions } from "@/components/client/organisms/NewsForm";
import { NewsPreview } from "@/components/client/organisms/NewsPreview";
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
    // La vista previa es un modo de esta pantalla (no otra URL) para no perder el estado ni los archivos.
    const [isPreview, setIsPreview] = useState(false);
    const screenRef = useRef<HTMLDivElement>(null);
    // Cuenta los intentos con errores; cada cambio lleva al primer error ya pintado.
    const [failedAttempts, setFailedAttempts] = useState(0);

    useEffect(() => {
        if (failedAttempts === 0) return;
        scrollToFirstError(screenRef.current);
    }, [failedAttempts]);
    const hasErrors = Object.keys(form.errors).length > 0;
    const { categoriaId, subcategoriaId, etiquetaIds } = form.values;

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

    // Nombres para los chips de la vista previa
    const categoryLabels = useMemo(
        () => [categoriaId, subcategoriaId]
            .filter(Boolean)
            .map((id) => categorias.find((categoria) => categoria.id === id)?.nombre)
            .filter((nombre): nombre is string => Boolean(nombre)),
        [categorias, categoriaId, subcategoriaId]
    );
    const tagLabels = useMemo(
        () => etiquetaIds
            .map((id) => etiquetas.find((etiqueta) => etiqueta.id === id)?.nombre)
            .filter((nombre): nombre is string => Boolean(nombre)),
        [etiquetas, etiquetaIds]
    );

    // Valida y, si hay errores, pide llevar al primero.
    const validate = (mode: "publicar" | "borrador") => {
        const isValid = form.validate(mode);
        if (!isValid) setFailedAttempts((count) => count + 1);
        return isValid;
    };

    const handleSaveDraft = () => {
        if (!validate("borrador")) return;
        // TODO [COM03-FLUJO]: abrir modal "Guardar borrador" (4139:704) y guardar.
        // Al enviar, convertir el contenido de cada sección con textToHtml (TB_SECCION_NOTICIA.contenido_html).
    };

    // Al cambiar entre formulario y vista previa se sube al inicio de la pantalla.
    const showPreview = (value: boolean) => {
        scrollToTop(screenRef.current);
        setIsPreview(value);
    };

    const handlePreview = () => {
        if (!validate("publicar")) return;
        showPreview(true);
    };

    const handlePublish = () => {
        if (!validate("publicar")) return;
        // TODO [COM03-FLUJO]: según form.publishIntent abrir "Confirmar publicación" (4052:1355)
        // o "Confirmar publicación programada" (4155:750).
    };

    if (isPreview) {
        return (
            <div ref={screenRef} className={styles.screen}>
                <NewsPreview
                    values={form.values}
                    categoryLabels={categoryLabels}
                    tagLabels={tagLabels}
                    onBack={() => showPreview(false)}
                    onPublish={handlePublish}
                />
            </div>
        );
    }

    return (
        <div ref={screenRef} className={styles.screen}>
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
        </div>
    );
}
