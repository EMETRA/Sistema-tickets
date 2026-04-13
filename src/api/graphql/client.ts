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
 * Función para hacer requests GraphQL desde Route Handlers
 * El token se obtiene automáticamente del header Authorization
 * 
 * @template TData - Tipo de datos de la respuesta
 * @param query - Query o mutation en formato string
 * @param options - Opciones: variables
 * @returns Promesa con los datos de la respuesta
 * 
 * Nota: Solo funciona en Route Handlers (servidor)
 * Para cliente, usa graphqlRequestClient()
 * 
 * Ejemplo:
 * ```tsx
 * export async function GET(request: NextRequest) {
 *     const result = await graphqlRequest<MyType>(QUERY);
 *     return NextResponse.json(result);
 * }
 * ```
 */
export async function graphqlRequest<TData extends Record<string, unknown> = Record<string, unknown>>(
    query: string,
    options?: GraphQLRequestOptions
): Promise<TData> {
    try {
        const graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;

        if (!graphqlEndpoint) {
            throw new Error(
                'GraphQL endpoint not configured. Set NEXT_PUBLIC_GRAPHQL_ENDPOINT in .env.local'
            );
        }

        const config = getEnvConfig();

        // Obtener token del header Authorization (en Route Handler)
        // Import dinámico para evitar marcar el módulo como Server Component
        const { headers } = await import('next/headers');
        const headersList = await headers();
        const token = headersList.get('Authorization')?.replace('Bearer ', '') || null;

        // Crear instancia nueva del cliente con headers específicos
        const client = new GraphQLClient(graphqlEndpoint, {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
        });

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
 * Función para hacer requests GraphQL desde cliente
 * El token se obtiene automáticamente de Zustand
 * 
 * @template TData - Tipo de datos de la respuesta
 * @param query - Query o mutation en formato string
 * @param options - Opciones: variables
 * @returns Promesa con los datos de la respuesta
 * 
 * Nota: Solo funciona en cliente (useClient)
 * Para Route Handlers, usa graphqlRequest()
 * 
 * Ejemplo:
 * ```tsx
 * const { data } = await graphqlRequestClient<MyType>(QUERY);
 * ```
 */
export async function graphqlRequestClient<TData extends Record<string, unknown> = Record<string, unknown>>(
    query: string,
    options?: GraphQLRequestOptions
): Promise<TData> {
    try {
        const graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;

        if (!graphqlEndpoint) {
            throw new Error(
                'GraphQL endpoint not configured. Set NEXT_PUBLIC_GRAPHQL_ENDPOINT in .env.local'
            );
        }

        const config = getEnvConfig();

        // Obtener token de Zustand (en cliente)
        const { useAuthStore } = await import('@/store/useAuthStore');
        const token = useAuthStore.getState().token;

        // Crear instancia nueva del cliente con headers específicos
        const client = new GraphQLClient(graphqlEndpoint, {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
        });

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
        ErrorHandler.log(error, 'graphqlRequestClient');
        throw error;
    }
}

/**
 * Función para hacer requests REST con autenticación automática (Cliente)
 * El token se obtiene automáticamente de Zustand
 * 
 * @template TData - Tipo de datos de la respuesta
 * @param url - URL del endpoint (ej: '/api/usuario')
 * @param options - Opciones: body, method, etc.
 * @returns Promesa con los datos parseados de la respuesta
 * 
 * Nota: Solo funciona en cliente (useClient)
 * El token se agrega automáticamente al header Authorization
 * 
 * Ejemplo:
 * ```tsx
 * const data = await apiFetch<{usuario: UsuarioPerfil}>('/api/usuario');
 * ```
 */
export async function apiFetch<TData extends Record<string, unknown> = Record<string, unknown>>(
    url: string,
    options?: RequestInit
): Promise<TData> {
    try {
        const timeoutMs = 30000; // Default timeout

        // Obtener token de Zustand
        const { useAuthStore } = await import('@/store/useAuthStore');
        const token = useAuthStore.getState().token;

        // Preparar headers con token si está disponible
        const headers = new Headers(options?.headers || {});
        
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        
        if (!headers.has('Content-Type') && options?.body) {
            headers.set('Content-Type', 'application/json');
        }

        // Realizar request con timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                credentials: 'include', // Incluir cookies si existen
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json() as TData;
            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    } catch (error: unknown) {
        // Loguear error
        ErrorHandler.log(error, 'apiFetch');
        throw error;
    }
}

export default getGraphQLClient;
