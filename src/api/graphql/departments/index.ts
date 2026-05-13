// src/api/graphql/departments/index.ts

export const GET_DEPARTMENTS_QUERY = `
    query GetDepartments {
        departamentos {
            activo
            descripcion
            id_departamento
            nombre_departamento
        }
    }
`;

export interface GetDepartmentsResponse {
    departamentos: {
        id_departamento: string;
        nombre_departamento: string;
        descripcion: string;
        activo: number;
    }[];
}