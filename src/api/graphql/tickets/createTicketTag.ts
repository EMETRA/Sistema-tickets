export const CREATE_TICKET_TAG_MUTATION = `
    mutation CreateTicketTag($nombre: String!, $color: String) {
        createTicketTag(nombre: $nombre, color: $color) {
        id
        nombre
        color
        }
    }
`;