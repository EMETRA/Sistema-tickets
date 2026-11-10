"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/client/atoms/Button";
import { usePlatform } from "@/platform/context";
import { useModuleActions } from "@/components/client/organisms/ModuleAccessGate/ModuleAccessGate";
import { platformCommand, platformFetch } from "@/platform/client";
import layout from "./PayrollWorkspace.module.scss";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
type Options = {
    tipos: string[];
    maestros: { id: number; descripcion: string; fecha: string }[];
    modo: string;
    remitente: string;
    destinoPrueba: string | null;
    correoConfigurado: boolean;
};
type Preview = {
    hash: string;
    total: number;
    aptos: number;
    excluidos: { empleado: number; motivo: string }[];
    empleados: { empleado: number; nombre: string; correo: string }[];
    modo: string;
    remitente: string;
    destinoPrueba: string | null;
    correoConfigurado: boolean;
    requiereEmpleado: boolean;
};
type Job = {
    id: string;
    tipo: string;
    maestro: number;
    modo: string;
    pendientes: number;
};
type Status = {
    id: string;
    pendientes: number;
    items: { id: string; empleado: number; estado: string; error?: string }[];
};
export function PayrollWorkspace() {
    const { data } = usePlatform(),
        actions = useModuleActions();
    const [options, setOptions] = useState<Options | null>(null),
        [tipo, setTipo] = useState(""),
        [maestro, setMaestro] = useState(""),
        [empleado, setEmpleado] = useState(""),
        [preview, setPreview] = useState<Preview | null>(null),
        [previewPage, setPreviewPage] = useState(0),
        [jobs, setJobs] = useState<Job[]>([]),
        [job, setJob] = useState(""),
        [status, setStatus] = useState<Status | null>(null),
        [busy, setBusy] = useState(false),
        [sending, setSending] = useState(false),
        [error, setError] = useState(""),
        [message, setMessage] = useState(""),
        [pdf, setPdf] = useState(""),
        [reconciliation, setReconciliation] = useState<{
            envio: string;
            resultado: string;
            evidencia: string;
        } | null>(null);
    const pdfDialog = useRef<HTMLDialogElement>(null),
        stop = useRef(false),
        mounted = useRef(true),
        flight = useRef(false);
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
            stop.current = true;
        };
    }, []);
    useEffect(() => {
        if (!pdf) return;
        pdfDialog.current?.showModal();
        return () => URL.revokeObjectURL(pdf);
    }, [pdf]);
    useEffect(() => {
        let active = true;
        platformFetch<Options>(
            "/boletas/options" +
                (tipo ? "?tipo=" + encodeURIComponent(tipo) : ""),
        )
            .then((r) => {
                if (active) setOptions(r);
            })
            .catch((e) => {
                if (active) setError(e.message);
            });
        return () => {
            active = false;
        };
    }, [tipo]);
    async function refreshJobs() {
        setJobs(await platformFetch<Job[]>("/boletas/jobs"));
    }
    useEffect(() => {
        void refreshJobs().catch((e) => setError(e.message));
    }, []);
    const params = () =>
        new URLSearchParams({
            tipo,
            maestro,
            ...(empleado ? { empleado } : {}),
        }).toString();
    function clear() {
        setPreview(null);
        setPreviewPage(0);
        setError("");
        setMessage("");
        setPdf("");
    }
    async function inspect() {
        setBusy(true);
        clear();
        try {
            setPreview(
                await platformFetch<Preview>("/boletas/preview?" + params()),
            );
        } catch (e) {
            setError(e instanceof Error ? e.message : "No se pudo consultar");
        } finally {
            setBusy(false);
        }
    }
    async function authorize() {
        if (!preview || flight.current) return;
        flight.current = true;
        setBusy(true);
        setError("");
        try {
            const r = await platformCommand<{ id: string }>(
                "/boletas/jobs",
                "POST",
                {
                    tipo,
                    maestro: Number(maestro),
                    ...(empleado ? { empleado: Number(empleado) } : {}),
                    hash: preview.hash,
                },
                !!data?.actor.admin,
                `Autorizar ${preview.aptos} boletas · ${preview.modo} · ${preview.destinoPrueba || "correos personales de nómina"}`,
            );
            setJob(r.id);
            setStatus(await platformFetch<Status>("/boletas/jobs/" + r.id));
            setMessage(
                "Lote autorizado. Puedes iniciar el envío y seguir su avance aquí.",
            );
            setPreview(null);
            await refreshJobs();
        } catch (e) {
            setError(e instanceof Error ? e.message : "No se pudo autorizar");
        } finally {
            flight.current = false;
            setBusy(false);
        }
    }
    async function run() {
        if (!job || flight.current) return;
        flight.current = true;
        stop.current = false;
        setSending(true);
        setError("");
        try {
            while (!stop.current) {
                const r = await platformFetch<{
                    procesado: boolean;
                    estado?: string;
                }>("/boletas/jobs/" + job + "/send-next", {
                    method: "POST",
                    body: "{}",
                });
                if (mounted.current)
                    setStatus(
                        await platformFetch<Status>("/boletas/jobs/" + job),
                    );
                if (!r.procesado) break;
                if (r.estado !== "ACEPTADO_SMTP") {
                    setError(
                        "Se detuvo el proceso para revisar un resultado de envío. Los registros pendientes se conservaron.",
                    );
                    break;
                }
            }
            await refreshJobs();
        } catch (e) {
            if (mounted.current)
                setError(
                    e instanceof Error
                        ? e.message
                        : "No se confirmó el resultado. Consulta el lote antes de continuar.",
                );
        } finally {
            flight.current = false;
            if (mounted.current) setSending(false);
        }
    }
    async function openPdf() {
        setBusy(true);
        setError("");
        try {
            const blob = await platformFetch<Blob>("/boletas/pdf?" + params());
            setPdf(URL.createObjectURL(blob));
        } catch (e) {
            setError(
                e instanceof Error ? e.message : "No se pudo generar el PDF",
            );
        } finally {
            setBusy(false);
        }
    }
    async function reconcile() {
        if (!reconciliation) return;
        const { envio, resultado, evidencia } = reconciliation;
        setBusy(true);
        setError("");
        try {
            await platformCommand(
                "/boletas/jobs/" + job + "/reconcile",
                "POST",
                { envio, resultado, evidencia },
                true,
                "Conciliar resultado de boleta " + envio,
            );
            setStatus(await platformFetch<Status>("/boletas/jobs/" + job));
            setReconciliation(null);
            await refreshJobs();
        } catch (e) {
            setError(e instanceof Error ? e.message : "No se pudo conciliar");
        } finally {
            setBusy(false);
        }
    }
    return (
        <section className={styles.page}>
            <header>
                <p className={styles.muted}>
                    Consulta la nómina, revisa el documento y autoriza su envío.
                    Este proceso se ejecuta manualmente y conserva su historial.
                </p>
            </header>
            {error && (
                <p role="alert" className={styles.error}>
                    {error}
                </p>
            )}
            {message && <p role="status">{message}</p>}
            <section className={`${styles.card} ${layout.stack}`}>
                <h3>Seleccionar nómina</h3>
                {options && (
                    <p role="status">
                        <strong>
                            {options.modo === "PRUEBA"
                                ? "Prueba controlada"
                                : "Envío a empleados"}
                        </strong>{" "}
                        · Remitente: {options.remitente}
                        {options.destinoPrueba &&
                            ` · Destinatario exclusivo: ${options.destinoPrueba}`}
                    </p>
                )}
                {options && !options.correoConfigurado && (
                    <p className={styles.error}>
                        Falta configurar el SMTP exclusivo de boletas. Puedes
                        revisar la información y el PDF; el envío permanece
                        bloqueado.
                    </p>
                )}
                <form
                    className={layout.form}
                    onSubmit={(e) => {
                        e.preventDefault();
                        void inspect();
                    }}
                >
                    <label className={styles.field}>
                        Tipo de nómina
                        <select
                            aria-label="Tipo de nómina"
                            className={styles.control}
                            value={tipo}
                            required
                            disabled={sending}
                            onChange={(e) => {
                                setTipo(e.target.value);
                                setMaestro("");
                                clear();
                            }}
                        >
                            <option value="">Seleccionar tipo</option>
                            {options?.tipos.map((t) => (
                                <option key={t}>{t}</option>
                            ))}
                        </select>
                    </label>
                    <label className={styles.field}>
                        Maestro de nómina
                        <select
                            aria-label="Maestro de nómina"
                            className={styles.control}
                            value={maestro}
                            required
                            disabled={sending}
                            onChange={(e) => {
                                setMaestro(e.target.value);
                                clear();
                            }}
                        >
                            <option value="">Seleccionar maestro</option>
                            {options?.maestros.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.id} · {m.descripcion || m.fecha}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className={styles.field}>
                        Código de empleado{" "}
                        {options?.modo === "PRUEBA"
                            ? "(obligatorio para enviar una prueba)"
                            : "(opcional)"}
                        <input
                            aria-label="Código de empleado"
                            className={styles.control}
                            type="number"
                            min="1"
                            value={empleado}
                            disabled={sending}
                            onChange={(e) => {
                                setEmpleado(e.target.value);
                                clear();
                            }}
                        />
                    </label>
                    <Button
                        type="submit"
                        state={
                            busy ? "loading" : sending ? "disabled" : "default"
                        }
                    >
                        Revisar nómina
                    </Button>
                </form>
            </section>
            {preview && (
                <section className={`${styles.card} ${layout.stack}`}>
                    <h3>Revisión antes del envío</h3>
                    <p>
                        {preview.total} empleados · {preview.aptos} boletas
                        aptas · {preview.excluidos.length} excluidos.
                    </p>
                    <p>
                        Modo: <strong>{preview.modo}</strong>.{" "}
                        {preview.destinoPrueba
                            ? `El único destinatario será ${preview.destinoPrueba}.`
                            : "Cada boleta se enviará al correo personal de su empleado."}
                    </p>
                    {preview.requiereEmpleado && (
                        <p>
                            Selecciona un empleado para la primera prueba. No se
                            enviará la nómina completa al buzón de pruebas.
                        </p>
                    )}
                    <div className={styles.tableRegion}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Empleado</th>
                                    <th>Nombre</th>
                                    <th>Destinatario</th>
                                </tr>
                            </thead>
                            <tbody>
                                {preview.empleados
                                    .slice(
                                        previewPage * 25,
                                        (previewPage + 1) * 25,
                                    )
                                    .map((e) => (
                                        <tr key={e.empleado}>
                                            <td>{e.empleado}</td>
                                            <td>{e.nombre}</td>
                                            <td>{e.correo}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                    {preview.empleados.length > 25 && (
                        <p>
                            Revisa los empleados por páginas; también puedes
                            filtrar por código de empleado.
                        </p>
                    )}
                    {preview.empleados.length > 25 && (
                        <div className={styles.toolbar}>
                            <Button
                                variant="outlined"
                                state={
                                    previewPage === 0 ? "disabled" : "default"
                                }
                                onClick={() => setPreviewPage((p) => p - 1)}
                            >
                                Empleados anteriores
                            </Button>
                            <span>
                                Página {previewPage + 1} de{" "}
                                {Math.ceil(preview.empleados.length / 25)}
                            </span>
                            <Button
                                variant="outlined"
                                state={
                                    (previewPage + 1) * 25 >=
                                    preview.empleados.length
                                        ? "disabled"
                                        : "default"
                                }
                                onClick={() => setPreviewPage((p) => p + 1)}
                            >
                                Empleados siguientes
                            </Button>
                        </div>
                    )}
                    {!!preview.excluidos.length && (
                        <details>
                            <summary>Ver exclusiones</summary>
                            <ul>
                                {preview.excluidos.map((e) => (
                                    <li key={e.empleado}>
                                        {e.empleado}:{" "}
                                        {e.motivo.replaceAll("_", " ")}
                                    </li>
                                ))}
                            </ul>
                        </details>
                    )}
                    <div className={styles.toolbar}>
                        <Button
                            variant="outlined"
                            state={!empleado || busy ? "disabled" : "default"}
                            onClick={() => void openPdf()}
                        >
                            Ver PDF de la boleta
                        </Button>
                        <Button
                            state={
                                !actions.INSERTAR ||
                                !preview.correoConfigurado ||
                                !preview.aptos ||
                                preview.requiereEmpleado ||
                                busy
                                    ? "disabled"
                                    : "default"
                            }
                            onClick={() => void authorize()}
                        >
                            Autorizar {preview.aptos} boletas
                        </Button>
                    </div>
                </section>
            )}
            <section className={`${styles.card} ${layout.stack}`}>
                <h3>Lotes y resultados</h3>
                <div className={styles.toolbar}>
                    <label className={styles.field}>
                        Lote
                        <select
                            aria-label="Lote autorizado"
                            className={styles.control}
                            value={job}
                            disabled={sending}
                            onChange={(e) => {
                                const id = e.target.value;
                                setJob(id);
                                setStatus(null);
                                if (id)
                                    void platformFetch<Status>(
                                        "/boletas/jobs/" + id,
                                    )
                                        .then(setStatus)
                                        .catch((e) => setError(e.message));
                            }}
                        >
                            <option value="">Seleccionar lote</option>
                            {jobs.map((j) => (
                                <option key={j.id} value={j.id}>
                                    {j.tipo} / {j.maestro} · {j.modo} ·{" "}
                                    {j.pendientes} pendientes
                                </option>
                            ))}
                        </select>
                    </label>
                    <Button
                        variant="outlined"
                        onClick={() =>
                            void refreshJobs().catch((e) => setError(e.message))
                        }
                    >
                        Actualizar lotes
                    </Button>
                </div>
                {status && (
                    <>
                        <p role="status">
                            {status.pendientes} pendientes ·{" "}
                            {
                                status.items.filter(
                                    (i) => i.estado === "ACEPTADO_SMTP",
                                ).length
                            }{" "}
                            aceptados por SMTP
                        </p>
                        <p className={styles.muted}>
                            Aceptado por SMTP confirma la recepción del servidor
                            de correo. Los resultados inciertos requieren
                            revisión antes de cualquier reenvío.
                        </p>
                        <div className={layout.actions}>
                            <Button
                                state={
                                    !actions.INSERTAR ||
                                    !status.pendientes ||
                                    sending
                                        ? "disabled"
                                        : "default"
                                }
                                onClick={() => void run()}
                            >
                                Enviar boletas autorizadas
                            </Button>
                            {sending && (
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        stop.current = true;
                                    }}
                                >
                                    Pausar después del envío actual
                                </Button>
                            )}
                        </div>
                        <div className={styles.tableRegion}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Empleado</th>
                                        <th>Estado</th>
                                        <th>Diagnóstico</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {status.items.map((i) => (
                                        <tr key={i.id}>
                                            <td>{i.empleado}</td>
                                            <td>
                                                {i.estado.replaceAll("_", " ")}
                                            </td>
                                            <td>
                                                {i.error || "—"}
                                                {data?.actor.admin &&
                                                    [
                                                        "EN_ENVIO",
                                                        "INCIERTO",
                                                        "ERROR_PREPARACION",
                                                    ].includes(i.estado) && (
                                                        <Button
                                                            variant="outlined"
                                                            state={
                                                                busy || sending
                                                                    ? "disabled"
                                                                    : "default"
                                                            }
                                                            onClick={() =>
                                                                setReconciliation(
                                                                    {
                                                                        envio: i.id,
                                                                        resultado:
                                                                            "",
                                                                        evidencia:
                                                                            "",
                                                                    },
                                                                )
                                                            }
                                                        >
                                                            Conciliar envío
                                                        </Button>
                                                    )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </section>
            {reconciliation && (
                <form
                    className={styles.card}
                    onSubmit={(e) => {
                        e.preventDefault();
                        void reconcile();
                    }}
                >
                    <h3>Conciliar resultado del envío</h3>
                    <p>
                        Revisa primero el buzón o el proveedor. Solo «No
                        enviado» habilita otro intento. La decisión requiere
                        doble confirmación y queda en trazabilidad.
                    </p>
                    <label className={styles.field}>
                        Resultado verificado
                        <select
                            aria-label="Resultado verificado"
                            className={styles.control}
                            required
                            value={reconciliation.resultado}
                            onChange={(e) =>
                                setReconciliation({
                                    ...reconciliation,
                                    resultado: e.target.value,
                                })
                            }
                        >
                            <option value="">Seleccionar resultado</option>
                            <option value="ACEPTADO_SMTP">
                                El proveedor confirma que fue aceptado
                            </option>
                            <option value="NO_ENVIADO">
                                Confirmado: no fue enviado
                            </option>
                        </select>
                    </label>
                    <label className={styles.field}>
                        Evidencia de la revisión
                        <textarea
                            className={styles.control}
                            required
                            minLength={20}
                            maxLength={1000}
                            value={reconciliation.evidencia}
                            onChange={(e) =>
                                setReconciliation({
                                    ...reconciliation,
                                    evidencia: e.target.value,
                                })
                            }
                        />
                    </label>
                    <Button
                        type="button"
                        variant="outlined"
                        state={busy ? "disabled" : "default"}
                        onClick={() => setReconciliation(null)}
                    >
                        Cancelar revisión
                    </Button>
                    <Button type="submit" state={busy ? "loading" : "default"}>
                        Revisar conciliación
                    </Button>
                </form>
            )}
            {pdf && (
                <dialog
                    ref={pdfDialog}
                    onCancel={() => setPdf("")}
                    className={styles.dialog}
                    aria-label="Vista previa de boleta"
                >
                    <div className={styles.dialogHeader}>
                        <h3>Boleta de pago · Documento confidencial</h3>
                        <Button variant="outlined" onClick={() => setPdf("")}>
                            Cerrar PDF
                        </Button>
                    </div>
                    <iframe
                        title="Boleta de pago PDF"
                        src={pdf}
                        style={{ width: "100%", height: "65vh", border: 0 }}
                    />
                </dialog>
            )}
        </section>
    );
}
