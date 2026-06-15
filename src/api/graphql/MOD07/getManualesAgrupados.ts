/**
 * Query GraphQL para obtener manuales agrupados por categoría
 *
 * Parámetros:
 * - filters: ManualesFilterInput
 *
 * Retorna:
 * - categoria
 * - categoriaEtiqueta
 * - manuales
 */
export const GET_MANUALES_AGRUPADOS_QUERY = `
  query ManualesAgrupados($filters: ManualesFilterInput) {
    manualesAgrupados(filters: $filters) {
      categoria
      categoriaEtiqueta
      manuales {
        categoria
        categoriaEtiqueta
        etiquetas
        id
        nombreArchivo
        orden
        tamanoBytes
        titulo
        urlVisualizacion
        urlVisualizacionAbsoluta
      }
    }
  }
`;
