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
                    status: 'Activo'
                },
                {
                    id: 2,
                    name: 'Permiso 2',
                    status: 'Baja'
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
                    status: 'Activo'
                },
                {
                    id: 2,
                    name: 'Usuario regular',
                    code: '0002',
                    roleCode: 'GRPREGULAR',
                    status: 'Baja'
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