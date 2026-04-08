export const CREATE_TICKET_MUTATION = `
    mutation CreateTicket($input: CreateTicketInput!) {
        createTicket(input: $input) {
        id
        codigo
        titulo
        estadoId
        }
    }
`;