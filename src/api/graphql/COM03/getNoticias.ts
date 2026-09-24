/**
 * Query GraphQL para obtener el listado de noticias con filtros opcionales
 *
 * TODO [COM03-BACKEND]: query propuesta, confirmar nombre de la operación y campos.
 * El estado de la notificación push no viene aquí: se consulta aparte a VIVI (/api/COM03/notificaciones).
 *
 * Parámetros:
 * - filters: NoticiasFilterInput
 *
 * Retorna:
 * - id
 * - titulo
 * - estado
 * - autor
 * - fecha
 */
export const GET_NOTICIAS_QUERY = `
  query Noticias($filters: NoticiasFilterInput) {
    noticias(filters: $filters) {
      id
      titulo
      estado
      autor
      fecha
    }
  }
`;
