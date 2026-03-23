/**
 * GraphQL Query: pendingRequests
 * Fetches pending configuration requests with optional limit
 */

export const GET_PENDING_REQUESTS_QUERY = `
  query GetPendingRequests($limit: Int) {
    pendingRequests(limit: $limit) {
      id_solicitud
      id_usuario
      tipo
      detalle
      fecha
    }
  }
`;
