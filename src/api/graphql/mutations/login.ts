// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { graphqlClient } from "../client";

export interface LoginInput {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: {
        id: string;
        name: string;
        lastname: string;
        email: string;
    };
}

export async function login(input: LoginInput): Promise<LoginResponse> {

    // Dummy response para desarrollo
    console.log("Login attempt with:", input.email); // Solo para testing
    
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                token: "jwt-token-12345",
                user: {
                    id: "1",
                    name: "Usuario",
                    lastname: "Demo",
                    email: input.email
                }
            });
        }, 1000);
    });
}
