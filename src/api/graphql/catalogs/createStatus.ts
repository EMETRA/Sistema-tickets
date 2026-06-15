export const CREATE_STATUS_MUTATION = `
    mutation CreateStatus($input: CreateStatusInput!) {
        createStatus(input: $input) {
        success
        message
        timestamp
        }
    }
`;