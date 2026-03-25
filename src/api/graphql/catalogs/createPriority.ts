export const CREATE_PRIORITY_MUTATION = `
    mutation CreatePriority($input: CreatePriorityInput!) {
        createPriority(input: $input) {
        success
        message
        timestamp
        }
    }
`;