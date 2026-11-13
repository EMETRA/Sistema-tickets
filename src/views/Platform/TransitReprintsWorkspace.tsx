"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/client/atoms/Button";
import { platformFetch, PlatformError } from "@/platform/client";
import {
    transitSlipPath,
    transitSlipNumber,
    validTransitSlip,
    type TransitSlip,
} from "@/platform/transit-reprints";
import styles from "@/components/client/templates/PlatformPage/PlatformPage.module.scss";
import local from "./TransitReprintsWorkspace.module.scss";
const money = (value: number | null) =>
    value == null
        ? "No disponible"
        : new Intl.NumberFormat("es-GT", {
              style: "currency",
              currency: "GTQ",
          }).format(value);
const failureText = (error: unknown) =>
    (error instanceof Error
        ? error.message
        : "No fue posible consultar la boleta.") +
    (error instanceof PlatformError && error.reference
        ? " Referencia: " + error.reference
        : "");
export function TransitReprintsWorkspace() {
    const [numero, setNumero] = useState(""),
        [slip, setSlip] = useState<TransitSlip | null>(null);
    const [busy, setBusy] = useState(false),
        [pdfBusy, setPdfBusy] = useState(false),
        [error, setError] = useState(""),
        [pdfError, setPdfError] = useState("");
    const [pdf, setPdf] = useState("");
    const current = useRef<AbortController | null>(null),
        documentRequest = useRef<AbortController | null>(null),
        objectUrl = useRef("");
    function clearPdf() {
        if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
        objectUrl.current = "";
        setPdf("");
        setPdfError("");
    }
    useEffect(
        () => () => {
            current.current?.abort();
            documentRequest.current?.abort();
            if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
        },
        [],
    );
    async function consult(event?: FormEvent) {
        event?.preventDefault();
        if (busy || pdfBusy) return;
        let path: string;
        try {
            path = transitSlipPath(numero);
        } catch (error) {
            setError(failureText(error));
            return;
        }
        current.current?.abort();
        documentRequest.current?.abort();
        const controller = new AbortController();
        current.current = controller;
        setBusy(true);
        setError("");
        setSlip(null);
        clearPdf();
        try {
            const data = await platformFetch<TransitSlip>(path, {
                signal: AbortSignal.any([
                    controller.signal,
                    AbortSignal.timeout(40000),
                ]),
            });
            if (controller.signal.aborted) return;
            if (
                !validTransitSlip(data) ||
                data.numero !== transitSlipNumber(numero)
            )
                throw Error(
                    "El servicio devolvió una boleta diferente o incompleta.",
                );
            setSlip(data);
        } catch (error) {
            if (!controller.signal.aborted) setError(failureText(error));
        } finally {
            if (current.current === controller) setBusy(false);
        }
    }
    async function preview() {
        if (!slip || busy || pdfBusy) return;
        documentRequest.current?.abort();
        const controller = new AbortController();
        documentRequest.current = controller;
        setPdfBusy(true);
        setPdfError("");
        try {
            const blob = await platformFetch<Blob>(
                transitSlipPath(slip.numero, true),
                {
                    signal: AbortSignal.any([
                        controller.signal,
                        AbortSignal.timeout(40000),
                    ]),
                },
            );
            if (controller.signal.aborted) return;
            if (
                !(blob instanceof Blob) ||
                !/^application\/pdf(?:;|$)/i.test(blob.type) ||
                (await blob.slice(0, 5).text()) !== "%PDF-"
            )
                throw Error("El servicio no devolvió un PDF válido.");
            if (controller.signal.aborted) return;
            clearPdf();
            objectUrl.current = URL.createObjectURL(blob);
            setPdf(objectUrl.current);
        } catch (error) {
            if (!controller.signal.aborted) setPdfError(failureText(error));
        } finally {
            if (documentRequest.current === controller) setPdfBusy(false);
        }
    }
    return (
        <div className={styles.page}>
            <section
                className={styles.card}
                aria-labelledby="reimpresion-buscar"
            >
                <h2 id="reimpresion-buscar">Buscar boleta de tránsito</h2>
                <p className={styles.muted}>
                    Consulta una boleta existente de la serie N para revisar sus
                    datos y obtener su reimpresión.
                </p>
                <form className={local.search} onSubmit={consult}>
                    <div className={styles.field}>
                        <label htmlFor="reimpresion-numero">
                            Número de boleta
                        </label>
                        <input
                            id="reimpresion-numero"
                            className={styles.control}
                            value={numero}
                            onChange={(event) => {
                                setNumero(event.target.value);
                                setSlip(null);
                                setError("");
                                clearPdf();
                            }}
                            placeholder="N-1234567"
                            autoComplete="off"
                            maxLength={20}
                            disabled={busy || pdfBusy}
                            aria-describedby="reimpresion-ayuda"
                            required
                        />
                        <span id="reimpresion-ayuda" className={styles.muted}>
                            Puedes escribir el número o pegar el código completo
                            N-1234567.
                        </span>
                    </div>
                    <Button
                        type="submit"
                        state={
                            busy ? "loading" : pdfBusy ? "disabled" : "default"
                        }
                    >
                        Consultar boleta
                    </Button>
                </form>
                {error && (
                    <div role="alert" className={styles.error}>
                        {error}
                        <div>
                            <Button
                                variant="outlined"
                                onClick={() => void consult()}
                                state={busy ? "disabled" : "default"}
                            >
                                Reintentar consulta
                            </Button>
                        </div>
                    </div>
                )}
            </section>
            {slip && (
                <section
                    className={styles.card}
                    aria-labelledby="reimpresion-datos"
                >
                    <div className={styles.toolbar}>
                        <div>
                            <p className={styles.muted}>
                                SERIE N · CIUDAD DE GUATEMALA
                            </p>
                            <h2 id="reimpresion-datos">
                                Boleta N-{slip.numero}
                            </h2>
                            <p className={local.plate}>
                                {slip.tipoPlaca} -{" "}
                                {slip.placa || "Placa no registrada"}
                            </p>
                        </div>
                        <Button
                            onClick={() => void preview()}
                            state={
                                pdfBusy
                                    ? "loading"
                                    : busy
                                      ? "disabled"
                                      : "default"
                            }
                        >
                            {pdf
                                ? "Actualizar PDF"
                                : "Ver PDF para reimpresión"}
                        </Button>
                    </div>
                    <div className={local.details}>
                        <dl>
                            <dt>Fecha de imposición</dt>
                            <dd>{slip.fecha}</dd>
                            <dt>Vehículo</dt>
                            <dd>
                                {[slip.marca, slip.color, slip.modelo]
                                    .filter(Boolean)
                                    .join(" · ") || "No registrado"}
                            </dd>
                            <dt>Lugar</dt>
                            <dd>{slip.lugar || "No registrado"}</dd>
                        </dl>
                        <dl>
                            <dt>Conductor / infractor</dt>
                            <dd>
                                {[slip.nombres, slip.apellidos]
                                    .filter(Boolean)
                                    .join(" ") || "No registrado"}
                            </dd>
                            <dt>Licencia</dt>
                            <dd>
                                {[slip.tipoLicencia, slip.licencia]
                                    .filter(Boolean)
                                    .join("-") || "No registrada"}
                            </dd>
                            <dt>Agente</dt>
                            <dd>
                                {slip.agente || "Nombre no disponible"} · Chapa{" "}
                                {slip.chapa || "no registrada"}
                            </dd>
                        </dl>
                        <dl>
                            <dt>Importe de la infracción</dt>
                            <dd>{money(slip.montoOriginal)}</dd>
                            <dt>Saldo de referencia</dt>
                            <dd>{money(slip.saldoActual)}</dd>
                        </dl>
                    </div>
                    {slip.observaciones && (
                        <p>
                            <strong>Observaciones: </strong>
                            {slip.observaciones}
                        </p>
                    )}
                    <div className={styles.tableRegion}>
                        <table className={styles.table}>
                            <caption className={local.caption}>
                                Artículos registrados en la boleta
                            </caption>
                            <thead>
                                <tr>
                                    <th scope="col">Artículo</th>
                                    <th scope="col">Descripción</th>
                                    <th scope="col">Importe</th>
                                </tr>
                            </thead>
                            <tbody>
                                {slip.reglas.map((rule, index) => (
                                    <tr key={rule.regla + "-" + index}>
                                        <td>
                                            {rule.articulo || rule.regla}
                                            {rule.numeral
                                                ? " - " + rule.numeral
                                                : ""}
                                        </td>
                                        <td>
                                            {rule.descripcion ||
                                                "Sin descripción registrada"}
                                        </td>
                                        <td>{money(rule.monto)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {pdfError && (
                        <div className={styles.error} role="alert">
                            {pdfError}
                            <div>
                                <Button
                                    onClick={() => void preview()}
                                    state={pdfBusy ? "loading" : "default"}
                                    variant="outlined"
                                >
                                    Reintentar PDF
                                </Button>
                            </div>
                        </div>
                    )}
                </section>
            )}
            {pdf && slip && (
                <section
                    className={styles.card}
                    aria-labelledby="reimpresion-preview"
                >
                    <div className={styles.toolbar}>
                        <h2 id="reimpresion-preview">
                            Vista previa de la reimpresión
                        </h2>
                        <div className={styles.actions}>
                            <a
                                href={pdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={local.link}
                            >
                                Abrir PDF para imprimir
                            </a>
                            <a
                                href={pdf}
                                download={"boleta-N-" + slip.numero + ".pdf"}
                                className={local.link}
                            >
                                Descargar PDF
                            </a>
                            <Button variant="outlined" onClick={clearPdf}>
                                Cerrar vista previa
                            </Button>
                        </div>
                    </div>
                    <iframe
                        className={local.preview}
                        title={"Vista previa boleta N-" + slip.numero}
                        src={pdf}
                    />
                </section>
            )}
        </div>
    );
}
