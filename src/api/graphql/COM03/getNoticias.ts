/**
 * Query GraphQL para obtener el listado de noticias con filtros opcionales
 *
 * TODO [COM03-BACKEND]: query propuesta, confirmar nombre de la operación y campos.
 *
 * Parámetros:
 * - filters: NoticiasFilterInput
 *
 * Retorna:
 * - id
 * - titulo
 * - estado
 * - estadoNotificacion
 * - autor
 * - fecha
 */
export const GET_NOTICIAS_QUERY = `
  query Noticias($filters: NoticiasFilterInput) {
    noticias(filters: $filters) {
      id
      titulo
      estado
      estadoNotificacion
      autor
      fecha
    }
  }
`;
