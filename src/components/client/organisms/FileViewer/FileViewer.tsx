"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { platformKey, usePlatformQuery } from "@/platform/query";
import { Button } from "@/components/client/atoms/Button";
import { platformFetch, PlatformError } from "@/platform/client";
import styles from "./FileViewer.module.scss";
import { OfficePreview, type OfficeDocument } from "./OfficePreview";
export type ViewedFile = { id: string; name: string };
type Preview = { url: string; mime: string; text?: string };
function FilePreview({ preview, name, onError }: { preview: Preview; name: string; onError: () => void }) {
    if (["image/png", "image/jpeg", "image/gif", "image/webp"].includes(preview.mime)) {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={preview.url} alt={name} onError={onError} />;
    }
    if (preview.mime === "application/pdf") return <iframe src={preview.url} title={"PDF: " + name} />;
    if (preview.text !== undefined) return <pre>{preview.text}</pre>;
    return (
        <div className={styles.empty}>
            <h3>Vista previa no disponible para este formato</h3>
            <p>Descarga el archivo para abrirlo con su aplicación.</p>
        </div>
    );
}
export function FileViewer({
    ticketId,
    file,
    onClose,
}: {
    ticketId: string;
    file: ViewedFile;
    onClose: () => void;
}) {
    const dialog = useRef<HTMLDialogElement>(null),
        titleId = useId();
    const [mediaError, setMediaError] = useState("");
    const officeFile = /\.(docx?|xlsx?)$/i.test(file.name);
    useEffect(() => {
        const node = dialog.current;
        node?.showModal();
        return () => {
            if (node?.open) node.close();
        };
    }, []);
    const filePath = `/tickets/${encodeURIComponent(ticketId)}/files/${encodeURIComponent(file.id)}`;
    // Archivo original (el contenido no cambia: se guarda en caché mientras el visor esté abierto).
    const fileQuery = useQuery({
        queryKey: [...platformKey(filePath), "contenido"],
        staleTime: Infinity,
        queryFn: async ({ signal }) => {
            const blob = await platformFetch<Blob>(filePath, { signal });
            const mime = blob.type.split(";")[0];
            const text =
                mime === "text/plain"
                    ? (await blob.slice(0, 1024 * 1024).text()) +
                      (blob.size > 1024 * 1024
                          ? "\n… Vista previa limitada a 1 MB. Descarga el archivo para verlo completo."
                          : "")
                    : undefined;
            return { blob, mime, text };
        },
    });
    const url = useMemo(
        () => (fileQuery.data ? URL.createObjectURL(fileQuery.data.blob) : undefined),
        [fileQuery.data],
    );
    useEffect(() => () => void (url && URL.revokeObjectURL(url)), [url]);
    const preview: Preview | null =
        fileQuery.data && url ? { url, mime: fileQuery.data.mime, text: fileQuery.data.text } : null;
    // Word y Excel: vista previa convertida en el servidor, después de tener el original.
    const officeQuery = usePlatformQuery<OfficeDocument>(
        officeFile && fileQuery.data ? filePath + "/preview" : null,
        { staleTime: Infinity },
    );
    const office = officeQuery.data ?? null;
    const failure = fileQuery.error;
    const error =
        mediaError ||
        (failure
            ? failure instanceof PlatformError && failure.status === 404
                ? "El archivo no está disponible. Solicita que lo revisen y reintenta."
                : failure instanceof PlatformError && failure.status === 403
                  ? "No tienes acceso a este archivo del ticket."
                  : "No se pudo abrir el archivo. Revisa tu acceso al ticket o reintenta."
            : "");
    const officeError = officeQuery.error
        ? officeQuery.error instanceof PlatformError
            ? officeQuery.error.message
            : "No se pudo preparar la vista previa. Puedes descargar el original o reintentar."
        : "";
    const reference = [failure, officeQuery.error].find((e) => e instanceof PlatformError)?.reference;
    const loading = fileQuery.isFetching;
    const officeLoading = officeQuery.isFetching;
    function retry() {
        setMediaError("");
        void fileQuery.refetch();
        if (officeFile) void officeQuery.refetch();
    }
    function close() {
        dialog.current?.close();
        onClose();
    }
    return (
        <dialog
            ref={dialog}
            className={styles.dialog}
            aria-labelledby={titleId}
            onCancel={(event) => {
                event.preventDefault();
                event.stopPropagation();
                close();
            }}
        >
            <header className={styles.header}>
                <div>
                    <p>Archivo del ticket</p>
                    <h2 id={titleId}>{file.name}</h2>
                </div>
                <div className={styles.actions}>
                    {preview && (
                        <a href={preview.url} download={file.name} className={styles.download}>
                            Descargar archivo
                        </a>
                    )}
                    <Button variant="outlined" onClick={close} aria-label="Cerrar visor de archivos">
                        Cerrar
                    </Button>
                </div>
            </header>
            <section
                className={styles.content}
                aria-label="Vista previa del archivo"
                aria-busy={loading || officeLoading}
            >
                {loading && <p role="status">Cargando archivo…</p>}
                {!loading && error && (
                    <div role="alert">
                        <p>{error}</p>
                        {reference && <p>Referencia: {reference}</p>}
                        <Button variant="outlined" onClick={retry}>
                            Reintentar archivo
                        </Button>
                    </div>
                )}
                {!loading && !error && officeLoading && <p role="status">Preparando vista previa…</p>}
                {!loading && !error && officeError && (
                    <div role="alert">
                        <p>{officeError}</p>
                        {reference && <p>Referencia: {reference}</p>}
                        <p>El original está disponible en «Descargar archivo».</p>
                        <Button variant="outlined" onClick={retry}>
                            Reintentar vista previa
                        </Button>
                    </div>
                )}
                {!loading && !error && office && (
                    <OfficePreview
                        key={file.id + ":" + officeQuery.dataUpdatedAt}
                        document={office}
                        name={file.name}
                    />
                )}
                {!loading && !error && !officeFile && preview && (
                    <FilePreview
                        preview={preview}
                        name={file.name}
                        onError={() =>
                            setMediaError("No se pudo mostrar la imagen. Reintenta abrir el archivo.")
                        }
                    />
                )}
            </section>
        </dialog>
    );
}
