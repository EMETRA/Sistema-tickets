/**
 * Environment Variables Configuration
 */

/**
 * Variables de entorno tipadas
 */
export interface EnvironmentConfig {
  // Backend GraphQL
  ticketsApiUrl: string;
  graphqlEndpoint: string;

  // External Auth API
  authApiUrl: string;
  authLoginPath: string;

  // Client Configuration
  graphqlDebug: boolean;

  // Timeouts (ms)
  graphqlTimeoutMs: number;
  fetchTimeoutMs: number;

  // Environment
  environment: 'development' | 'staging' | 'production';
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Validar que el valor sea un environment válido
 */
function isValidEnvironment(
    value: unknown
): value is 'development' | 'staging' | 'production' {
    return (
        typeof value === 'string' &&
    ['development', 'staging', 'production'].includes(value)
    );
}

/**
 * Cargar y validar configuración de entorno
 */
export function loadEnvConfig(): EnvironmentConfig {
    const ticketsApiUrl = process.env.TICKETS_API_URL || process.env.NEXT_PUBLIC_TICKETS_API_URL || '';
    const graphqlEndpoint = getGraphqlEndpoint();
    const authApiUrl = process.env.NEXT_PUBLIC_AUTH_API_URL || '';
    const authLoginPath = process.env.NEXT_PUBLIC_AUTH_LOGIN_PATH || '/login';
    const graphqlDebug = (process.env.NEXT_PUBLIC_GRAPHQL_DEBUG || 'false').toLowerCase() === 'true';
    const graphqlTimeoutMs = parseInt(process.env.NEXT_PUBLIC_GRAPHQL_TIMEOUT_MS || '8000', 10);
    const fetchTimeoutMs = parseInt(process.env.NEXT_PUBLIC_FETCH_TIMEOUT_MS || '10000', 10);
    const envValue = process.env.NEXT_PUBLIC_ENV || 'development';
    const environment = isValidEnvironment(envValue) ? envValue : 'development';

    return {
        // Backend GraphQL
        ticketsApiUrl,
        graphqlEndpoint,

        // External Auth API
        authApiUrl,
        authLoginPath,

        // Client Configuration
        graphqlDebug,

        // Timeouts
        graphqlTimeoutMs: isNaN(graphqlTimeoutMs) ? 8000 : graphqlTimeoutMs,
        fetchTimeoutMs: isNaN(fetchTimeoutMs) ? 10000 : fetchTimeoutMs,

        // Environment
        environment,
        isDevelopment: environment === 'development',
        isProduction: environment === 'production',
    };
}

/** El navegador siempre llama al mismo origen; la URL de Tickets vive en el servidor. */
export function getGraphqlEndpoint(): string {
    if (typeof window !== 'undefined') return '/api/graphql';
    const base = process.env.TICKETS_API_URL || process.env.NEXT_PUBLIC_TICKETS_API_URL;
    const endpoint = process.env.GRAPHQL_ENDPOINT || process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
        (base ? `${base.replace(/\/$/, '')}/graphql` : '');
    if (!endpoint) throw new Error('Configurar GRAPHQL_ENDPOINT en el servidor del Panel');
    const url = new URL(endpoint);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('GRAPHQL_ENDPOINT debe usar HTTP o HTTPS');
    return url.toString();
}

/**
 * Configuración cargada (instancia única)
 */
let config: EnvironmentConfig | null = null;

/**
 * Obtener configuración (singleton)
 * Se carga una sola vez y se cachea
 */
export function getEnvConfig(): EnvironmentConfig {
    if (!config) {
        config = loadEnvConfig();
    }

    return config;
}

/**
 * Reset config (útil para tests)
 */
export function resetEnvConfig(): void {
    config = null;
}

// Export config como default
export default getEnvConfig;
