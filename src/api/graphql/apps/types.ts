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