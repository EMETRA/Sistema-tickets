"use client";
import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { platformFetch } from "@/platform/client";
import styles from "./FileViewer.module.scss";
export type ViewedFile = { id: string; name: string };
type Preview = { url: string; mime: string; text?: string };
function FilePreview({
    preview,
    name,
    onError,
}: {
    preview: Preview;
    name: string;
    onError: () => void;
}) {
    if (
        ["image/png", "image/jpeg", "image/gif", "image/webp"].includes(
            preview.mime,
        )
    ) {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={preview.url} alt={name} onError={onError} />;
    }
    if (preview.mime === "application/pdf")
        return <iframe src={preview.url} title={"PDF: " + name} />;
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
    const [revision, setRevision] = useState(0),
        [loading, setLoading] = useState(true),
        [error, setError] = useState("");
    const [preview, setPreview] = useState<Preview | null>(null);
    useEffect(() => {
        const node = dialog.current;
        node?.showModal();
        return () => {
            if (node?.open) node.close();
        };
    }, []);
    useEffect(() => {
        const controller = new AbortController();
        let url: string | undefined;
        platformFetch<Blob>(
            `/tickets/${encodeURIComponent(ticketId)}/files/${encodeURIComponent(file.id)}`,
            { signal: controller.signal },
        )
            .then(async (blob) => {
                if (controller.signal.aborted) return;
                const mime = blob.type.split(";")[0];
                const text =
                    mime === "text/plain"
                        ? (await blob.slice(0, 1024 * 1024).text()) +
                          (blob.size > 1024 * 1024
                              ? "\n… Vista previa limitada a 1 MB. Descarga el archivo para verlo completo."
                              : "")
                        : undefined;
                if (controller.signal.aborted) return;
                url = URL.createObjectURL(blob);
                setPreview({ url, mime, text });
            })
            .catch(() => {
                if (!controller.signal.aborted)
                    setError(
                        "No se pudo abrir el archivo. Revisa tu acceso al ticket o reintenta.",
                    );
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });
        return () => {
            controller.abort();
            if (url) URL.revokeObjectURL(url);
        };
    }, [ticketId, file.id, revision]);
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
                        <a
                            href={preview.url}
                            download={file.name}
                            className={styles.download}
                        >
                            Descargar archivo
                        </a>
                    )}
                    <Button
                        variant="outlined"
                        onClick={close}
                        aria-label="Cerrar visor de archivos"
                    >
                        Cerrar
                    </Button>
                </div>
            </header>
            <section
                className={styles.content}
                aria-label="Vista previa del archivo"
                aria-busy={loading}
            >
                {loading && <p role="status">Cargando archivo…</p>}
                {!loading && error && (
                    <div role="alert">
                        <p>{error}</p>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setLoading(true);
                                setError("");
                                setPreview(null);
                                setRevision((v) => v + 1);
                            }}
                        >
                            Reintentar archivo
                        </Button>
                    </div>
                )}
                {!loading && !error && preview && (
                    <FilePreview
                        preview={preview}
                        name={file.name}
                        onError={() =>
                            setError(
                                "No se pudo mostrar la imagen. Reintenta abrir el archivo.",
                            )
                        }
                    />
                )}
            </section>
        </dialog>
    );
}
