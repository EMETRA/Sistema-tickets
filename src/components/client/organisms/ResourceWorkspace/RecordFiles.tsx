"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/client/atoms/Button";
import {
    downloadPlatform,
    platformCommand,
    platformFetch,
} from "@/platform/client";
import { usePlatform } from "@/platform/context";
import type { PlatformRecord } from "@/platform/types";
import styles from "../../templates/PlatformPage/PlatformPage.module.scss";
type FileInfo = {
    id: string;
    nombre: string;
    mime: string;
    bytes: number;
    creadoEn: string;
};
export function RecordFiles({
    type,
    record,
}: {
    type: string;
    record: PlatformRecord;
}) {
    const { data } = usePlatform(),
        def = data!.definitions[type],
        input = useRef<HTMLInputElement>(null),
        [files, setFiles] = useState<FileInfo[]>([]),
        [loading, setLoading] = useState(false),
        [error, setError] = useState(""),
        [revision, setRevision] = useState(0),
        [preview, setPreview] = useState<string | null>(null);
    useEffect(() => {
        const controller = new AbortController();
        platformFetch<FileInfo[]>(
            "/records/" + type + "/" + record.id + "/files",
            {
                signal: controller.signal,
            },
        )
            .then(setFiles)
            .catch((e) => {
                if (!controller.signal.aborted) setError(e.message);
            });
        return () => controller.abort();
    }, [type, record.id, revision]);
    useEffect(
        () => () => {
            if (preview) URL.revokeObjectURL(preview);
        },
        [preview],
    );
    async function upload(file: File) {
        setLoading(true);
        setError("");
        try {
            if (file.size > 20 * 1024 * 1024)
                throw Error("El archivo debe pesar como máximo 20 MB.");
            const buffer = await file.arrayBuffer(),
                hash = Array.from(
                    new Uint8Array(
                        await crypto.subtle.digest("SHA-256", buffer),
                    ),
                )
                    .map((x) => x.toString(16).padStart(2, "0"))
                    .join("");
            const form = new FormData();
            form.set("file", file);
            await platformCommand(
                "/records/" + type + "/" + record.id + "/files",
                "POST",
                {
                    version: record.version,
                    data: {
                        nombre: file.name,
                        mime:
                            file.type === "image/jpg"
                                ? "image/jpeg"
                                : file.type,
                        bytes: file.size,
                        hash,
                    },
                },
                data!.actor.admin,
                "Adjuntar documento a " + record.nombre,
                form,
            );
            setRevision((r) => r + 1);
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "No se pudo adjuntar el archivo.",
            );
        } finally {
            setLoading(false);
            if (input.current) input.current.value = "";
        }
    }
    async function show(file: FileInfo) {
        setError("");
        try {
            const blob = await platformFetch<Blob>("/files/" + file.id);
            setPreview(URL.createObjectURL(blob));
        } catch (e) {
            setError(
                e instanceof Error ? e.message : "No se pudo abrir la imagen.",
            );
        }
    }
    return (
        <section className={styles.card}>
            <div className={styles.toolbar}>
                <h3>Documentos y planos</h3>
                {(def.actions.EDITAR ||
                    (def.immutable && def.actions.INSERTAR)) && (
                    <>
                        <Button
                            type="button"
                            variant="outlined"
                            state={loading ? "loading" : "default"}
                            onClick={() => input.current?.click()}
                        >
                            Adjuntar archivo
                        </Button>
                        <input
                            ref={input}
                            type="file"
                            accept="image/jpeg,image/png,application/pdf"
                            hidden
                            onChange={(e) => {
                                if (e.target.files?.[0])
                                    void upload(e.target.files[0]);
                            }}
                        />
                    </>
                )}
            </div>
            <p className={styles.muted}>
                PDF, JPEG o PNG · Hasta 20 MB por archivo. El acceso conserva
                los permisos del registro.
            </p>
            {error && (
                <p role="alert" className={styles.error}>
                    {error}
                </p>
            )}
            <ul className={styles.timeline}>
                {files.map((file) => (
                    <li key={file.id}>
                        <strong>{file.nombre}</strong>
                        <p className={styles.muted}>
                            {Math.round(file.bytes / 1024)} KB
                        </p>
                        <div className={styles.actions}>
                            {file.mime.startsWith("image/") && (
                                <button
                                    className={styles.link}
                                    onClick={() => void show(file)}
                                >
                                    Ver imagen
                                </button>
                            )}
                            <button
                                className={styles.link}
                                onClick={() =>
                                    void downloadPlatform(
                                        "/files/" + file.id,
                                        file.nombre,
                                    ).catch((e) => setError(e.message))
                                }
                            >
                                Descargar
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
            {!files.length && (
                <p className={styles.muted}>
                    Todavía no hay archivos adjuntos.
                </p>
            )}
            {preview && (
                <div>
                    <Button variant="outlined" onClick={() => setPreview(null)}>
                        Cerrar imagen
                    </Button>
                    <Image
                        src={preview}
                        alt="Imagen adjunta al registro"
                        width={1000}
                        height={700}
                        unoptimized
                        style={{
                            width: "100%",
                            height: "auto",
                            maxHeight: 600,
                            objectFit: "contain",
                        }}
                    />
                </div>
            )}
        </section>
    );
}
