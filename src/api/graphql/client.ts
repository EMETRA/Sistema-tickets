import { GraphQLClient } from 'graphql-request';
import { ErrorHandler } from './errors';
import { getEnvConfig, getGraphqlEndpoint } from '@/api/config/env';

/**
 * Si hay sesión activa y el backend responde 401/UNAUTHENTICATED,
 * limpia estado y redirige a login. No hace nada si aún no hay token
 * (p.ej. fallo de login).
 */
function handleClientAuthFailure() {
    if (typeof window === 'undefined') return;

    void import('@/store/useAuthStore').then(({ useAuthStore }) => {
        const { token, logout } = useAuthStore.getState();
        if (token) logout();
    });
}

/**
 * Crear cliente GraphQL configurado
 */
function createGraphQLClient(): GraphQLClient {
    const graphqlEndpoint = getGraphqlEndpoint();

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
 * Error de GraphQL tal como lo devuelve el servidor (`errors[]` de la respuesta).
 */
export interface GraphQLResponseError {
    message: string;
    extensions?: Record<string, unknown>;
}

/**
 * Error que lanza graphqlRequestClient cuando la respuesta trae `errors`.
 * Es un Error normal (mismo mensaje que antes) que además conserva la lista original en
 * `graphQLErrors`, para que un módulo pueda leer su código (p. ej. COM-03 lee
 * `extensions.originalError`). Quien no lo usa no nota ningún cambio.
 */
export type GraphQLClientError = Error & { graphQLErrors: GraphQLResponseError[] };

function toGraphQLClientError(errors: GraphQLResponseError[]): GraphQLClientError {
    return Object.assign(new Error(errors[0]?.message), { graphQLErrors: errors });
}

/**
 * Interfaz de opciones para graphqlRequest
 */
export interface GraphQLRequestOptions {
    variables?: Record<string, unknown>;
    files?: File[];
    fileMap?: Record<string, string[]>;
    onProgress?: (percent: number) => void;
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
export async function graphqlRequest<TData = Record<string, unknown>>(
    query: string,
    options?: GraphQLRequestOptions
): Promise<TData> {
    try {
        const graphqlEndpoint = getGraphqlEndpoint();

        const config = getEnvConfig();

        // Obtener token del header Authorization (en Route Handler)
        // Import dinámico para evitar marcar el módulo como Server Component
        const { headers } = await import('next/headers');
        const headersList = await headers();
        const authorization = headersList.get('Authorization');

        // Crear instancia nueva del cliente con headers específicos
        const client = new GraphQLClient(graphqlEndpoint, {
            headers: {
                'Content-Type': 'application/json',
                ...(authorization && { 'Authorization': authorization })
            },
        });

        // Realizar request con timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.graphqlTimeoutMs);

        try {
            const data = await client.request<TData>({ document: query, variables: options?.variables ?? {}, signal: controller.signal });
            return data;
        } finally {
            clearTimeout(timeoutId);
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
        const graphqlEndpoint = '/api/graphql';

        const config = getEnvConfig();
        const { useAuthStore } = await import('@/store/useAuthStore');
        const token = useAuthStore.getState().token;

        const files = options?.files ?? [];
        const variables = options?.variables ?? {};

        if (files.length > 0) {
            // Use XHR for real upload progress
            return new Promise((resolve, reject) => {
                const map: Record<string, string[]> = options?.fileMap ?? {};
        
                if (!options?.fileMap) {
                    files.forEach((_, i) => {
                        map[String(i)] = [`variables.files.${i}`];
                    });
                }
                const formData = new FormData();
                formData.append('operations', JSON.stringify({
                    query,
                    variables: options?.fileMap 
                        ? { ...variables }  // variables already has null placeholders
                        : { ...variables, files: files.map(() => null) }
                }));
                formData.append('map', JSON.stringify(map));
                files.forEach((file, i) => {
                    formData.append(String(i), file);
                });

                const xhr = new XMLHttpRequest();
                xhr.open('POST', graphqlEndpoint);

                if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                xhr.setRequestHeader('apollo-require-preflight', 'true');

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percent = Math.round((event.loaded / event.total) * 100);
                        options?.onProgress?.(percent);
                    }
                };

                xhr.onload = () => {
                    try {
                        if (xhr.status === 401) {
                            handleClientAuthFailure();
                            reject(new Error('Unauthorized'));
                            return;
                        }
                        const json = JSON.parse(xhr.responseText);
                        if (json.errors) {
                            const code = json.errors[0]?.extensions?.code;
                            if (code === 'UNAUTHENTICATED') {
                                handleClientAuthFailure();
                            }
                            reject(toGraphQLClientError(json.errors));
                        } else {
                            resolve(json.data as TData);
                        }
                    } catch {
                        reject(new Error('Failed to parse response'));
                    }
                };

                xhr.onerror = () => reject(new Error('Network error'));
                xhr.ontimeout = () => reject(new Error('Request timeout'));
                xhr.timeout = config.graphqlTimeoutMs;

                xhr.send(formData);
            });
        }

        // Regular fetch for non-file requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.graphqlTimeoutMs);

        let response: Response;
        try {
            response = await fetch(graphqlEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            body: JSON.stringify({ query, variables }),
            signal: controller.signal,
            });
        } finally {
            clearTimeout(timeoutId);
        }

        if (response.status === 401) {
            handleClientAuthFailure();
            throw new Error('Unauthorized');
        }

        const json = await response.json();

        if (json.errors) {
            const code = json.errors[0]?.extensions?.code;
            if (code === 'UNAUTHENTICATED') {
                handleClientAuthFailure();
            }
            throw toGraphQLClientError(json.errors);
        }

        return json.data as TData;

    } catch (error: unknown) {
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
export async function apiFetch<TData = Record<string, unknown>>(
    url: string,
    sentToken?: string,
    options?: RequestInit
): Promise<TData> {
    try {
        const timeoutMs = 30000; // Default timeout

        // Obtener token de Zustand
        const { useAuthStore } = await import('@/store/useAuthStore');
        const token = sentToken || useAuthStore.getState().token;

        // Preparar headers con token si está disponible
        const headers = new Headers(options?.headers || {});
        
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        
        if (!headers.has('Content-Type') && options?.body && !(options.body instanceof FormData)) {
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

            if (response.status === 401) {
                handleClientAuthFailure();
                throw new Error('HTTP error! status: 401');
            }

            if (!response.ok) {
                const body = await response.json().catch(() => ({})) as { message?: string | string[]; error?: string };
                const messages = Array.isArray(body.message) ? body.message : [body.message || body.error || `HTTP ${response.status}`];
                throw Object.assign(new Error(messages.join(' ')), { statusCode: response.status, body });
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
