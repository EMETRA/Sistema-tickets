'use client';

/**
 * Hook useGetUser
 *
 * Flujo:
 * 1. Hook llama a apiFetch('/api/usuario') con token automático
 * 2. Route handler recibe Authorization header
 * 3. Route handler ejecuta graphqlRequest(GET_USER_QUERY)
 * 4. graphqlRequest() lee token del header y lo envía al backend
 * 5. Hook retorna { data, loading, error, refetch }
 */

import { useState } from "react";
import { apiFetch } from "@/api/graphql/client";
import { type UsuarioPerfil } from "@/api/graphql/home";

/**
 * Hook para obtener el perfil del usuario autenticado
 * @returns { data, loading, error, refetch }
 */
export function useGetUser() {
    const [data, setData] = useState<UsuarioPerfil | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    async function refetch() {
        setLoading(true);
        setError(null);

        try {
            const response = await apiFetch<{ usuario: UsuarioPerfil }>(
                "/api/usuario"
            );

            setData(response.usuario || null);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }

    return {
        data,
        loading,
        error,
        refetch,
    };
}
