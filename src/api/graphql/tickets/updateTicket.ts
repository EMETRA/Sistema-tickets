export const UPDATE_TICKET_MUTATION = `
    mutation UpdateTicket($id: ID!, $input: UpdateTicketInput!) {
        updateTicket(id: $id, input: $input) {
        id
        titulo
        estadoId
        }
    }
`;