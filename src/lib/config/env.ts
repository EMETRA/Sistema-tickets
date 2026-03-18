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
 * Validar variable de entorno string
 */
function getRequiredEnvVar(key: string): string {
    const value = process.env[key];

    if (!value) {
        throw new Error(
            `Missing required environment variable: ${key}. Check .env.local or .env.example`
        );
    }

    return value;
}

/**
 * Validar variable de entorno opcional string
 */
function getOptionalEnvVar(key: string, defaultValue: string): string {
    return process.env[key] ?? defaultValue;
}

/**
 * Validar variable de entorno boolean
 */
function getEnvBoolean(key: string, defaultValue: boolean = false): boolean {
    const value = process.env[key];
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Validar variable de entorno número
 */
function getEnvNumber(key: string, defaultValue: number): number {
    const value = process.env[key];
    if (!value) return defaultValue;

    const num = parseInt(value, 10);
    if (isNaN(num)) {
        throw new Error(
            `Invalid number for environment variable: ${key}. Expected number, got "${value}"`
        );
    }

    return num;
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
    const envValue = getOptionalEnvVar('NEXT_PUBLIC_ENV', 'development');
    const environment = isValidEnvironment(envValue) ? envValue : 'development';

    return {
    // Backend GraphQL
        ticketsApiUrl: getRequiredEnvVar('NEXT_PUBLIC_TICKETS_API_URL'),
        graphqlEndpoint: getRequiredEnvVar('NEXT_PUBLIC_GRAPHQL_ENDPOINT'),

        // External Auth API
        authApiUrl: getRequiredEnvVar('NEXT_PUBLIC_AUTH_API_URL'),
        authLoginPath: getOptionalEnvVar('NEXT_PUBLIC_AUTH_LOGIN_PATH', '/login'),

        // Client Configuration
        graphqlDebug: getEnvBoolean('NEXT_PUBLIC_GRAPHQL_DEBUG', false),

        // Timeouts
        graphqlTimeoutMs: getEnvNumber('NEXT_PUBLIC_GRAPHQL_TIMEOUT_MS', 8000),
        fetchTimeoutMs: getEnvNumber('NEXT_PUBLIC_FETCH_TIMEOUT_MS', 10000),

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
