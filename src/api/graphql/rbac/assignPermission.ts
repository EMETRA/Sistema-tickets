export const ASSIGN_PERMISSION_MUTATION = `
    mutation AssignPermission($id_usuario: Int!, $permisos: [String!]!) {
        assignPermission(id_usuario: $id_usuario, permisos: $permisos) {
        success
        message
        timestamp
        }
    }
`;