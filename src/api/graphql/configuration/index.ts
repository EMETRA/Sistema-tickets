/**
 * Configuration System Module
 * Exports all types and queries for configuration management
 */

export { GET_PENDING_REQUESTS_QUERY } from './pendingRequests';
export { APROVE_REQUEST_MUTATION } from './aproveRequest';
export { REQUEST_PERMISSION_MUTATION } from './requestPermission';
export type { 
    PendingRequestRow,
    GetPendingRequestsResponse,
    OperationResponse,
    AproveRequestResponse,
    RequestPermissionResponse
} from './types';
