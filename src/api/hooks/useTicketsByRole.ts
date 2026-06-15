'use client';

/**
 * Hook useTicketsByRole
 * ======================
 * Abstrae la lógica de filtrados de tickets según el rol del usuario
 * 
 * Comportamiento por rol:
 * - ADMINISTRADOR: Ver todos los tickets (sin filtro especial)
 * - TECNICO/DESARROLLADOR: Ver tickets asignados a su usuario
 * - USUARIO: Ver tickets creados por su usuario
 * 
 * Flujo:
 * 1. Obtiene el rol y ID del usuario desde Zustand
 * 2. Calcula los filtros según el rol
 * 3. Llama a useGetTickets() con los filtros
 * 4. Retorna datos, loading, error, refetch
 */

import { useGetTickets } from './useGetTickets';
import { useAuthStore } from '@/store/useAuthStore';
import { type TicketFilterInput } from '@/api/graphql/tickets';
import { useMemo } from 'react';

/**
 * Hook que retorna tickets filtrados automáticamente según el rol del usuario
 * 
 * @param additionalFilters Filtros adicionales que se combinan con los del rol
 * @returns { data, loading, error, refetch }
 * 
 * Ejemplo de uso:
 * ```ts
 * // Sin filtros adicionales
 * const { data: ticketsData, loading } = useTicketsByRole();
 * 
 * // Con filtros adicionales
 * const { data } = useTicketsByRole({ estadoId: 1 });
 * ```
 */
export function useTicketsByRole(additionalFilters?: TicketFilterInput) {
    const role = useAuthStore((state) => state.getRole());
    const userIdStored = useAuthStore((state) => state.getUserId());
    
    // Convertir userId a number si es posible, o dejar como undefined
    const userId = userIdStored ? (isNaN(Number(userIdStored)) ? undefined : Number(userIdStored)) : undefined;

    if (role === null) {
        throw new Error('useTicketsByRole debe ser usado dentro de un AuthProvider');
    }

    // Memoizar los filtros para evitar ciclos infinitos
    // Solo se recalcula si role, userId o additionalFilters cambian
    const filters = useMemo(() => {
        let calculatedFilters: TicketFilterInput | undefined;

        switch (role) {
        case 'ADMINISTRADOR':
            // Ver todos los tickets (sin filtro especial por rol)
            // Solo aplica filtros adicionales si los hay
            calculatedFilters = additionalFilters;
            break;

        case 'TECNICO':
        case 'DESARROLLADOR':
            // Ver tickets asignados a este usuario
            calculatedFilters = {
                ...additionalFilters,
                usuarioAsignadoId: userId || undefined,
            };
            break;

        case 'USUARIO':
        default:
            // Ver tickets creados por este usuario
            calculatedFilters = {
                ...additionalFilters,
                usuarioCreadorId: userId || undefined,
            };
            break;
        }

        return calculatedFilters;
    }, [role, userId, additionalFilters]);

    // Delegar a useGetTickets con los filtros calculados
    return useGetTickets(filters);
}
