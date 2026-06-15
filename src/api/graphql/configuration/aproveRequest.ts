export const APROVE_REQUEST_MUTATION = `
    mutation AproveRequest($ids: [Int!]!) {
        aproveRequest(ids: $ids) {
        success
        message
        timestamp
        }
    }
`;