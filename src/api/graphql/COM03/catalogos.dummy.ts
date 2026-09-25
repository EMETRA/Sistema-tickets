import type { CategoriaNoticia, EtiquetaNoticia } from './types';

/**
 * TODO [COM03-BACKEND]: catálogo dummy de categorías (árbol TB_CATEGORIA).
 * Eliminar cuando exista la query `categoriasNoticia` en backend.
 */
export const CATEGORIAS_NOTICIA_DUMMY: CategoriaNoticia[] = [
    { id: '1', nombre: 'Servicios', slug: 'servicios', categoriaPadreId: null },
    { id: '2', nombre: 'Avisos', slug: 'avisos', categoriaPadreId: null },
    { id: '3', nombre: 'Educación vial', slug: 'educacion-vial', categoriaPadreId: null },
    { id: '11', nombre: 'Remisiones', slug: 'remisiones', categoriaPadreId: '1' },
    { id: '12', nombre: 'Trámites', slug: 'tramites', categoriaPadreId: '1' },
    { id: '21', nombre: 'Cierres viales', slug: 'cierres-viales', categoriaPadreId: '2' },
    { id: '22', nombre: 'Horarios', slug: 'horarios', categoriaPadreId: '2' },
];

/**
 * TODO [COM03-BACKEND]: catálogo dummy de etiquetas (TB_ETIQUETA).
 * Eliminar cuando exista la query `etiquetasNoticia` en backend.
 */
export const ETIQUETAS_NOTICIA_DUMMY: EtiquetaNoticia[] = [
    { id: '1', nombre: 'remisiones', slug: 'remisiones' },
    { id: '2', nombre: 'portal', slug: 'portal' },
    { id: '3', nombre: 'zona 10', slug: 'zona-10' },
    { id: '4', nombre: 'mantenimiento', slug: 'mantenimiento' },
    { id: '5', nombre: 'rutas', slug: 'rutas' },
];
