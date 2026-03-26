/**
 * Configuration System Module
 * Exports all types and queries for configuration management
 */

export { GET_PENDING_REQUESTS_QUERY } from './pendingRequests';

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
