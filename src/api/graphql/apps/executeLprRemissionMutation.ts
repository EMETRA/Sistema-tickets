export const EXECUTE_LPR_REMISSION_MUTATION = `
    mutation EjecutarGrabacionRemisionLpr($input: EjecutarGrabacionRemisionLprInput!) {
        ejecutarGrabacionRemisionLpr(input: $input) {
            origen
            totalProcesados
            totalActualizados
            totalFallidos
            idIntegracion
            mensaje
            timestamp
            idempotente
        }
    }
`;