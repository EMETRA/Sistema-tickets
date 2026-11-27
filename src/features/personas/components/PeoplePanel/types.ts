/** Persona del personal de RRHH (`GET /platform/organization/people`). */
export type OrganizationPerson = {
    empresa: number;
    empleado: number;
    nombre: string;
    puesto: string;
    unidadCodigo?: number | null;
    unidad: string | null;
    sinUnidad: boolean;
    cuentasHabilitadas: number;
    usuariosIds?: number[];
};
