'use client';

/**
 * Hook useGetUser
 *
 * Flujo:
 * 1. Hook llama a fetch('/api/usuario')
 * 2. Route handler ejecuta GET_USER_QUERY en servidor
 * 3. Hook retorna { data, loading, error, refetch }
 */

import { useState } from "react";
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
            const response = await fetch("/api/usuario");

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            setData(result.usuario || null);
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
