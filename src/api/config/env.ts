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
    const ticketsApiUrl = process.env.NEXT_PUBLIC_TICKETS_API_URL;
    const graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;
    const authApiUrl = process.env.NEXT_PUBLIC_AUTH_API_URL;
    const authLoginPath = process.env.NEXT_PUBLIC_AUTH_LOGIN_PATH || '/login';
    const graphqlDebug = (process.env.NEXT_PUBLIC_GRAPHQL_DEBUG || 'false').toLowerCase() === 'true';
    const graphqlTimeoutMs = parseInt(process.env.NEXT_PUBLIC_GRAPHQL_TIMEOUT_MS || '8000', 10);
    const fetchTimeoutMs = parseInt(process.env.NEXT_PUBLIC_FETCH_TIMEOUT_MS || '10000', 10);
    const envValue = process.env.NEXT_PUBLIC_ENV || 'development';
    const environment = isValidEnvironment(envValue) ? envValue : 'development';

    // Validar que existan (solo en server)
    if (!ticketsApiUrl) {
        throw new Error(
            `Missing required environment variable: NEXT_PUBLIC_TICKETS_API_URL. Check .env.local or .env.example`
        );
    }
    if (!graphqlEndpoint) {
        throw new Error(
            `Missing required environment variable: NEXT_PUBLIC_GRAPHQL_ENDPOINT. Check .env.local or .env.example`
        );
    }
    if (!authApiUrl) {
        throw new Error(
            `Missing required environment variable: NEXT_PUBLIC_AUTH_API_URL. Check .env.local or .env.example`
        );
    }

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
