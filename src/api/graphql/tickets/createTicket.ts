export const CREATE_TICKET_MUTATION = `
    mutation CreateTicket($input: CreateTicketInput!, $files: [Upload!]) {
        createTicket(input: $input, files: $files) {
            ticket {
                id
                codigo
                titulo
                estadoId
            }
            adjuntos {
                id
                nombreArchivo
                keyStorage
            }
            departamentoCreador {
                id_departamento
                nombre
            }
        }
    }
`;