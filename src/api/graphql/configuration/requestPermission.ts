export const REQUEST_PERMISSION_MUTATION = `
    mutation RequestPermission($id_usuario: Int!, $id_modulo: Int!, $motivo: String!) {
        requestPermission(id_usuario: $id_usuario, id_modulo: $id_modulo, motivo: $motivo) {
        success
        message
        timestamp
        }
    }
`;