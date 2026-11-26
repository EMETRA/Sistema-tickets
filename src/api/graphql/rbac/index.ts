/**
 * RBAC (Role-Based Access Control) Module
 * Exports all types and queries for role and permission management
 */

export { GET_ROLES_QUERY } from "./roles";
export type {
    RoleRow,
    GetRolesResponse,
    OperationResponse,
    CreateRolResponse,
    UpdateRolResponse,
    AssignPermissionResponse,
    CreateModuleResponse,
    CreateModuleInput,
    UpdateRolInput,
} from "./types";
