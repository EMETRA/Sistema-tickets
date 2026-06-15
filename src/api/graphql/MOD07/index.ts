/**
 * Exportaciones de queries y types para MOD07 - Manuales PDF
 */

export { GET_MANUALES_CATEGORIAS_QUERY } from './getManualesCategorias';
export { GET_MANUALES_DISPONIBLES_QUERY } from './getManualesDisponibles';
export { GET_MANUALES_AGRUPADOS_QUERY } from './getManualesAgrupados';
export { GET_MANUAL_QUERY } from './getManual';

export type {
    CategoriaManual,
    ManualInfo,
    ManualesFilterInput,
    ManualesPorCategoria,
    ManualCategoriaResumen,
    GetManualesCategoriasResponse,
    GetManualesDisponiblesResponse,
    GetManualesAgrupadosResponse,
    GetManualResponse,
} from './types';

export { CategoriaManual as CategoriaManualENUM } from './types';
