/**
 * Query GraphQL para obtener un manual por su ID
 *
 * Parámetros:
 * - manualId: Int!
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
export const GET_MANUAL_QUERY = `
  query Manual($manualId: Int!) {
    manual(id: $manualId) {
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
