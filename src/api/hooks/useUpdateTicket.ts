'use client';
import { platformCommand,platformFetch } from '@/platform/client';
import { getPlatformRuntime } from '@/platform/runtime';
import { useCallback, useState } from 'react';
import { graphqlRequestClient } from '@/api/graphql/client';
import { UPDATE_TICKET_MUTATION } from '@/api/graphql/tickets/updateTicket';
import { type UpdateTicketInput, type UpdateTicketResponse } from '@/api/graphql/tickets/types';

export function useUpdateTicket() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const updateTicket = useCallback(async (id: string, input: UpdateTicketInput) => {
        setLoading(true);
        setError(null);
        try {
            const context=getPlatformRuntime();
            if(context){
                const summary=await platformFetch<{version:number}>('/tickets/'+id);
                const action=input.usuarioAsignadoId?'assign':input.estadoId===3?'start':input.estadoId===5?'resolve':input.estadoId===4?'cancel':null;
                if(!action)throw new Error('Actualiza los datos del ticket desde su bandeja.');
                const result=await platformCommand<{id:number;estado:number}>('/tickets/'+id+'/'+action,'POST',{version:summary.version,...(action==='assign'?{usuarioId:input.usuarioAsignadoId}:{})},context.actor.admin,'Actualizar ticket #'+id);
                return result;
            }
            const result = await graphqlRequestClient<UpdateTicketResponse>(
                UPDATE_TICKET_MUTATION,
                { variables: { id, input } }
            );
            return result.updateTicket;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { updateTicket, loading, error };
}