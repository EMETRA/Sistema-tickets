import type { PermisoNoticia } from './types';

/**
 * TODO [COM03-BACKEND]: simulación de permisos para probar las pantallas sin backend.
 * null = consultar `usuario { permisos }` en api-tickets (si falla, se muestran todos los botones).
 * Ejemplos: ['VIVI_NOTICIAS_LEER', 'VIVI_NOTICIAS_EDITAR'] (sin publicar), [] (sin acceso).
 */
export const PERMISOS_SIMULADOS: PermisoNoticia[] | null = null;
