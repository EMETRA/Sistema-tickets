export const REMOVE_TAG_FROM_TICKET_MUTATION = `
    mutation RemoveTagFromTicket($ticketId: ID!, $tagId: Int!) {
        removeTagFromTicket(ticketId: $ticketId, tagId: $tagId)
    }
`;