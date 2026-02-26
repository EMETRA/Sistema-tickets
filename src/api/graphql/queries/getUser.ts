import { graphqlClient } from "../client";

export async function getUser(id: string) {

    const response = await graphqlClient.post('', {
        query: `
            query GetUser ($id: ID) {
                user (id: $id) {
                    id,
                    name,
                    lastname,
                    email
                }
            }
        `,
        variables: {
            id
        }
    });

    return response.data.data.user;

}