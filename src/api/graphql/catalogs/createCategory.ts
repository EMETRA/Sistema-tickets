export const CREATE_CATEGORY_MUTATION = `
    mutation CreateCategory($input: CreateCategoryInput!) {
        createCategory(input: $input) {
        success
        message
        timestamp
        }
    }
`;