export const SEND_EMAIL_NOTIFICATION_MUTATION = `
    mutation EnviarNotificacionCorreo($input: EnviarNotificacionCorreoInput!, $pdf: Upload!) {
        enviarNotificacionCorreo(input: $input, pdf: $pdf) {
            success
            message
            areaDestino
            correoDestino
            fechaDocumento
            fechaEnvio
            idBitacora
            pdfArchivado
            idempotente
        }
    }
`;