import { graphqlRequestClient } from "../client";

export async function getUser(id: string) {
    const response = await graphqlRequestClient<{ user: { id: string; name: string; lastname: string; email: string } }>(
        `
            query GetUser($id: ID) {
                user(id: $id) {
                    id
                    name
                    lastname
                    email
                }
            }
        `,
        {
            variables: { id }
        }
    );

    return response.user;
}