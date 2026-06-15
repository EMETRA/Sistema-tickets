export const CREATE_MODULE_MUTATION = `
    mutation CreateModule($nombre: String!, $ruta: String!, $descripcion: String, $icono: String) {
        createModule(nombre: $nombre, ruta: $ruta, descripcion: $descripcion, icono: $icono) {
        success
        message
        timestamp
        }
    }
`;