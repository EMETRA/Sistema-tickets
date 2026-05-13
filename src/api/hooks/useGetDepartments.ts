'use client';

import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from "@/api/graphql/client";

export interface Department {
    id_departamento: string;
    nombre_departamento: string;
    descripcion: string;
    activo: number;
}

export function useGetDepartments() {
    const [data, setData] = useState<Department[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiFetch<Record<string, unknown>>('/api/departments');
            setData((response.departamentos as Department[]) || []);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, loading, error, refetch };
}