'use client';

/**
 * Hook useGetUserById
 *
 * Flujo:
 * 1. Hook llama a apiFetch('/api/usuario/[userId]')
 * 2. Route handler recibe Authorization header
 * 3. Route handler ejecuta graphqlRequest(GET_USER_BY_ID_QUERY)
 * 4. graphqlRequest() lee token del header y lo envía al backend
 * 5. Hook retorna { data, loading, error, refetch }
 */

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/api/graphql/client";
import { type UsuarioPerfil } from "@/api/graphql/home";

/**
 * Hook para obtener el perfil de un usuario específico por su ID
 *
 * @param userId ID del usuario a obtener
 * @returns { data, loading, error, refetch }
 */
export function useGetUserById(userId: number) {
    const [data, setData] = useState<UsuarioPerfil | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiFetch<{ usuario: UsuarioPerfil }>(
                `/api/usuario/${userId}`
            );

            console.log("Response from /api/usuario/[userId]:", response);

            setData(response.usuario || null);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Auto-ejecutar refetch cuando userId cambia
    useEffect(() => {
        refetch();
    }, [refetch]);

    return {
        data,
        loading,
        error,
        refetch,
    };
}
