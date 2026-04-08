/**
 * Configuration System Module
 * Exports all types and queries for configuration management
 */

export { GET_PENDING_REQUESTS_QUERY } from './pendingRequests';
export { APROVE_REQUEST_MUTATION } from './aproveRequest';
export { REQUEST_PERMISSION_MUTATION } from './requestPermission';
export type { 
    OperationResponse,
    AproveRequestResponse,
    RequestPermissionResponse
} from './types';

// Pending Requests
export type { PendingRequestRow, GetPendingRequestsResponse } from './types';

// Modules
export type { ModuleRow, GetModulesResponse } from './types';

// Permissions
export type { PermissionRow, GetPermissionsResponse } from './types';

// Roles (Extended)
export type { RoleRowExtended, GetRolesExtendedResponse } from './types';

// Enrolls
export type { EnrollRow, GetEnrollsResponse } from './types';
