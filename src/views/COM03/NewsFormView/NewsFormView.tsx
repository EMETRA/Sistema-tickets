"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { scrollToTop } from "@/helpers/scrollToTop";
import { scrollToFirstError } from "@/helpers/scrollToFirstError";
import { createIdempotencyKey } from "@/helpers/createIdempotencyKey";
import {
    useGetCategoriasNoticia,
    useGetEtiquetasNoticia,
    useGetNoticia,
    useGuardarNoticia,
} from "@/api/hooks";
import {
    AccionNoticia,
    toNoticiaCmsError,
    type CategoriaNoticia,
    type EtiquetaNoticia,
    type GuardarNoticiaCmsResult,
    type NoticiaCmsError,
    type NoticiaDetalle,
} from "@/api/graphql/COM03";
import { Button } from "@/components/client/atoms/Button";
import { Text } from "@/components/client/atoms/Text";
import { Title } from "@/components/client/atoms/Title";
import { ModalContent } from "@/components/client/molecules/ModalContent";
import { LoadingModal } from "@/components/client/molecules/LoadingModal";
import { NewsForm, type NewsFormOptions } from "@/components/client/organisms/NewsForm";
import { NewsPreview } from "@/components/client/organisms/NewsPreview";
import { NewsResultCard } from "@/components/client/organisms/NewsResultCard";
import { buildGuardarNoticiaPayload } from "../utils/buildGuardarNoticiaPayload";
import {
    PUBLICADA_NO_VISIBLE_SUCCESS,
    SLUG_CONFLICT_MESSAGE,
    errorReference,
    getErrorTexts,
    getFlowTexts,
} from "./flowTexts";
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

    // Flujo de guardado: confirmar → guardando → éxito / error
    const { guardarNoticia } = useGuardarNoticia();
    const [accion, setAccion] = useState<AccionNoticia | null>(null);
    const [step, setStep] = useState<"idle" | "confirm" | "saving" | "success" | "error">("idle");
    const texts = accion ? getFlowTexts(accion, form.values.fechaPublicacion) : null;
    // Último resultado o error de guardarNoticiaCms (README).
    const [resultado, setResultado] = useState<GuardarNoticiaCmsResult | null>(null);
    const [saveError, setSaveError] = useState<NoticiaCmsError | null>(null);

    // Evita envíos repetidos:
    // - savingRef bloquea cualquier clic mientras hay un envío en curso (doble clic, Reintentar).
    // - La clave de idempotencia se repite en cada reintento de la misma acción, para que backend
    //   descarte el duplicado si el primer envío sí llegó pero la respuesta falló.
    const savingRef = useRef(false);
    const idempotencyRef = useRef<{ accion: AccionNoticia; key: string } | null>(null);

    // Mientras se envía, el navegador pide confirmación antes de refrescar o cerrar la pestaña.
    useEffect(() => {
        if (step !== "saving") return;
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [step]);

    const askConfirmation = (nextAccion: AccionNoticia) => {
        if (idempotencyRef.current?.accion !== nextAccion) {
            idempotencyRef.current = { accion: nextAccion, key: createIdempotencyKey() };
        }
        setAccion(nextAccion);
        setStep("confirm");
    };

    const save = async () => {
        if (!accion || !idempotencyRef.current || savingRef.current) return;
        savingRef.current = true;
        setStep("saving");
        // TODO [COM03-BACKEND]: `archivosPendientes` (imágenes nuevas) aún no se envían: falta
        // definir cómo se suben para obtener su recurso_id (Feyser y backend).
        const { variables } = buildGuardarNoticiaPayload(
            form.values,
            initial?.id ?? null,
            accion,
            idempotencyRef.current.key,
        );
        let succeeded = false;
        let cmsError: NoticiaCmsError | null = null;
        try {
            // "guardada", "publicada" e `idempotente: true` son éxito (README).
            setResultado(await guardarNoticia(variables));
            setSaveError(null);
            succeeded = true;
        } catch (err) {
            cmsError = toNoticiaCmsError(err);
            setSaveError(cmsError);
            succeeded = false;
        } finally {
            savingRef.current = false;
        }

        // Slug repetido: se corrige en el formulario, no en una pantalla de error. Se vuelve al
        // formulario con el campo marcado y se lleva hasta él. El siguiente envío lleva otra clave.
        if (cmsError?.codigo === "SLUG_IDIOMA_CONFLICT") {
            idempotencyRef.current = null;
            setStep("idle");
            setIsPreview(false);
            form.setFieldError("slug", SLUG_CONFLICT_MESSAGE);
            setFailedAttempts((count) => count + 1);
            return;
        }
        // La pantalla de resultado reemplaza al formulario: se muestra desde arriba.
        scrollToTop(screenRef.current);
        setStep(succeeded ? "success" : "error");
    };

    const handleSaveDraft = () => {
        if (!validate("borrador")) return;
        askConfirmation(AccionNoticia.BORRADOR);
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
        askConfirmation(form.publishIntent === "programar" ? AccionNoticia.PROGRAMAR : AccionNoticia.PUBLICAR);
    };

    const errorTexts = getErrorTexts(saveError?.codigo ?? null);

    const handleBackToForm = () => {
        // Si backend rechazó el contenido, la persona lo va a corregir: el siguiente envío es otro
        // intento y lleva otra clave. Si fue un fallo transitorio, se conserva la misma clave.
        if (step === "error" && !errorTexts.retryable) idempotencyRef.current = null;
        setStep("idle");
        showPreview(false);
    };

    if (texts && step === "success") {
        // "Publicar" una noticia privada: backend la guarda como publicada pero no la hace visible.
        const success = accion === AccionNoticia.PUBLICAR && resultado?.resultado === "guardada"
            ? PUBLICADA_NO_VISIBLE_SUCCESS
            : texts.success;
        return (
            <div ref={screenRef} className={styles.screen}>
                <Title variant="mid" tag="h1" className={styles.resultHeading}>Comunicación</Title>
                <NewsResultCard
                    status="success"
                    title={success.title}
                    description={success.description}
                    badge={success.badge}
                    note={success.note}
                    primaryAction={{ label: "Ver listado de noticias", onClick: onBack }}
                />
            </div>
        );
    }

    if (texts && step === "error") {
        const noticiaNoExiste = saveError?.codigo === "NEWS_NOT_FOUND";
        return (
            <div ref={screenRef} className={styles.screen}>
                <Title variant="mid" tag="h1" className={styles.resultHeading}>Comunicación</Title>
                <NewsResultCard
                    status="error"
                    title={texts.errorTitle}
                    description={errorTexts.description}
                    reference={errorReference(saveError?.codigo ?? null)}
                    primaryAction={
                        errorTexts.retryable
                            ? { label: "Reintentar", onClick: save }
                            : noticiaNoExiste
                                ? { label: "Ver listado de noticias", onClick: onBack }
                                : { label: "Volver al formulario", onClick: handleBackToForm }
                    }
                    secondaryAction={
                        errorTexts.retryable
                            ? { label: "Volver al formulario", onClick: handleBackToForm }
                            : undefined
                    }
                />
            </div>
        );
    }

    const flowModals = texts && (
        <>
            <ModalContent
                variant="compact"
                align={texts.confirm.align}
                isOpen={step === "confirm"}
                title={texts.confirm.title}
                description={texts.confirm.description}
                onClose={() => setStep("idle")}
                onConfirm={save}
            />
            <LoadingModal
                isOpen={step === "saving"}
                title={texts.loading.title}
                description={texts.loading.description}
            />
        </>
    );

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
                {flowModals}
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
                onMainVideoAdd={form.setMainVideo}
                onSectionVideoAdd={form.setSectionVideo}
                onAddGalleryVideo={form.addGalleryVideo}
                onCancel={onBack}
                onSaveDraft={handleSaveDraft}
                onPreview={handlePreview}
                onPublish={handlePublish}
            />
            {flowModals}
        </div>
    );
}
