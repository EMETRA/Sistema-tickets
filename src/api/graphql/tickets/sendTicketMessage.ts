export const SEND_TICKET_MESSAGE_MUTATION = `
    mutation SendTicketMessage($input: SendTicketMessageInput!, $files: [Upload!]) {
        sendTicketMessage(input: $input, files: $files) {
            usuario
            fechaEnvio
            textoMensaje
            archivos {
                id
                nombreArchivo
                keyStorage
            }
        }
    }
`;