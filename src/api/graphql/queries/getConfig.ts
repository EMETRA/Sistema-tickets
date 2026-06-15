import { Enroll } from "@/components/client/organisms/EnrollTable/types";
import { Modules } from "@/components/client/organisms/ModulesTable/types";
import { Permissions } from "@/components/client/organisms/PermissionsTable/types";
import { Request } from "@/components/client/organisms/RequestTable/types";
import { Roles } from "@/components/client/organisms/RolesTable/types";

export async function getRequestsDummy(): Promise<Request[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: 1,
                    name: 'Feyser Cáceres',
                    email: 'fcaceres@muniguate.com',
                    employeeNumber: '2000145',
                    budget: '011',
                    position: 'Administrador de sistemas',
                    status: 'Solicitado'
                },
                {
                    id: 2,
                    name: 'Gerbert Martinez',
                    email: 'gmartinez@muniguate.com',
                    employeeNumber: '2024043',
                    budget: '011',
                    position: 'Admin',
                    status: 'Aprobado'
                }
            ])
        }, 900)
    })
};

export async function getModulesDummy(): Promise<Modules[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: 1,
                    name: 'Evial',
                    status: 'Activo'
                },
                {
                    id: 2,
                    name: 'Tickets',
                    status: 'Baja'
                }
            ])
        },900)
    })
};

export async function getPermissionsDummy(): Promise<Permissions[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: 1,
                    name: 'Permiso 1',
                    code: 'PERM1',
                    module: 1,
                    status: 'Activo',
                    ver: true,
                    grabar: true,
                    editar: false,
                    eliminar: true
                },
                {
                    id: 2,
                    name: 'Permiso 2',
                    code: 'PERM2',
                    module: 2,
                    status: 'Baja',
                    ver: true,
                    grabar: false,
                    editar: true,
                    eliminar: false
                }
            ])
        },900)
    })
};

export async function getRolesDummy(): Promise<Roles[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: 1,
                    name: 'Administrador del sistema',
                    code: '0001',
                    roleCode: 'GRPADMIN',
                    description: 'Descripcion 1',
                    status: 'Activo',
                    permissions: [
                        {
                            id: 1,
                            name: 'Permiso 1',
                            code: 'PERM1',
                            module: 1,
                            status: 'Activo',
                            ver: true,
                            grabar: true,
                            editar: true,
                            eliminar: true
                        }
                    ]
                },
                {
                    id: 2,
                    name: 'Usuario regular',
                    code: '0002',
                    roleCode: 'GRPREGULAR',
                    status: 'Baja',
                    permissions: [
                        {
                            id: 1,
                            name: 'Permiso 1',
                            code: 'PERM1',
                            module: 1,
                            status: 'Activo',
                            ver: true,
                            grabar: false,
                            editar: false,
                            eliminar: false
                        },
                        {
                            id: 2,
                            name: 'Permiso 2',
                            code: 'PERM2',
                            module: 2,
                            status: 'Baja',
                            ver: true,
                            grabar: false,
                            editar: true,
                            eliminar: true
                        }
                    ]
                }
            ])
        },900)
    })
};

export async function getEnrollsDummy(): Promise<Enroll[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                {
                    id: 1,
                    name: 'Feyser Cáceres',
                    department: 'Dirección de informática',
                    employeeNumber: '2000145',
                    permission: 'Administrador de tickets',
                    status: 'Solicitado'
                },
                {
                    id: 2,
                    name: 'Gerbert Martinez',
                    department: 'Dirección de Jurídico',
                    employeeNumber: '2024043',
                    permission: 'Permisos regulares tickets',
                    status: 'Aprobado'
                }
            ])
        },900)
    })
}