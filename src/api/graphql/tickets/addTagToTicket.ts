export const ADD_TAG_TO_TICKET_MUTATION = `
    mutation AddTagToTicket($ticketId: ID!, $tagId: Int!) {
        addTagToTicket(ticketId: $ticketId, tagId: $tagId) {
        ticketId
        tagId
        }
    }
`;