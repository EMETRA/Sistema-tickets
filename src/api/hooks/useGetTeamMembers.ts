import { useState, useCallback, useEffect } from 'react';
import { TeamMemberRow } from '@/api/graphql/admin-dashboard';

export interface TeamsFiltersOptions {
    id_departamento?: number;
    id_rol?: number;
    search?: string;
    limit?: number;
}

export function useGetTeamMembers(filters?: TeamsFiltersOptions) {
    const [data, setData] = useState<TeamMemberRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Construir query params
            const params = new URLSearchParams();
            if (filters?.id_departamento) params.append('id_departamento', String(filters.id_departamento));
            if (filters?.id_rol) params.append('id_rol', String(filters.id_rol));
            if (filters?.search) params.append('search', filters.search);
            if (filters?.limit) params.append('limit', String(filters.limit));

            const url = `/api/admin-dashboard/team-members${params.toString() ? `?${params.toString()}` : ''}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            const result = await response.json();
            setData(result);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [filters?.id_departamento, filters?.id_rol, filters?.search, filters?.limit]);

    // Auto-fetch cuando los filtros cambien
    useEffect(() => {
        refetch();
    }, [refetch]);

    return { data, loading, error, refetch };
}
