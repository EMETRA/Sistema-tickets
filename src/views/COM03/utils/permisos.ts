/** Qué puede hacer el usuario en la UI de noticias. */
export interface PermisosNoticiasUI {
    /** Ver el listado y el detalle (VIVI_NOTICIAS_LEER). */
    puedeLeer: boolean;
    /** Crear, editar, guardar borrador, archivar y restaurar (VIVI_NOTICIAS_EDITAR). */
    puedeEditar: boolean;
    /** Publicar o programar: exige EDITAR y PUBLICAR (PERMISOS_PANEL.md, sección 4). */
    puedePublicar: boolean;
}

/** Sin permisos confirmados, los controles permanecen deshabilitados. */
export const SIN_PERMISOS: PermisosNoticiasUI = {
    puedeLeer: false,
    puedeEditar: false,
    puedePublicar: false,
};

/**
 * Traduce los códigos de `usuario.permisos` a lo que la UI muestra u oculta.
 * null = no se pudo consultar; nunca se presume autorización.
 */
export function permisosParaUI(permisos: readonly string[] | null): PermisosNoticiasUI {
    if (!permisos) return SIN_PERMISOS;
    const tiene = (codigo: string) => permisos.includes(codigo);
    const puedeEditar = tiene("VIVI_NOTICIAS_EDITAR");
    return {
        puedeLeer: tiene("VIVI_NOTICIAS_LEER"),
        puedeEditar,
        puedePublicar: puedeEditar && tiene("VIVI_NOTICIAS_PUBLICAR"),
    };
}
