/**
 * RBAC (Role-Based Access Control) Module
 * Exports all types and queries for role and permission management
 */

export { GET_ROLES_QUERY } from './roles';
export { CREATE_ROL_MUTATION } from './createRol';
export { UPDATE_ROL_MUTATION } from './updateRol';
export { ASSIGN_PERMISSION_MUTATION } from './assignPermission';
export { CREATE_MODULE_MUTATION } from './createModule';
export type { 
    RoleRow,
    GetRolesResponse,
    OperationResponse,
    CreateRolResponse,
    UpdateRolResponse,
    AssignPermissionResponse,
    CreateModuleResponse,
    CreateModuleInput,
    UpdateRolInput
} from './types';
