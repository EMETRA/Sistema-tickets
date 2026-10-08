"use client";

import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { Icon } from "@/components/client/atoms/Icon";
import { Title } from "@/components/client/atoms/Title";
import { Text } from "@/components/client/atoms/Text";
import { Button } from "@/components/client/atoms/Button";
import { Chip } from "@/components/client/atoms/Chip";
import { MediaGrid, type MediaGridItem } from "@/components/client/molecules/MediaGrid";
import { File } from "@/components/client/atoms/File";
import { ButtonTab } from "@/components/client/atoms/ButtonTab";
import { FormField } from '@/components/client/molecules/FormField';
import { TableRow } from "@/components/client/molecules/TableRow";
import type { TableCellConfig } from "@/components/client/molecules/TableRow/types";
import { PopUp } from '@/components/client/molecules/PopUp';

import styles from './JUZ01Detail.module.scss';
import { JUZ01DetailProps } from './types';
import { useRouter } from 'next/navigation';
import { TextArea } from '@/components/client/atoms/TextArea';
import { Select } from '@/components/client/atoms/Select';
import { Input } from '@/components/client/atoms/Input';
import { useAuthStore } from '@/store/useAuthStore';
import { consultarCasoJuzgado, consultarSedesJuzgado, recibirCasoJuzgado, resolverCasoJuzgado, registrarGestionJuzgado, generarDocumentoJuzgado, descargarArchivoJuzgado, idSolicitudJuzgado, mensajeJuzgado, type DetalleJuzgado, type SedeJuzgado, type RecepcionInput, type ResolucionInput, type GestionInput } from '@/api/graphql/juzgado';
import { mapearCasoJuzgado } from '@/api/graphql/juzgado-vista';


type Case = ReturnType<typeof mapearCasoJuzgado>;
type EvidenceFile = Case['denuncia']['evidencias'][number];
const toMediaGridItem = (file: EvidenceFile, onError: (error: unknown) => void): MediaGridItem => ({
    type: 'file', id: file.id, name: file.name, download: true,
    onClick: () => { void descargarArchivoJuzgado('evidencias', file.id, `evidencia-${file.id}.${file.mime.startsWith('video/') ? 'mp4' : file.mime === 'image/png' ? 'png' : 'jpg'}`).catch(onError); },
});

const LOG_GRID = "minmax(0,0.5fr) minmax(0,0.3fr) minmax(0,1fr) minmax(0,0.2fr) minmax(0,1fr)";

const LOG_HEADER: TableCellConfig[] = [
    { label: "Actor", icon: "user-solid" },
    { label: "Correo", icon: "mail-solid" },
    { label: "Acción", icon: "ticket" },
    { label: "Fecha", icon: "calendar-regular" },
    { label: "Nota", icon: "briefcase-solid" },
];
const JUZ01Detail: React.FC<JUZ01DetailProps> = ({ caseNumber }) => {

    const [currentCase, setCurrentCase] = useState<Case | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<{ message: string } | null>(null); // Error al cargar el caso
    const [errorSendResolution, setErrorSendResolution] = useState<{ message: string } | null>(null); // Error al enviar la resolución
    const router = useRouter();

    const [showConfirmReceiptModal, setShowConfirmReceiptModal] = useState(false);
    const [showSendResolutionModal, setShowSendResolutionModal] = useState(false);
    const [showResolveDefense, setShowResolveDefense] = useState(false);
    const [resolveCaseValue, setResolveCaseValue] = useState("acogido");
    const [fundament, setFundament] = useState("");
    const [isSendingResolution, setIsSendingResolution] = useState(false);

    const permisos = useAuthStore(state => state.user)?.permisos || [];
    const [detalle, setDetalle] = useState<DetalleJuzgado | null>(null);
    const [sedes, setSedes] = useState<SedeJuzgado[]>([]);
    const [sede, setSede] = useState('');
    const [numeroInterno, setNumeroInterno] = useState('');
    const [observacion, setObservacion] = useState('');
    const [gestionTipo, setGestionTipo] = useState('REVISION');
    const [gestionNota, setGestionNota] = useState('');
    const [busy, setBusy] = useState(false);
    const [aviso, setAviso] = useState<string | null>(null);
    const [consultaVersion, setConsultaVersion] = useState(0);
    const enCurso = useRef(false);
    const recepcionPendiente = useRef<RecepcionInput | null>(null);
    const resolucionPendiente = useRef<{ decision: 'ACOGIDA' | 'NO_ACOGIDA'; input: ResolucionInput } | null>(null);
    const gestionPendiente = useRef<GestionInput | null>(null);
    const puedeConsultar = permisos.includes('VIVI_JUZGADO_CONSULTAR');
    const puedeRecibir = !!detalle && !detalle.expediente && ['REGISTRADA', 'PENDIENTE_CORREO', 'NOTIFICADA', 'DEFENSA_WEB'].includes(detalle.estadoCaso) && permisos.includes('VIVI_JUZGADO_RECIBIR');
    const puedeResolver = detalle?.estadoCaso === 'EN_JUZGADO' && !!detalle.expediente && ['RECIBIDO', 'EN_REVISION'].includes(detalle.expediente.estado) && permisos.includes('VIVI_JUZGADO_RESOLVER');

    async function recargar() {
        const data = await consultarCasoJuzgado(caseNumber);
        setDetalle(data); setCurrentCase(mapearCasoJuzgado(data));
    }
    useEffect(() => {
        let activo = true;
        setIsLoading(true); setError(null); setCurrentCase(null); setDetalle(null);
        recepcionPendiente.current = null; resolucionPendiente.current = null; gestionPendiente.current = null;
        void (async () => {
            if (!puedeConsultar) throw new Error('Sin permiso');
            const data = await consultarCasoJuzgado(caseNumber);
            const disponibles = await consultarSedesJuzgado();
            if (activo) { setDetalle(data); setCurrentCase(mapearCasoJuzgado(data)); setSedes(disponibles); }
        })().catch(e => { if (activo) setError({ message: puedeConsultar ? mensajeJuzgado(e) : 'Tu cuenta no tiene permiso para consultar casos del juzgado.' }); }).finally(() => { if (activo) setIsLoading(false); });
        return () => { activo = false; };
    }, [caseNumber, puedeConsultar, consultaVersion]);

    const falloArchivo = (e: unknown) => setAviso(mensajeJuzgado(e));
    async function ejecutar(accion: () => Promise<unknown>, confirmar?: () => void) {
        if (enCurso.current) return;
        enCurso.current = true; setBusy(true); setAviso(null); setErrorSendResolution(null);
        try {
            await accion(); confirmar?.();
            try { await recargar(); } catch { setAviso('La operación fue confirmada, pero no se pudo actualizar la vista. Consulta el estado actual del caso.'); }
        } catch (e) { setAviso(mensajeJuzgado(e)); }
        finally { enCurso.current = false; setBusy(false); setIsSendingResolution(false); }
    }
    const handleConfirmReceipt = () => {
        if (!puedeRecibir || !sede) { setAviso('Selecciona un juzgado activo para confirmar la recepción.'); return; }
        setShowConfirmReceiptModal(false);
        recepcionPendiente.current ||= { codigoCaso: caseNumber, codigoJuzgado: sede, requestId: idSolicitudJuzgado(), numeroInterno: numeroInterno.trim() || undefined, observacion: observacion.trim() || undefined };
        void ejecutar(() => recibirCasoJuzgado(recepcionPendiente.current!));
    };
    const handleSendResolution = () => {
        if (!puedeResolver || !detalle?.expediente || !fundament.trim()) { setAviso('El fundamento es requerido para emitir la resolución.'); setShowSendResolutionModal(false); return; }
        setShowSendResolutionModal(false); setIsSendingResolution(true);
        resolucionPendiente.current ||= { decision: resolveCaseValue === 'acogido' ? 'ACOGIDA' : 'NO_ACOGIDA', input: { idExpediente: detalle.expediente.id, fundamento: fundament.trim(), requestId: idSolicitudJuzgado(), claveIdempotencia: idSolicitudJuzgado(), versionExpediente: detalle.expediente.version || undefined } };
        const pendiente = resolucionPendiente.current;
        void ejecutar(async () => {
            const resultado = await resolverCasoJuzgado(pendiente.decision, pendiente.input);
            if (resultado.estadoDocumento === 'ERROR_REINTENTABLE') setAviso('La resolución fue confirmada. El PDF está pendiente por un error recuperable; reintenta solo el documento.');
        }, () => setShowResolveDefense(false));
    };
    const handleGestion = () => {
        if (!puedeResolver || !detalle?.expediente || !gestionNota.trim()) { setAviso('Escribe una observación para registrar la actuación.'); return; }
        gestionPendiente.current ||= { idExpediente: detalle.expediente.id, tipoGestion: gestionTipo, observacion: gestionNota.trim(), requestId: idSolicitudJuzgado() };
        void ejecutar(() => registrarGestionJuzgado(gestionPendiente.current!), () => { gestionPendiente.current = null; setGestionNota(''); });
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
                {puedeConsultar && <Button onClick={() => setConsultaVersion(v => v + 1)}>Reintentar consulta</Button>}
                <Button variant="contained" onClick={() => router.back()}>Volver</Button>
            </div>
        );
    }

    if (!currentCase) {
        return (
            <div className={classNames(styles.mainContainer, styles.notFound)}>
                <Text variant="body">No se encontró el caso</Text>
                <Button variant="contained" onClick={() => router.back()}>Volver</Button>
            </div>
        );
    }

    return (
        <div className={styles.mainContainer}>
            <div className={styles.header}>
                <div className={styles.headerInfo}>
                    <Icon name="file" variant="status" color="#7F8D9F" />
                    <Title variant="mid" className={styles.title}>Caso #{currentCase.caseNumber}</Title>
                </div>
                <Title variant="mid" className={styles.title}>{currentCase.caseDate} - {currentCase.place}</Title>
            </div>
            <Title variant="large">{currentCase.title} - {currentCase.placa}</Title>
            <div className={styles.tags}>
                {currentCase.tags.map((tag) => (
                    <Chip key={tag.id} label={tag.nombre} />
                ))}
            </div>
            {(puedeRecibir || puedeResolver) && !showResolveDefense ? (
                <div className={styles.actions}>
                    <Title variant="mid" className={styles.title}>Acciones disponibles</Title>
                    {puedeRecibir ? (
                        <div className={styles.resolveCaseForm}>
                            <FormField label="Juzgado receptor" htmlFor="juzgado" required><Select id="juzgado" options={sedes.map(s => ({ value: s.codigo, label: s.nombre }))} placeholder="Selecciona un juzgado" value={sede} onChange={e => setSede(e.target.value)} disabled={busy || !!recepcionPendiente.current} /></FormField>
                            <FormField label="Número interno (opcional)" htmlFor="numeroInterno"><Input id="numeroInterno" value={numeroInterno} onChange={e => setNumeroInterno(e.target.value)} maxLength={80} disabled={busy || !!recepcionPendiente.current} /></FormField>
                            <FormField label="Observación (opcional)" htmlFor="observacion"><TextArea id="observacion" value={observacion} onChange={e => setObservacion(e.target.value)} maxLength={2000} disabled={busy || !!recepcionPendiente.current} /></FormField>
                            <Button variant="contained" state={busy ? "disabled" : "default"} onClick={() => setShowConfirmReceiptModal(true)}>Confirmar recepción de papelería</Button>
                        </div>
                    ) : puedeResolver ? (
                        <Button variant="contained" state={busy ? "disabled" : "default"} onClick={() => setShowResolveDefense(true)}>Resolver defensa</Button>
                    ) : <Text variant="body">No hay acciones disponibles</Text>}
                </div>
            ) : !showResolveDefense && (
                <div className={styles.resolution}>
                    {currentCase.resolucion ? (
                        <>
                            <Title variant="mid">Resolución - {currentCase.resolucion?.id}</Title>
                            <Text variant="caption">{currentCase.resolucion?.fecha}</Text>
                            <Text variant="body">{currentCase.resolucion?.comentario}</Text>
                            <Text variant="caption">Plantilla: {currentCase.resolucion.plantilla} (borrador técnico)</Text>
                            {currentCase.resolucion.file ? <File id={currentCase.resolucion.file.id} name={currentCase.resolucion.file.name} onClick={() => { void descargarArchivoJuzgado('documentos', currentCase.resolucion!.file!.id, currentCase.resolucion!.file!.name).catch(falloArchivo); }} download /> : <>
                                <Text variant="body">El documento de resolución no está disponible.</Text>
                                {permisos.includes('VIVI_JUZGADO_RESOLVER') && <Button state={busy ? 'disabled' : 'default'} onClick={() => { void ejecutar(() => generarDocumentoJuzgado(currentCase.resolucion!.id)); }}>Reintentar PDF de resolución</Button>}
                            </>}
                        </>
                    ) : (
                        <Text variant="body">La resolución aún no está disponible</Text>
                    )}
                    {currentCase.multa && (
                        <div className={styles.remissionContainer}>
                            <Title variant="mid" className={styles.title}>Remisión</Title>
                            <div className={styles.remissionData}>
                                <div className={styles.remissionDataItem}>
                                    <Text variant="body"><strong>Ciudad</strong></Text>
                                    <Text variant="body">{currentCase.multa.ciudad}</Text>
                                </div>
                                <div className={styles.remissionDataItem}>
                                    <Text variant="body"><strong>Serie</strong></Text>
                                    <Text variant="body">{currentCase.multa.serie}</Text>
                                </div>
                                <div className={styles.remissionDataItem}>
                                    <Text variant="body"><strong>Número</strong></Text>
                                    <Text variant="body">{currentCase.multa.numero}</Text>
                                </div>
                                <div className={styles.remissionDataItem}>
                                    <Text variant="body"><strong>Placa</strong></Text>
                                    <Text variant="body">{currentCase.multa.placa}</Text>
                                </div>
                            </div>
                            <Text variant="body">El importe y la disponibilidad de pago se consultan en el sistema institucional.</Text>
                        </div>
                    )}
                    <Title variant="mid">Caso</Title>
                </div>
            )}
            <Title variant="mid" className={styles.title}>Descripción</Title>
            <Text variant="body">{currentCase.denuncia.descripción}</Text>
            <Title variant="mid" className={styles.title}>Evidencias</Title>
            <MediaGrid
                columns={3}
                items={currentCase.denuncia.evidencias.map(file => toMediaGridItem(file, falloArchivo))}
            />
            {currentCase.defensa && <><Title variant="mid">Defensa histórica</Title><Text variant="body">{currentCase.defensa.nombreDeclarado}</Text><Text variant="body">{currentCase.defensa.argumentos}</Text><MediaGrid columns={3} items={currentCase.defensa.evidencias.map(file => toMediaGridItem(file, falloArchivo))} /></>}
            {puedeResolver && <div className={styles.resolveCaseForm}>
                <Title variant="mid">Registrar actuación</Title>
                <Select options={[{ value: 'REVISION', label: 'Revisión' }, { value: 'ENTREGA_DOCUMENTOS', label: 'Entrega de documentos' }, { value: 'INCIDENCIA', label: 'Incidencia' }]} value={gestionTipo} onChange={e => setGestionTipo(e.target.value)} disabled={busy || !!gestionPendiente.current} aria-label="Tipo de actuación" />
                <TextArea value={gestionNota} onChange={e => setGestionNota(e.target.value)} maxLength={2000} disabled={busy || !!gestionPendiente.current} aria-label="Observación de la actuación" />
                <Button onClick={handleGestion} state={busy ? 'disabled' : 'default'}>Registrar actuación</Button>
            </div>}
            {showResolveDefense && puedeResolver && (
                <>
                    <Title variant="large">Resolver</Title>
                    <div className={styles.resolveCaseForm}>
                        <ButtonTab options={[
                            { label: "Acogido", value: "acogido" },
                            { label: "No acogido", value: "no_acogido" },
                        ]} value={resolveCaseValue} onChange={value => { if (!resolucionPendiente.current && !busy) setResolveCaseValue(value); }} />
                        <FormField label="Fundamento" htmlFor="fundament" required className={styles.fundamentFormField}>
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
                            {isSendingResolution ? 'Enviando resolución...' : 'Enviar resolución'}
                        </Button>
                    </div>
                </>
            )}
            {aviso && <div role="alert"><Text variant="body">{aviso}</Text></div>}
            <Button state={busy ? 'disabled' : 'default'} onClick={() => { void recargar().then(() => { recepcionPendiente.current = null; resolucionPendiente.current = null; gestionPendiente.current = null; }).catch(falloArchivo); }}>Consultar estado actual</Button>
            <Title variant="mid" className={styles.title}>Bitácora de cambios</Title>
            <div className={styles.tableContainer}>
                <TableRow isHeader gridTemplate={LOG_GRID} cells={LOG_HEADER} />
                {currentCase.logs.map((log, i) => (
                    <TableRow
                        key={i}
                        gridTemplate={LOG_GRID}
                        scale={0.8}
                        cells={[
                            { content: <Text variant="muted">{log.userName}</Text> },
                            { content: <Text variant="muted">{log.email}</Text> },
                            { content: <Text variant="muted">{log.action}</Text> },
                            { content: <Text variant="muted">{log.date}</Text> },
                            { content: <Text variant="muted">{log.note}</Text> },
                        ] as TableCellConfig[]}
                    />
                ))}
            </div>
            
            <PopUp
                isOpen={showConfirmReceiptModal}
                onClose={() => setShowConfirmReceiptModal(false)}
                title="Confirmar recepción de denuncia"
                description={`Confirma que recibiste físicamente la papelería de este caso. La recepción abre el expediente para su revisión y posterior resolución por la autoridad autorizada.`}
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
                    }
                ]}
            />

            <PopUp
                isOpen={showSendResolutionModal}
                onClose={() => setShowSendResolutionModal(false)}
                title={resolveCaseValue === "acogido" ? "Seguro que desea Acoger la defensa" : "Seguro que desea No Acoger la defensa"}
                description={resolveCaseValue === "acogido" ? `Esta acción hará que el denunciado sea exonerado de la denuncia.\n\nNota: El caso pasará a Archivado` : `Esta acción hará que al denunciado se le coloque la Multa correspondiente.`}
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
                    }
                ]}
            />

            <PopUp
                isOpen={!!errorSendResolution}
                onClose={() => setErrorSendResolution(null)}
                title="Error al enviar la resolución"
                description={errorSendResolution?.message ?? "Ocurrió un error al enviar la resolución. Por favor, inténtelo nuevamente."}
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
