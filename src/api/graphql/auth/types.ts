/**
 * Authentication Types
 */

/**
 * Input para login
 */
export interface LoginInput {
    email: string;
    clave: string;
    captchaToken?: string;
}

/**
 * Respuesta de login (desde el backend)
 */
export interface LoginResponse {
    token: string | null;
    requiereActivacion?: boolean | null;
    refresh_token?: string;
    expires_in?: number;
}

/**
 * Tipos específicos de mutations
 *
 * Ejemplo:
 * ```typescript
 * export interface LogoutMutationResponse {
 *   success: boolean;
 *   message: string;
 * }
 *
 * export interface RefreshTokenMutationResponse {
 *   token: string;
 *   expires_in: number;
 * }
 * ```
 */
