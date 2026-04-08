export const DELETE_TICKET_MUTATION = `
    mutation DeleteTicket($id: ID!) {
        deleteTicket(id: $id)
    }
`;