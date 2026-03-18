import { GraphQLClient } from 'graphql-request';
import { ErrorHandler } from './errors';
import { getEnvConfig } from '@/lib/config/env';
import { getAuthorizationHeader } from '@/lib/config/token';

/**
 * Crear cliente GraphQL configurado
 */
function createGraphQLClient(): GraphQLClient {
    const config = getEnvConfig();

    const client = new GraphQLClient(config.graphqlEndpoint, {
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

        const authHeader = getAuthorizationHeader();
        if (authHeader) {
            client.setHeader('Authorization', authHeader);
        }

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

/**
 * Reset del cliente (útil para tests)
 */
export function resetGraphQLClient(): void {
    graphqlClient = null;
}

export default getGraphQLClient;
