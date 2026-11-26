"use client";
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { mensajes, texto } from "@/platform/forms";
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
/** Hoy en Guatemala (UTC−6), como `hoyGuatemalaIso` del API. */
const hoyGuatemala = () => new Date(Date.now() - 6 * 3600000).toISOString().slice(0, 10);
/** Reglas de `notificacion-correo.service.ts` del API. */
const notificacionSchema = z.object({
    area: z.string().min(1, "Selecciona el área destino."),
    fecha: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, mensajes.requerido("Fecha del documento"))
        .refine((v) => v <= hoyGuatemala(), "La fecha del documento no puede ser posterior a hoy."),
    emitido: texto("Emitido por", { requerido: true, max: 250 }),
    expediente: texto("Número de expediente", { requerido: true, max: 100 }),
    folios: z
        .string()
        .regex(/^[1-9]\d{0,8}$/, "Escribe el número de folios como un entero de 1 en adelante."),
    nombre: texto("Nombre", { requerido: true, max: 300 }),
    referencia: texto("Referencia", { requerido: true, max: 8000 }),
});
type NotificacionValues = z.infer<typeof notificacionSchema>;
export const MOD10 = () => {
    const [sendError, setSendError] = useState(""),
        [fileError, setFileError] = useState(""),
        [message, setMessage] = useState(""),
        [file, setFile] = useState<File | null>(null),
        [input, setInput] = useState<SendEmailNotificationInput | null>(null);
    const dialog = useRef<HTMLDialogElement>(null),
        busy = useRef(false);
    const { sendNotification, loading } = useSendEmailNotification();
    const areasQuery = useQuery({
        queryKey: ["graphql", "notificacionCorreoAreas"],
        queryFn: () =>
            graphqlRequestClient<{ notificacionCorreoAreas: Area[] }>(
                `query NotificacionAreas { notificacionCorreoAreas { codigo etiqueta correoDestino modoPrueba } }`,
            ).then((r) => r.notificacionCorreoAreas),
    });
    const areas = areasQuery.data ?? null;
    const { register, handleSubmit, control, formState } = useForm<NotificacionValues>({
        resolver: zodResolver(notificacionSchema),
        defaultValues: {
            area: "",
            fecha: "",
            emitido: "",
            expediente: "",
            folios: "",
            nombre: "",
            referencia: "",
        },
    });
    const errors = formState.errors;
    const area = useWatch({ control, name: "area" });
    const destination = areas?.find((a) => a.codigo === area);
    const error =
        sendError ||
        fileError ||
        (areasQuery.error
            ? "No se pudieron consultar los destinatarios. Reintenta antes de preparar el documento."
            : "");
    const fail = (name: keyof NotificacionValues) =>
        errors[name] ? (
            <span role="alert" id={"mod10-" + name + "-error"} className={styles.error}>
                {errors[name]?.message}
            </span>
        ) : null;
    const field = (name: keyof NotificacionValues) => ({
        ...register(name),
        id: "mod10-" + name,
        "aria-invalid": !!errors[name],
        "aria-describedby": errors[name] ? "mod10-" + name + "-error" : undefined,
    });
    async function send() {
        if (!input || !file || busy.current) return;
        busy.current = true;
        setSendError("");
        try {
            const r = await sendNotification(input, file);
            if (!r.success) throw Error();
            setMessage(`Notificación enviada a ${r.correoDestino}.`);
            dialog.current?.close();
            setInput(null);
        } catch {
            setSendError(
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
                    Prepara el PDF y revisa el destinatario antes de autorizar el envío.
                </p>
            </header>
            {error && (
                <p role="alert" className={styles.error}>
                    {error}
                </p>
            )}
            {message && <p role="status">{message}</p>}
            {areas && (
                <Button variant="outlined" onClick={() => void areasQuery.refetch()}>
                    Actualizar destinatarios
                </Button>
            )}
            {!areas ? (
                <Button variant="outlined" onClick={() => void areasQuery.refetch()}>
                    Reintentar destinatarios
                </Button>
            ) : (
                <form
                    className={styles.card}
                    noValidate
                    onSubmit={handleSubmit((v) => {
                        if (!file || !destination) {
                            setFileError("Selecciona el documento PDF.");
                            return;
                        }
                        setSendError("");
                        setInput({
                            destinatarioEsperado: destination.correoDestino,
                            pruebaEsperada: destination.modoPrueba,
                            areaDestino: v.area,
                            fechaDocumento: v.fecha,
                            emitidoPor: v.emitido,
                            numeroExpediente: v.expediente,
                            numeroFolio: Number(v.folios),
                            nombre: v.nombre,
                            referencia: v.referencia,
                        });
                        dialog.current?.showModal();
                    })}
                >
                    {destination?.modoPrueba && (
                        <p role="status">
                            Prueba controlada: todos los documentos se enviarán únicamente a{" "}
                            {destination.correoDestino}. Los destinatarios habituales se conservan.
                        </p>
                    )}
                    <div className={styles.formGrid}>
                        <label className={styles.field}>
                            Área destino
                            <select className={styles.control} aria-label="Área destino" {...field("area")}>
                                <option value="">Seleccionar área</option>
                                {areas.map((a) => (
                                    <option key={a.codigo} value={a.codigo}>
                                        {a.etiqueta}
                                    </option>
                                ))}
                            </select>
                            {fail("area")}
                        </label>
                        <label className={styles.field}>
                            Fecha del documento
                            <input
                                className={styles.control}
                                type="date"
                                max={hoyGuatemala()}
                                {...field("fecha")}
                            />
                            {fail("fecha")}
                        </label>
                        <label className={styles.field}>
                            Emitido por
                            <input className={styles.control} maxLength={250} {...field("emitido")} />
                            {fail("emitido")}
                        </label>
                        <label className={styles.field}>
                            Número de expediente
                            <input className={styles.control} maxLength={100} {...field("expediente")} />
                            {fail("expediente")}
                        </label>
                        <label className={styles.field}>
                            Número de folios
                            <input className={styles.control} inputMode="numeric" {...field("folios")} />
                            {fail("folios")}
                        </label>
                        <label className={styles.field}>
                            Nombre
                            <input className={styles.control} maxLength={300} {...field("nombre")} />
                            {fail("nombre")}
                        </label>
                        <label className={styles.field}>
                            Referencia
                            <textarea className={styles.control} {...field("referencia")} />
                            {fail("referencia")}
                        </label>
                        <label className={styles.field}>
                            Documento PDF
                            <input
                                type="file"
                                accept=".pdf,application/pdf"
                                aria-invalid={!!fileError}
                                onChange={(e) => {
                                    setFileError("");
                                    const f = e.target.files?.[0];
                                    if (
                                        f &&
                                        (f.size > 10 * 1024 * 1024 || !f.name.toLowerCase().endsWith(".pdf"))
                                    ) {
                                        setFileError("Selecciona un PDF de hasta 10 MB.");
                                        setFile(null);
                                        e.target.value = "";
                                    } else setFile(f || null);
                                }}
                            />
                        </label>
                    </div>
                    <p>
                        Destinatario efectivo:{" "}
                        <strong>{destination?.correoDestino || "Selecciona un área"}</strong>
                    </p>
                    <Button type="submit">Revisar documento</Button>
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
                        {destination?.modoPrueba ? "Confirmar prueba de correo" : "Confirmar notificación"}
                    </h2>
                </div>
                <div className={styles.dialogBody}>
                    <p>
                        Destinatario: <strong>{destination?.correoDestino}</strong>
                    </p>
                    <p>
                        Expediente: {input?.numeroExpediente} · Archivo: {file?.name}
                    </p>
                    <p>
                        El envío queda registrado en el historial. Revisa que el documento corresponda al
                        expediente.
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
                    <Button state={loading ? "loading" : "default"} onClick={() => void send()}>
                        {destination?.modoPrueba ? "Enviar prueba" : "Enviar notificación"}
                    </Button>
                </div>
            </dialog>
        </section>
    );
};
export default MOD10;
