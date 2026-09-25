/**
 * TODO [COM03-BACKEND]: simulación de las mutaciones mientras no exista la API.
 * Eliminar este archivo cuando los hooks llamen a graphqlRequestClient.
 *
 * Cambiar SIMULAR_ERROR a true para probar las pantallas y mensajes de error.
 */
export const SIMULAR_ERROR = false;

const DEMORA_MS = 1500;

export async function simularMutacion<T>(respuesta: T): Promise<T> {
    await new Promise((resolve) => setTimeout(resolve, DEMORA_MS));
    if (SIMULAR_ERROR) {
        throw new Error("Error simulado (COM03 dummy)");
    }
    return respuesta;
}
