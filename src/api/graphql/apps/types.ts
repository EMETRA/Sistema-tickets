export interface SendEmailNotificationInput {
    areaDestino: string;
    fechaDocumento: string;
    emitidoPor: string;
    numeroExpediente: string;
    numeroFolio: number;
    nombre: string;
    referencia: string;
}

export interface SendEmailNotificationResult {
    success: boolean;
    message: string;
    destinationArea: string;
    destinationEmail: string;
    documentDate: string;
    sentDate: string;
    logId: number;
    archivedPdf: string;
    idempotent: boolean;
}

export interface SendEmailNotificationResponse extends Record<string, unknown> {
    enviarNotificacionCorreo: SendEmailNotificationResult;
}

export interface ExecuteLprRemissionInput {
    origen: string;
    usuario?: string;
    correlativo?: string;
}

export interface ExecuteLprRemissionResult {
    origen: string;
    totalProcesados: number;
    totalActualizados: number;
    totalFallidos: number;
    idIntegracion: string;
    mensaje: string;
    timestamp: string;
    idempotente: boolean;
}

export interface ExecuteLprRemissionResponse extends Record<string, unknown> {
    ejecutarGrabacionRemisionLpr: ExecuteLprRemissionResult;
}


// MOD01 - Reporte semanal
export interface TareaPlanInput {
    descripcion: string;
    horasEstimadas: number;
    fechaCompromiso: string;
    estado: string;
}

export interface TareaCompletadaInput {
    descripcion: string;
    horasReales: number;
    fechaFinalizacion: string;
}

export interface GuardarReporteSemanalInput {
    idColaborador: number;
    cargo: string;
    proyecto: string;
    fechaInicio: string;
    fechaFin: string;
    jefeInmediato: string;
    tareasPlanificadas: number;
    tareasCompletadas: number;
    tareasEnFecha: number;
    bloqueosActivos: number;
    horasEstimadasTotal: number;
    horasRealesTotal: number;
    avancePlanificado: number;
    avanceReal: number;
    observaciones: string;
    tareasPlan: TareaPlanInput[];
    tareasCompletadasDetalle: TareaCompletadaInput[];
}

export interface GuardarReporteSemanalResponse {
    success: boolean;
    message: string;
    idReporte: number;
    reporte: {
        estadoProyecto: string;
        indProductividad: number;
    };
}
