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
     * @returns Promesa con el resultado del login (token, refresh_token, expires_in)
     * @throws Error si hay problema en el login
     */
    const login = useCallback(async (email: string, clave: string): Promise<LoginResponse> => {
        // Actualizar estado: cargando
        setState({
            loading: true,
            error: null,
            success: false,
        });

        try {
            if (!email || !clave) {
                throw new Error('Email y contraseña son requeridos');
            }

            if (!email.includes('@')) {
                throw new Error('Email inválido');
            }

            if (clave.trim().length === 0) {
                throw new Error('Contraseña no puede estar vacía');
            }

            const response = await graphqlRequestClient<{ login: LoginResponse }>(
                LOGIN_MUTATION,
                {
                    variables: {
                        input: {
                            email: email.trim().toLowerCase(),
                            clave,
                        } as LoginInput,
                    },
                }
            );

            if (!response?.login?.token) {
                throw new Error('No se recibió token de autenticación');
            }

            setState({
                loading: false,
                error: null,
                success: true,
            });

            return response.login;
        } catch (err: unknown) {
            // Extraer mensaje de error de forma segura
            const errorMessage = ErrorHandler.getUserMessage(err);

            // Determinar error específico
            let userError = errorMessage || 'Error al iniciar sesión';

            if (ErrorHandler.isAuthError(err)) {
                userError = 'Email o contraseña incorrectos';
            } else if (err instanceof Error && err.message.includes('Email')) {
                userError = err.message;
            }
            
            setState({
                loading: false,
                error: userError,
                success: false,
            });

            throw err;
        }
    }, []);

    return {
        loading: state.loading,
        error: state.error,
        login,
    };
}
