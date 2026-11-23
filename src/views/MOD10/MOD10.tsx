"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { graphqlRequestClient } from "@/api/graphql/client";
import { useSendEmailNotification } from "@/api/hooks";
import type { SendEmailNotificationInput } from "@/api/graphql/apps/types";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
type Area = {
    codigo: string;
    etiqueta: string;
    correoDestino: string;
    modoPrueba: boolean;
};
export const MOD10 = () => {
    const [areas, setAreas] = useState<Area[] | null>(null),
        [revision, reload] = useState(0),
        [error, setError] = useState(""),
        [message, setMessage] = useState(""),
        [area, setArea] = useState(""),
        [file, setFile] = useState<File | null>(null),
        [input, setInput] = useState<SendEmailNotificationInput | null>(null);
    const dialog = useRef<HTMLDialogElement>(null),
        form = useRef<HTMLFormElement>(null),
        busy = useRef(false);
    const { sendNotification, loading } = useSendEmailNotification();
    useEffect(() => {
        let active = true;
        graphqlRequestClient<{ notificacionCorreoAreas: Area[] }>(
            `query NotificacionAreas { notificacionCorreoAreas { codigo etiqueta correoDestino modoPrueba } }`,
        )
            .then((r) => {
                if (active) {
                    setAreas(r.notificacionCorreoAreas);
                    setError("");
                }
            })
            .catch(() => {
                if (active)
                    setError(
                        "No se pudieron consultar los destinatarios. Reintenta antes de preparar el documento.",
                    );
            });
        return () => {
            active = false;
        };
    }, [revision]);
    const destination = areas?.find((a) => a.codigo === area);
    async function send() {
        if (!input || !file || busy.current) return;
        busy.current = true;
        setError("");
        try {
            const r = await sendNotification(input, file);
            if (!r.success) throw Error();
            setMessage(`Notificación enviada a ${r.correoDestino}.`);
            dialog.current?.close();
            setInput(null);
        } catch {
            setError(
                "No se pudo confirmar el envío. Conservamos el documento y los datos; consulta el historial antes de reenviar.",
            );
        } finally {
            busy.current = false;
        }
    }
    return (
        <section className={styles.page}>
            <header>
                <h2>Preparación y destinatario</h2>
                <p className={styles.muted}>
                    Prepara el PDF y revisa el destinatario antes de autorizar
                    el envío.
                </p>
            </header>
            {error && (
                <p role="alert" className={styles.error}>
                    {error}
                </p>
            )}
            {message && <p role="status">{message}</p>}
            {areas && (
                <Button variant="outlined" onClick={() => reload((r) => r + 1)}>
                    Actualizar destinatarios
                </Button>
            )}
            {!areas ? (
                <Button variant="outlined" onClick={() => reload((r) => r + 1)}>
                    Reintentar destinatarios
                </Button>
            ) : (
                <form
                    ref={form}
                    className={styles.card}
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!file || !destination) return;
                        const d = new FormData(e.currentTarget);
                        setError("");
                        setInput({
                            destinatarioEsperado: destination.correoDestino,
                            pruebaEsperada: destination.modoPrueba,
                            areaDestino: area,
                            fechaDocumento: String(d.get("fecha")),
                            emitidoPor: String(d.get("emitido")),
                            numeroExpediente: String(d.get("expediente")),
                            numeroFolio: Number(d.get("folios")),
                            nombre: String(d.get("nombre")),
                            referencia: String(d.get("referencia")),
                        });
                        dialog.current?.showModal();
                    }}
                >
                    {destination?.modoPrueba && (
                        <p role="status">
                            Prueba controlada: todos los documentos se enviarán
                            únicamente a {destination.correoDestino}. Los
                            destinatarios habituales se conservan.
                        </p>
                    )}
                    <div className={styles.formGrid}>
                        <label className={styles.field}>
                            Área destino
                            <select
                                className={styles.control}
                                aria-label="Área destino"
                                required
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                            >
                                <option value="">Seleccionar área</option>
                                {areas.map((a) => (
                                    <option key={a.codigo} value={a.codigo}>
                                        {a.etiqueta}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className={styles.field}>
                            Fecha del documento
                            <input
                                className={styles.control}
                                name="fecha"
                                type="date"
                                required
                            />
                        </label>
                        <label className={styles.field}>
                            Emitido por
                            <input
                                className={styles.control}
                                name="emitido"
                                maxLength={250}
                                required
                            />
                        </label>
                        <label className={styles.field}>
                            Número de expediente
                            <input
                                className={styles.control}
                                name="expediente"
                                maxLength={100}
                                required
                            />
                        </label>
                        <label className={styles.field}>
                            Número de folios
                            <input
                                className={styles.control}
                                name="folios"
                                type="number"
                                min="1"
                                required
                            />
                        </label>
                        <label className={styles.field}>
                            Nombre
                            <input
                                className={styles.control}
                                name="nombre"
                                maxLength={300}
                                required
                            />
                        </label>
                        <label className={styles.field}>
                            Referencia
                            <textarea
                                className={styles.control}
                                name="referencia"
                                required
                            />
                        </label>
                        <label className={styles.field}>
                            Documento PDF
                            <input
                                type="file"
                                accept=".pdf,application/pdf"
                                required
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (
                                        f &&
                                        (f.size > 10 * 1024 * 1024 ||
                                            !f.name
                                                .toLowerCase()
                                                .endsWith(".pdf"))
                                    ) {
                                        setError(
                                            "Selecciona un PDF de hasta 10 MB.",
                                        );
                                        setFile(null);
                                        e.target.value = "";
                                    } else setFile(f || null);
                                }}
                            />
                        </label>
                    </div>
                    <p>
                        Destinatario efectivo:{" "}
                        <strong>
                            {destination?.correoDestino || "Selecciona un área"}
                        </strong>
                    </p>
                    <Button
                        type="submit"
                        state={file && destination ? "default" : "disabled"}
                    >
                        Revisar documento
                    </Button>
                </form>
            )}
            <dialog
                ref={dialog}
                className={styles.dialog}
                onCancel={(e) => {
                    if (loading) e.preventDefault();
                }}
            >
                <div className={styles.dialogHeader}>
                    <h2>
                        {destination?.modoPrueba
                            ? "Confirmar prueba de correo"
                            : "Confirmar notificación"}
                    </h2>
                </div>
                <div className={styles.dialogBody}>
                    <p>
                        Destinatario:{" "}
                        <strong>{destination?.correoDestino}</strong>
                    </p>
                    <p>
                        Expediente: {input?.numeroExpediente} · Archivo:{" "}
                        {file?.name}
                    </p>
                    <p>
                        El envío queda registrado en el historial. Revisa que el
                        documento corresponda al expediente.
                    </p>
                    {error && (
                        <p role="alert" className={styles.error}>
                            {error}
                        </p>
                    )}
                    <Button
                        variant="outlined"
                        state={loading ? "disabled" : "default"}
                        onClick={() => dialog.current?.close()}
                    >
                        Volver al documento
                    </Button>
                    <Button
                        state={loading ? "loading" : "default"}
                        onClick={() => void send()}
                    >
                        {destination?.modoPrueba
                            ? "Enviar prueba"
                            : "Enviar notificación"}
                    </Button>
                </div>
            </dialog>
        </section>
    );
};
export default MOD10;
