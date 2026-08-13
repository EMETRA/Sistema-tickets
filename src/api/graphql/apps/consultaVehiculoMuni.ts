export const CONSULTA_VEHICULO_MUNI_QUERY = `
    query ConsultaVehiculoMuni($input: ConsultaVehiculoInput!) {
        consultaVehiculoMuni(input: $input) {
            color
            marca
            modelo
            nitPropietario
            nombrePropietario
            direccion
            correo
            telefono
        }
    }
`;
