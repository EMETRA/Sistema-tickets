/**
 * Query GraphQL para obtener manuales disponibles con filtros opcionales
 *
 * Parámetros:
 * - filters: ManualesFilterInput
 *
 * Retorna:
 * - categoria
 * - categoriaEtiqueta
 * - etiquetas
 * - id
 * - nombreArchivo
 * - orden
 * - tamanoBytes
 * - titulo
 * - urlVisualizacion
 * - urlVisualizacionAbsoluta
 */
export const GET_MANUALES_DISPONIBLES_QUERY = `
  query ManualesDisponibles($filters: ManualesFilterInput) {
    manualesDisponibles(filters: $filters) {
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
`;
