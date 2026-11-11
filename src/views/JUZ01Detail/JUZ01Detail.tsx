"use client";

import React, { useState, useEffect, useRef } from "react";
import classNames from "classnames";
import { AnalisisEvidencias } from "./AnalisisEvidencias";
import { EvidenciasCaso } from "./EvidenciasCaso";
import { Title } from "@/components/client/atoms/Title";
import { Text } from "@/components/client/atoms/Text";
import { Button } from "@/components/client/atoms/Button";
import { File } from "@/components/client/atoms/File";
import { ButtonTab } from "@/components/client/atoms/ButtonTab";
import { FormField } from "@/components/client/molecules/FormField";
import { PopUp } from "@/components/client/molecules/PopUp";

import styles from "./JUZ01Detail.module.scss";
import { JUZ01DetailProps } from "./types";
import { useRouter } from "next/navigation";
import { TextArea } from "@/components/client/atoms/TextArea";
import { Select } from "@/components/client/atoms/Select";
import { Input } from "@/components/client/atoms/Input";
import { useAuthStore } from "@/store/useAuthStore";
import {
    consultarCasoJuzgado,
    consultarSedesJuzgado,
    recibirCasoJuzgado,
    resolverCasoJuzgado,
    registrarGestionJuzgado,
    generarDocumentoJuzgado,
    descargarArchivoJuzgado,
    idSolicitudJuzgado,
    mensajeJuzgado,
    type DetalleJuzgado,
    type SedeJuzgado,
    type RecepcionInput,
    type ResolucionInput,
    type GestionInput,
} from "@/api/graphql/juzgado";
import { estadoCasoJuzgado, mapearCasoJuzgado } from "@/api/graphql/juzgado-vista";

type Case = ReturnType<typeof mapearCasoJuzgado>;
const JUZ01Detail: React.FC<JUZ01DetailProps> = ({ caseNumber }) => {
    const [currentCase, setCurrentCase] = useState<Case | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<{ message: string } | null>(null); // Error al cargar el caso
    const [errorSendResolution, setErrorSendResolution] = useState<{
    message: string;
  } | null>(null); // Error al enviar la resolución
    const router = useRouter();

    const [showConfirmReceiptModal, setShowConfirmReceiptModal] = useState(false);
    const [showSendResolutionModal, setShowSendResolutionModal] = useState(false);
    const [showResolveDefense, setShowResolveDefense] = useState(false);
    const [resolveCaseValue, setResolveCaseValue] = useState("acogido");
    const [fundament, setFundament] = useState("");
    const [isSendingResolution, setIsSendingResolution] = useState(false);

    const permisos = useAuthStore((state) => state.user)?.permisos || [];
    const [detalle, setDetalle] = useState<DetalleJuzgado | null>(null);
    const [sedes, setSedes] = useState<SedeJuzgado[]>([]);
    const [sede, setSede] = useState("");
    const [errorSedes, setErrorSedes] = useState<string | null>(null);
    const [cargandoSedes, setCargandoSedes] = useState(false);
    const [catalogoVersion, setCatalogoVersion] = useState(0);
    const [numeroInterno, setNumeroInterno] = useState("");
    const [observacion, setObservacion] = useState("");
    const [gestionTipo, setGestionTipo] = useState("REVISION");
    const [gestionNota, setGestionNota] = useState("");
    const [busy, setBusy] = useState(false);
    const [aviso, setAviso] = useState<string | null>(null);
    const [consultaVersion, setConsultaVersion] = useState(0);
    const enCurso = useRef(false);
    const recepcionPendiente = useRef<RecepcionInput | null>(null);
    const resolucionPendiente = useRef<{
    decision: "ACOGIDA" | "NO_ACOGIDA";
    input: ResolucionInput;
  } | null>(null);
    const gestionPendiente = useRef<GestionInput | null>(null);
    const puedeConsultar = permisos.includes("VIVI_JUZGADO_CONSULTAR");
    const puedeRecibir =
    !!detalle &&
    !detalle.expediente &&
    ["REGISTRADA", "PENDIENTE_CORREO", "NOTIFICADA", "DEFENSA_WEB"].includes(
        detalle.estadoCaso,
    ) &&
    permisos.includes("VIVI_JUZGADO_RECIBIR");
    const puedeResolver =
    detalle?.estadoCaso === "EN_JUZGADO" &&
    !!detalle.expediente &&
    ["RECIBIDO", "EN_REVISION"].includes(detalle.expediente.estado) &&
    permisos.includes("VIVI_JUZGADO_RESOLVER");

    async function recargar() {
        const data = await consultarCasoJuzgado(caseNumber);
        setDetalle(data);
        setCurrentCase(mapearCasoJuzgado(data));
        return data;
    }
    useEffect(() => {
        let activo = true;
        setIsLoading(true);
        setError(null);
        setCurrentCase(null);
        setDetalle(null);
        setSede("");
        recepcionPendiente.current = null;
        resolucionPendiente.current = null;
        gestionPendiente.current = null;
        void (async () => {
            if (!puedeConsultar) throw new Error("Sin permiso");
            const data = await consultarCasoJuzgado(caseNumber);
            if (activo) {
                setDetalle(data);
                setCurrentCase(mapearCasoJuzgado(data));
            }
        })()
            .catch((e) => {
                if (activo)
                    setError({
                        message: puedeConsultar
                            ? mensajeJuzgado(e)
                            : "Tu cuenta no tiene permiso para consultar casos del juzgado.",
                    });
            })
            .finally(() => {
                if (activo) setIsLoading(false);
            });
        return () => {
            activo = false;
        };
    }, [caseNumber, puedeConsultar, consultaVersion]);

    useEffect(() => {
        let activo = true;
        setSedes([]);
        setErrorSedes(null);
        if (!puedeRecibir) {
            setCargandoSedes(false);
            return;
        }
        setCargandoSedes(true);
        void consultarSedesJuzgado()
            .then((disponibles) => {
                if (activo) {
                    setSedes(disponibles);
                    setSede((actual) => disponibles.some((item) => item.codigo === actual)
                        ? actual
                        : disponibles.length === 1 ? disponibles[0].codigo : "");
                }
            })
            .catch((e) => {
                if (activo) setErrorSedes(mensajeJuzgado(e));
            })
            .finally(() => {
                if (activo) setCargandoSedes(false);
            });
        return () => {
            activo = false;
        };
    }, [puedeRecibir, caseNumber, catalogoVersion]);
    const sedeElegida = sedes.find((item) => item.codigo === sede);

    const falloArchivo = (e: unknown) => setAviso(mensajeJuzgado(e));
    async function ejecutar(
        accion: () => Promise<unknown>,
        confirmar?: () => void,
        contexto: "actuacion" | "documento" = "actuacion",
    ) {
        if (enCurso.current) return;
        enCurso.current = true;
        setBusy(true);
        setAviso(null);
        setErrorSendResolution(null);
        try {
            await accion();
            confirmar?.();
            try {
                await recargar();
            } catch {
                setAviso(
                    "La operación fue confirmada, pero no se pudo actualizar la vista. Consulta el estado actual del caso.",
                );
            }
        } catch (e) {
            setAviso(mensajeJuzgado(e, contexto));
        } finally {
            enCurso.current = false;
            setBusy(false);
            setIsSendingResolution(false);
        }
    }
    async function actualizarEstado() {
        if (enCurso.current) return;
        enCurso.current = true;
        setBusy(true);
        setAviso(null);
        try {
            const data = await recargar();
            if (data.expediente) recepcionPendiente.current = null;
            if (data.expediente?.resolucion) resolucionPendiente.current = null;
        } catch (error) {
            setAviso(mensajeJuzgado(error));
        } finally {
            enCurso.current = false;
            setBusy(false);
        }
    }
    const handleConfirmReceipt = () => {
        if (!puedeRecibir || !sede || cargandoSedes || errorSedes || !sedeElegida) {
            setAviso("Selecciona un juzgado activo para confirmar la recepción.");
            return;
        }
        setShowConfirmReceiptModal(false);
        recepcionPendiente.current ||= {
            codigoCaso: caseNumber,
            codigoJuzgado: sede,
            requestId: idSolicitudJuzgado(),
            numeroInterno: numeroInterno.trim() || undefined,
            observacion: observacion.trim() || undefined,
        };
        void ejecutar(() => recibirCasoJuzgado(recepcionPendiente.current!));
    };
    const handleSendResolution = () => {
        if (!puedeResolver || !detalle?.expediente || !fundament.trim()) {
            setAviso("El fundamento es requerido para emitir la resolución.");
            setShowSendResolutionModal(false);
            return;
        }
        setShowSendResolutionModal(false);
        setIsSendingResolution(true);
        resolucionPendiente.current ||= {
            decision: resolveCaseValue === "acogido" ? "ACOGIDA" : "NO_ACOGIDA",
            input: {
                idExpediente: detalle.expediente.id,
                fundamento: fundament.trim(),
                requestId: idSolicitudJuzgado(),
                claveIdempotencia: idSolicitudJuzgado(),
                versionExpediente: detalle.expediente.version || undefined,
            },
        };
        const pendiente = resolucionPendiente.current;
        void ejecutar(
            async () => {
                const resultado = await resolverCasoJuzgado(
                    pendiente.decision,
                    pendiente.input,
                );
                if (resultado.estadoDocumento === "ERROR_REINTENTABLE")
                    setAviso(
                        "La resolución fue confirmada. El PDF está pendiente por un error recuperable; reintenta solo el documento.",
                    );
            },
            () => setShowResolveDefense(false),
        );
    };
    const handleGestion = () => {
        if (!puedeResolver || !detalle?.expediente || !gestionNota.trim()) {
            setAviso("Escribe una observación para registrar la actuación.");
            return;
        }
        gestionPendiente.current ||= {
            idExpediente: detalle.expediente.id,
            tipoGestion: gestionTipo,
            observacion: gestionNota.trim(),
            requestId: idSolicitudJuzgado(),
        };
        void ejecutar(
            () => registrarGestionJuzgado(gestionPendiente.current!),
            () => {
                gestionPendiente.current = null;
                setGestionNota("");
            },
        );
    };

    if (isLoading) {
        return (
            <div className={classNames(styles.mainContainer, styles.loading)}>
                <Text variant="body">Cargando caso...</Text>
            </div>
        );
    }

    if (error) {
        return (
            <div className={classNames(styles.mainContainer, styles.error)}>
                <Text variant="body">{error.message}</Text>
                {puedeConsultar && (
                    <Button onClick={() => setConsultaVersion((v) => v + 1)}>
                        Reintentar consulta
                    </Button>
                )}
                <Button variant="contained" onClick={() => router.back()}>
                    Volver
                </Button>
            </div>
        );
    }

    if (!currentCase) {
        return (
            <div className={classNames(styles.mainContainer, styles.notFound)}>
                <Text variant="body">No se encontró el caso</Text>
                <Button variant="contained" onClick={() => router.back()}>
                    Volver
                </Button>
            </div>
        );
    }

    return (
        <div className={styles.mainContainer}>
            <header className={styles.caseHero}>
                <div className={styles.heroTop}>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className={styles.backLink}
                    >
                        ← Volver a casos
                    </button>
                    <span>Juzgado de tránsito · Avísame</span>
                </div>
                <div className={styles.heroTitle}>
                    <div>
                        <p className={styles.eyebrow}>Consulta del caso</p>
                        <h1>{currentCase.placa}</h1>
                        <p>{currentCase.title}</p>
                    </div>
                    <div className={styles.statusPill}>
                        {estadoCasoJuzgado(currentCase.status)}
                    </div>
                </div>
                <dl className={styles.caseMeta}>
                    <div>
                        <dt>Código de caso</dt>
                        <dd>{currentCase.caseNumber}</dd>
                    </div>
                    <div>
                        <dt>Registrado</dt>
                        <dd>{currentCase.caseDate}</dd>
                    </div>
                    <div>
                        <dt>Juzgado receptor</dt>
                        <dd>{currentCase.place}</dd>
                    </div>
                </dl>
            </header>
            <nav className={styles.caseNav} aria-label="Secciones del caso">
                <a href="#denuncia">Denuncia y evidencias</a>
                <a href="#analisis-ia">Análisis IA</a>
                <a href="#defensa">Defensa</a>
                <a href="#gestion-expediente">Recepción y resolución</a>
                <a href="#actuaciones">Actuaciones</a>
            </nav>

            <div className={styles.reviewGrid}>
                <div className={styles.evidenceColumn}>
                    <section
                        id="denuncia"
                        className={styles.sectionCard}
                        aria-labelledby="titulo-denuncia"
                    >
                        <div className={styles.sectionHeading}>
                            <div>
                                <span className={styles.eyebrow}>Hecho reportado</span>
                                <h2 id="titulo-denuncia">Denuncia y evidencias originales</h2>
                            </div>
                            <span className={styles.countBadge}>
                                {currentCase.denuncia.evidencias.length} archivos
                            </span>
                        </div>
                        <p className={styles.description}>
                            {currentCase.denuncia.descripción}
                        </p>
                        <EvidenciasCaso archivos={currentCase.denuncia.evidencias} />
                    </section>
                    <section
                        id="defensa"
                        className={styles.sectionCard}
                        aria-labelledby="titulo-defensa"
                    >
                        <div className={styles.sectionHeading}>
                            <div>
                                <span className={styles.eyebrow}>
                                    Versión de la persona notificada
                                </span>
                                <h2 id="titulo-defensa">Defensa presentada</h2>
                            </div>
                        </div>
                        {currentCase.defensa ? (
                            <>
                                <p className={styles.defenseAuthor}>
                                    {currentCase.defensa.nombreDeclarado}
                                </p>
                                <p className={styles.description}>
                                    {currentCase.defensa.argumentos}
                                </p>
                                <EvidenciasCaso archivos={currentCase.defensa.evidencias} />
                            </>
                        ) : (
                            <p className={styles.emptyState}>
                                No hay una defensa web registrada. La recepción de papelería
                                física se consulta en el expediente.
                            </p>
                        )}
                    </section>
                </div>
                <div className={styles.analysisColumn}>
                    <AnalisisEvidencias analisis={detalle?.caso.analisisEvidencias} />
                </div>
            </div>
            <section id="gestion-expediente" className={styles.workflowSection} aria-labelledby="titulo-gestion">
                <header className={styles.workflowToolbar}>
                    <div>
                        <span className={styles.eyebrow}>Gestión del expediente</span>
                        <h2 id="titulo-gestion">Recepción y resolución</h2>
                    </div>
                    <Button type="button" variant="outlined" state={busy ? "disabled" : "default"} onClick={() => void actualizarEstado()}>
                        {busy ? "Actualizando…" : "Actualizar estado"}
                    </Button>
                </header>
                {aviso && <div className={styles.workflowNotice} role="alert">{aviso}</div>}
                <div className={styles.workflowGrid}>
                    {detalle?.expediente && (
                        <section
                            className={styles.juzgadoInfo}
                            aria-label="Datos del juzgado"
                        >
                            <Title variant="mid">Juzgado receptor</Title>
                            <Text variant="body">
                                {detalle.expediente.nombreJuzgado} ·{" "}
                                {detalle.expediente.codigoJuzgado}
                            </Text>
                            <Text variant="body">
                                <strong>Dirección:</strong>{" "}
                                {detalle.expediente.direccionJuzgado || "No registrada"}
                            </Text>
                            <Text variant="body">
                                <strong>Horario:</strong>{" "}
                                {detalle.expediente.horarioJuzgado || "No registrado"}
                            </Text>
                            <Text variant="body">
                                <strong>Referencia interna del expediente:</strong>{" "}
                                {detalle.expediente.numeroInterno || "Sin asignar"}
                            </Text>
                            <Text variant="caption">
                                Recepción:{" "}
                                {new Date(detalle.expediente.recibidaEn).toLocaleString("es-GT", {
                                    timeZone: "America/Guatemala",
                                })}{" "}
                                · Estado: {detalle.expediente.estado}
                            </Text>
                        </section>
                    )}
                    {(puedeRecibir || puedeResolver) && !showResolveDefense ? (
                        <section
                            className={classNames(styles.sectionCard, styles.actions)}
                            aria-label="Acciones del expediente"
                        >
                            <div className={styles.sectionHeading}>
                                <div>
                                    <span className={styles.eyebrow}>Acción pendiente</span>
                                    <h2>{puedeRecibir ? "Recepción de papelería" : "Resolución del expediente"}</h2>
                                </div>
                            </div>
                            {puedeRecibir ? (
                                <>
                                    <p className={styles.sectionDescription}>
                                        Registra la entrega física de la papelería para abrir el expediente y continuar su revisión.
                                    </p>
                                    {cargandoSedes ? (
                                        <div role="status" className={styles.catalogNotice}>
                                            <h3>Cargando juzgados</h3>
                                            <p>Estamos comprobando dónde puedes registrar la recepción.</p>
                                        </div>
                                    ) : errorSedes ? (
                                        <div role="alert" className={styles.catalogNotice} data-state="error">
                                            <h3>No se pudo cargar el catálogo de juzgados</h3>
                                            <p>{errorSedes}</p>
                                            <Button type="button" variant="outlined" onClick={() => setCatalogoVersion((v) => v + 1)}>
                                                Reintentar juzgados
                                            </Button>
                                        </div>
                                    ) : !sedes.length ? (
                                        <div role="status" className={styles.catalogNotice} data-state="empty">
                                            <h3>La recepción está pendiente de configuración</h3>
                                            <p>No hay juzgados activos configurados. Solicita que se habilite un juzgado para registrar la recepción.</p>
                                            <p>Puedes continuar revisando las evidencias y el estado del caso.</p>
                                            <Button type="button" variant="outlined" onClick={() => setCatalogoVersion((v) => v + 1)}>
                                                Actualizar juzgados
                                            </Button>
                                        </div>
                                    ) : (
                                        <form className={classNames(styles.resolveCaseForm, styles.receiptForm)} onSubmit={(event) => {
                                            event.preventDefault();
                                            if (!busy && sedeElegida) setShowConfirmReceiptModal(true);
                                        }}>
                                            <FormField label="Juzgado receptor" htmlFor="juzgado" required>
                                                <Select
                                                    id="juzgado"
                                                    options={sedes.map((s) => ({ value: s.codigo, label: s.nombre }))}
                                                    placeholder="Selecciona un juzgado"
                                                    value={sede}
                                                    onChange={(event) => setSede(event.target.value)}
                                                    disabled={busy || !!recepcionPendiente.current}
                                                    required
                                                />
                                            </FormField>
                                            <FormField label="Referencia interna del expediente (opcional)" htmlFor="numeroInterno">
                                                <Input
                                                    id="numeroInterno"
                                                    aria-describedby="numeroInternoAyuda"
                                                    placeholder="Referencia asignada por el juzgado"
                                                    value={numeroInterno}
                                                    onChange={(event) => setNumeroInterno(event.target.value)}
                                                    maxLength={80}
                                                    disabled={busy || !!recepcionPendiente.current}
                                                />
                                                <p id="numeroInternoAyuda" className={styles.ayuda}>
                                                    Referencia del expediente físico. Puedes dejarla vacía si aún no se ha asignado.
                                                </p>
                                            </FormField>
                                            {sedeElegida && (
                                                <dl className={classNames(styles.courtPreview, styles.formWide)}>
                                                    <div><dt>Dirección</dt><dd>{sedeElegida.direccion || "No registrada"}</dd></div>
                                                    <div><dt>Horario de atención</dt><dd>{sedeElegida.horario || "No registrado"}</dd></div>
                                                </dl>
                                            )}
                                            <FormField className={styles.formWide} label="Observación (opcional)" htmlFor="observacion">
                                                <TextArea
                                                    id="observacion"
                                                    value={observacion}
                                                    onChange={(event) => setObservacion(event.target.value)}
                                                    maxLength={2000}
                                                    disabled={busy || !!recepcionPendiente.current}
                                                />
                                            </FormField>
                                            <div className={classNames(styles.formFooter, styles.formWide)}>
                                                <p className={styles.ayuda}>Revisa los datos. Se solicitará confirmación antes de guardar.</p>
                                                <Button type="submit" variant="contained" state={busy || !sedeElegida ? "disabled" : "default"}>
                                                    Confirmar recepción de papelería
                                                </Button>
                                            </div>
                                        </form>
                                    )}
                                </>
                            ) : puedeResolver ? (
                                <Button
                                    variant="contained"
                                    state={busy ? "disabled" : "default"}
                                    onClick={() => setShowResolveDefense(true)}
                                >
                                    Resolver defensa
                                </Button>
                            ) : (
                                <Text variant="body">No hay acciones disponibles</Text>
                            )}
                        </section>
                    ) : (
                        !showResolveDefense && (
                            <section
                                className={classNames(styles.sectionCard, styles.resolution)}
                                aria-label="Resolución del caso"
                            >
                                {currentCase.resolucion ? (
                                    <>
                                        <Title variant="mid">
                                            Resolución - {currentCase.resolucion?.id}
                                        </Title>
                                        <Text variant="caption">{currentCase.resolucion?.fecha}</Text>
                                        <Text variant="body">
                                            {currentCase.resolucion?.comentario}
                                        </Text>
                                        <Text variant="caption">
                                            Plantilla: {currentCase.resolucion.plantilla} (borrador
                                            técnico)
                                        </Text>
                                        {currentCase.resolucion.file ? (
                                            <File
                                                id={currentCase.resolucion.file.id}
                                                name={currentCase.resolucion.file.name}
                                                onClick={() => {
                                                    void descargarArchivoJuzgado(
                                                        "documentos",
                          currentCase.resolucion!.file!.id,
                          currentCase.resolucion!.file!.name,
                                                    ).catch(falloArchivo);
                                                }}
                                                download
                                            />
                                        ) : (
                                            <>
                                                <Text variant="body">
                                                    El documento de resolución no está disponible.
                                                </Text>
                                                {permisos.includes("VIVI_JUZGADO_RESOLVER") && (
                                                    <Button
                                                        state={busy ? "disabled" : "default"}
                                                        onClick={() => {
                                                            void ejecutar(
                                                                () => generarDocumentoJuzgado(currentCase.resolucion!.id),
                                                                undefined,
                                                                "documento",
                                                            );
                                                        }}
                                                    >
                                                        Reintentar PDF de resolución
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <h2>{detalle?.expediente ? "Pendiente de resolución" : "Pendiente de recepción"}</h2>
                                        <p className={styles.sectionDescription}>{detalle?.expediente
                                            ? "El expediente está disponible para su revisión por la autoridad autorizada."
                                            : "La papelería aún no tiene una recepción registrada en un juzgado."}</p>
                                    </>
                                )}
                                {currentCase.multa && (
                                    <div className={styles.remissionContainer}>
                                        <Title variant="mid" className={styles.title}>
                                            Remisión
                                        </Title>
                                        <div className={styles.remissionData}>
                                            <div className={styles.remissionDataItem}>
                                                <Text variant="body">
                                                    <strong>Ciudad</strong>
                                                </Text>
                                                <Text variant="body">{currentCase.multa.ciudad}</Text>
                                            </div>
                                            <div className={styles.remissionDataItem}>
                                                <Text variant="body">
                                                    <strong>Serie</strong>
                                                </Text>
                                                <Text variant="body">{currentCase.multa.serie}</Text>
                                            </div>
                                            <div className={styles.remissionDataItem}>
                                                <Text variant="body">
                                                    <strong>Número</strong>
                                                </Text>
                                                <Text variant="body">{currentCase.multa.numero}</Text>
                                            </div>
                                            <div className={styles.remissionDataItem}>
                                                <Text variant="body">
                                                    <strong>Placa</strong>
                                                </Text>
                                                <Text variant="body">{currentCase.multa.placa}</Text>
                                            </div>
                                        </div>
                                        <Text variant="body">
                                            El importe y la disponibilidad de pago se consultan en el
                                            sistema institucional.
                                        </Text>
                                    </div>
                                )}
                            </section>
                        )
                    )}
                    {puedeResolver && (
                        <div
                            className={classNames(styles.sectionCard, styles.resolveCaseForm)}
                        >
                            <Title variant="mid">Registrar actuación</Title>
                            <Select
                                options={[
                                    { value: "REVISION", label: "Revisión" },
                                    { value: "ENTREGA_DOCUMENTOS", label: "Entrega de documentos" },
                                    { value: "INCIDENCIA", label: "Incidencia" },
                                ]}
                                value={gestionTipo}
                                onChange={(e) => setGestionTipo(e.target.value)}
                                disabled={busy || !!gestionPendiente.current}
                                aria-label="Tipo de actuación"
                            />
                            <TextArea
                                value={gestionNota}
                                onChange={(e) => setGestionNota(e.target.value)}
                                maxLength={2000}
                                disabled={busy || !!gestionPendiente.current}
                                aria-label="Observación de la actuación"
                            />
                            <Button
                                onClick={handleGestion}
                                state={busy ? "disabled" : "default"}
                            >
                                Registrar actuación
                            </Button>
                        </div>
                    )}
                    {showResolveDefense && puedeResolver && (
                        <section
                            className={classNames(styles.sectionCard, styles.resolutionEditor)}
                            aria-label="Resolver defensa"
                        >
                            <Title variant="large">Resolver</Title>
                            <div className={styles.resolveCaseForm}>
                                <ButtonTab
                                    options={[
                                        { label: "Acogido", value: "acogido" },
                                        { label: "No acogido", value: "no_acogido" },
                                    ]}
                                    value={resolveCaseValue}
                                    onChange={(value) => {
                                        if (!resolucionPendiente.current && !busy)
                                            setResolveCaseValue(value);
                                    }}
                                />
                                <FormField
                                    label="Fundamento"
                                    htmlFor="fundament"
                                    required
                                    className={styles.fundamentFormField}
                                >
                                    <TextArea
                                        id="fundament"
                                        value={fundament}
                                        maxLength={12000}
                                        disabled={busy || !!resolucionPendiente.current}
                                        onInput={(e) => {
                                            const el = e.currentTarget;
                                            el.style.height = "auto";
                                            el.style.height = `${el.scrollHeight}px`;
                                        }}
                                        className={styles.fundamentTextArea}
                                        onChange={(e) => setFundament(e.target.value)}
                                    />
                                </FormField>
                                <Button
                                    variant="contained"
                                    color="default"
                                    onClick={() => setShowSendResolutionModal(true)}
                                    className={styles.executeButton}
                                    state={busy || isSendingResolution ? "disabled" : "default"}
                                >
                                    {isSendingResolution
                                        ? "Enviando resolución..."
                                        : "Enviar resolución"}
                                </Button>
                            </div>
                        </section>
                    )}
                </div>
            </section>
            <section
                id="actuaciones"
                className={styles.sectionCard}
                aria-labelledby="titulo-actuaciones"
            >
                <div className={styles.sectionHeading}>
                    <div>
                        <span className={styles.eyebrow}>Seguimiento del expediente</span>
                        <h2 id="titulo-actuaciones">Bitácora de actuaciones</h2>
                    </div>
                    <span className={styles.countBadge}>
                        {currentCase.logs.length === 1 ? "1 actuación" : `${currentCase.logs.length} actuaciones`}
                    </span>
                </div>
                {!currentCase.logs.length ? (
                    <div className={styles.historyEmpty}>
                        <span aria-hidden="true" className={styles.historyEmptyIcon}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                <circle cx="12" cy="12" r="8" />
                                <path d="M12 7v5l3 2" />
                            </svg>
                        </span>
                        <div>
                            <h3>Aún no hay actuaciones registradas</h3>
                            <p>Las revisiones, entregas de documentos e incidencias aparecerán aquí cuando se registren en el expediente.</p>
                        </div>
                    </div>
                ) : (
                    <table className={styles.historyTable}>
                        <caption className={styles.srOnly}>Actuaciones registradas en el expediente</caption>
                        <thead><tr>
                            <th scope="col">Actuación</th>
                            <th scope="col">Fecha</th>
                            <th scope="col">Registrada por</th>
                            <th scope="col">Observación</th>
                        </tr></thead>
                        <tbody>{currentCase.logs.map((log, index) => (
                            <tr key={index}>
                                <td data-label="Actuación"><strong>{log.action.replaceAll("_", " ")}</strong></td>
                                <td data-label="Fecha">{log.date}</td>
                                <td data-label="Registrada por">{log.userName}</td>
                                <td data-label="Observación">{log.note}</td>
                            </tr>
                        ))}</tbody>
                    </table>
                )}
            </section>
            <PopUp
                isOpen={showConfirmReceiptModal}
                onClose={() => setShowConfirmReceiptModal(false)}
                title="Confirmar recepción de denuncia"
                description={`Confirma la recepción física de la papelería del caso ${currentCase.caseNumber}, placa ${currentCase.placa}, en ${sedeElegida?.nombre || "el juzgado seleccionado"}.${numeroInterno.trim() ? ` Referencia interna: ${numeroInterno.trim()}.` : ""} Se abrirá el expediente para su revisión por la autoridad autorizada.`}
                actions={[
                    {
                        text: "Confirmar",
                        color: "success",
                        onClick: () => handleConfirmReceipt(),
                    },
                    {
                        text: "Cancelar",
                        color: "danger",
                        onClick: () => setShowConfirmReceiptModal(false),
                    },
                ]}
            />

            <PopUp
                isOpen={showSendResolutionModal}
                onClose={() => setShowSendResolutionModal(false)}
                title={
                    resolveCaseValue === "acogido"
                        ? "Seguro que desea Acoger la defensa"
                        : "Seguro que desea No Acoger la defensa"
                }
                description={
                    resolveCaseValue === "acogido"
                        ? `Esta acción hará que el denunciado sea exonerado de la denuncia.\n\nNota: El caso pasará a Archivado`
                        : `Esta acción hará que al denunciado se le coloque la Multa correspondiente.`
                }
                actions={[
                    {
                        text: "Confirmar",
                        color: "success",
                        onClick: () => handleSendResolution(),
                    },
                    {
                        text: "Cancelar",
                        color: "danger",
                        onClick: () => setShowSendResolutionModal(false),
                    },
                ]}
            />

            <PopUp
                isOpen={!!errorSendResolution}
                onClose={() => setErrorSendResolution(null)}
                title="Error al enviar la resolución"
                description={
                    errorSendResolution?.message ??
          "Ocurrió un error al enviar la resolución. Por favor, inténtelo nuevamente."
                }
                actions={[
                    {
                        text: "Reintentar",
                        color: "success",
                        onClick: () => handleSendResolution(),
                    },
                ]}
            />
        </div>
    );
};

export default JUZ01Detail;
