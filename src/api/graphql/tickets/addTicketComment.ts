export const ADD_TICKET_COMMENT_MUTATION = `
    mutation AddTicketComment($input: AddTicketCommentInput!) {
        addTicketComment(input: $input) {
        id
        comentario
        fecha
        }
    }
`;