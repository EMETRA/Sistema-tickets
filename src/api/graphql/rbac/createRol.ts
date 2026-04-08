export const CREATE_ROL_MUTATION = `
    mutation CreateRol($nombre_rol: String!, $descripcion: String) {
        createRol(nombre_rol: $nombre_rol, descripcion: $descripcion) {
        success
        message
        timestamp
        }
    }
`;