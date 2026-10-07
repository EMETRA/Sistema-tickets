/** Qué puede hacer el usuario en la UI de noticias. */
export interface PermisosNoticiasUI {
    /** Ver el listado y el detalle (VIVI_NOTICIAS_LEER). */
    puedeLeer: boolean;
    /** Crear, editar, guardar borrador, archivar y restaurar (VIVI_NOTICIAS_EDITAR). */
    puedeEditar: boolean;
    /** Publicar o programar: exige EDITAR y PUBLICAR (PERMISOS_PANEL.md, sección 4). */
    puedePublicar: boolean;
}

/** Sin dato de permisos se muestra todo: el backend igual verifica cada operación. */
export const TODOS_LOS_PERMISOS: PermisosNoticiasUI = {
    puedeLeer: true,
    puedeEditar: true,
    puedePublicar: true,
};

/**
 * Traduce los códigos de `usuario.permisos` a lo que la UI muestra u oculta.
 * null = no se pudo consultar → TODOS_LOS_PERMISOS (ocultar un botón no autoriza; el backend sí).
 */
export function permisosParaUI(permisos: readonly string[] | null): PermisosNoticiasUI {
    if (!permisos) return TODOS_LOS_PERMISOS;
    const tiene = (codigo: string) => permisos.includes(codigo);
    const puedeEditar = tiene("VIVI_NOTICIAS_EDITAR");
    return {
        puedeLeer: tiene("VIVI_NOTICIAS_LEER"),
        puedeEditar,
        puedePublicar: puedeEditar && tiene("VIVI_NOTICIAS_PUBLICAR"),
    };
}
