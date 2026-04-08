export const UPDATE_ROL_MUTATION = `
    mutation UpdateRol($id_rol: Int!, $nombre_rol: String, $descripcion: String) {
        updateRol(id_rol: $id_rol, nombre_rol: $nombre_rol, descripcion: $descripcion) {
        success
        message
        timestamp
        }
    }
`;