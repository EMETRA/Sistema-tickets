'use client';

import { useCallback, useState } from 'react';
import { graphqlRequestClient } from '@/api/graphql/client';
import { ErrorHandler } from '@/api/graphql/errors';
import { LOGIN_MUTATION } from '@/api/graphql/auth/login';
import { type LoginInput, type LoginResponse } from '@/api/graphql/auth/types';

/**
 * Estado del login
 */
export interface LoginState {
    loading: boolean;
    error: string | null;
    success: boolean;
}

/**
 * Hook useLogin
 * 
 * Uso:
 * `	sx
 * const { loading, error, login } = useLogin();
 * 
 * const handleSubmit = async (email: string, clave: string) => {
 *   try {
 *     const result = await login(email, clave);
 *     console.log('Login exitoso:', result);
 *     // La gestión del token la maneja otro miembro del equipo
 *   } catch (err) {
 *     console.error('Login fallido:', err);
 *   }
 * };
 * `
 */
export function useLogin() {
    const [state, setState] = useState<LoginState>({
        loading: false,
        error: null,
        success: false,
    });

    /**
     * Función para hacer login
     * @param email Email del usuario
     * @param clave Contraseña
     * @param captchaToken Token del captcha de Turnstile (opcional; hoy el login no lo envía)
     * @returns Promesa con el resultado del login (token, refresh_token, expires_in)
     * @throws Error si hay problema en el login
     */
    const login = useCallback(async (
        email: string,
        clave: string,
        captchaToken?: string
    ): Promise<LoginResponse | null> => {
        setState({ loading: true, error: null, success: false });

        // 👇 Validate before try/catch, set error and return null directly
        if (!email || !clave) {
            setState({ loading: false, error: 'Email y contraseña son requeridos', success: false });
            return null;
        }

        if (!email.includes('@')) {
            setState({ loading: false, error: 'Email inválido', success: false });
            return null;
        }

        if (clave.trim().length === 0) {
            setState({ loading: false, error: 'Contraseña no puede estar vacía', success: false });
            return null;
        }

        // El captcha es opcional en el backend (`captchaToken?` en LoginInput): solo se envía si llega.
        // TODO: Turnstile desactivado en el login (indicación de Elías y Feyser, 2026-10-07).
        const input: LoginInput = {
            email: email.trim().toLowerCase(),
            clave,
            ...(captchaToken ? { captchaToken } : {}),
        };

        try {
            const variables = { input };
            const request = (query: string) =>
                graphqlRequestClient<{ login: LoginResponse }>(query, { variables });
            let response: { login: LoginResponse };
            try {
                response = await request(LOGIN_MUTATION);
            } catch (error) {
                const errors = (error as { graphQLErrors?: { message?: string; extensions?: { code?: string } }[] }).graphQLErrors;
                if (!errors?.length || !errors.every(item =>
                    item.extensions?.code === "GRAPHQL_VALIDATION_FAILED" &&
                    item.message?.includes('Cannot query field "requiereActivacion" on type "AuthPayload"')))
                    throw error;
                response = await request(LOGIN_MUTATION.replace("requiereActivacion", ""));
            }

            if (!response?.login?.token && response?.login?.requiereActivacion !== true) {
                setState({ loading: false, error: 'No se recibió token de autenticación', success: false });
                return null;
            }

            setState({ loading: false, error: null, success: true });
            return response.login;

        } catch (err: unknown) {
            const errorMessage = ErrorHandler.getUserMessage(err);
            let userError = errorMessage || 'Error al iniciar sesión';

            if (ErrorHandler.isAuthError(err)) {
                userError = 'Email o contraseña incorrectos';
            } else if (err instanceof Error && err.message.includes('Email')) {
                userError = err.message;
            }

            setState({ loading: false, error: userError, success: false });
            return null; // 👈 no throw
        }
    }, []);

    return {
        loading: state.loading,
        error: state.error,
        login,
    };
}
