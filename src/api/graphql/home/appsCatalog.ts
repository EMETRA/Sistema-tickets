import type { AppsCatalog } from "@/config/apps-catalog";

/**
 * Query para obtener el catálogo de aplicaciones disponibles para el usuario autenticado.
 */
export const GET_APPS_CATALOG_QUERY = `
  aquí iría el query :')
`;

export interface GetAppsCatalogResponse {
    appsCatalog: AppsCatalog;
}
