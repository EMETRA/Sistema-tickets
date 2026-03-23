import { GraphQLClient } from 'graphql-request';
import { ErrorHandler } from './errors';
import { getEnvConfig } from '@/api/config/env';

/**
 * Crear cliente GraphQL configurado
 */
function createGraphQLClient(): GraphQLClient {
    // Acceso directo a las variables - funciona tanto en server como en client
    const graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;

    if (!graphqlEndpoint) {
        throw new Error(
            'GraphQL endpoint not configured. Set NEXT_PUBLIC_GRAPHQL_ENDPOINT in .env.local'
        );
    }

    const client = new GraphQLClient(graphqlEndpoint, {
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return client;
}

// Instancia única del cliente
let graphqlClient: GraphQLClient | null = null;

/**
 * Obtener instancia del cliente GraphQL
 */
export function getGraphQLClient(): GraphQLClient {
    if (!graphqlClient) {
        graphqlClient = createGraphQLClient();
    }

    return graphqlClient;
}

/**
 * Interfaz de opciones para graphqlRequest
 */
export interface GraphQLRequestOptions {
  variables?: Record<string, unknown>;
}

/**
 * Función para hacer requests GraphQL
 * 
 * @template TData - Tipo de datos de la respuesta
 * @param query - Query o mutation en formato string
 * @param options - Opciones: variables
 * @returns Promesa con los datos de la respuesta
 * 
 * Ejemplo:
 * ```tsx
 * const response = await graphqlRequest<{ login: LoginResponse }>(
 *   LOGIN_MUTATION,
 *   {
 *     variables: { input: { email, clave } }
 *   }
 * );
 * ```
 */
export async function graphqlRequest<TData extends Record<string, unknown> = Record<string, unknown>>(
    query: string,
    options?: GraphQLRequestOptions
): Promise<TData> {
    try {
        const client = getGraphQLClient();
        const config = getEnvConfig();

        // TODO: Agregar token de acceso proveniente del estado global de la apliación
        /*
        const authHeader = getAuthorizationHeader();
        if (authHeader) {
            client.setHeader('Authorization', authHeader);
        }
        */

        // Realizar request con timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.graphqlTimeoutMs);

        try {
            const data = await client.request<TData>(query, options?.variables ?? {});
            clearTimeout(timeoutId);
            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    } catch (error: unknown) {
        // Loguear error
        ErrorHandler.log(error, 'graphqlRequest');
        throw error;
    }
}

export default getGraphQLClient;
