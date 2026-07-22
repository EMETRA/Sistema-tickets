import type { AppsCatalog } from "@/config/apps-catalog";
import { APPS_CATALOG_DUMMY } from "./appsCatalog.dummy";
// import { graphqlRequest } from "@/api/graphql/client";
// import { GET_APPS_CATALOG_QUERY, type GetAppsCatalogResponse } from "./appsCatalog";

/**
 * Obtiene el árbol de aplicaciones del usuario autenticado.
 * Hoy: data dummy (mismo shape que el backend).
 * Después: descomentar graphqlRequest + GET_APPS_CATALOG_QUERY.
 */
export async function getAppsCatalog(): Promise<AppsCatalog> {
    // const result = await graphqlRequest<Record<string, unknown>>(GET_APPS_CATALOG_QUERY);
    // const typed = result as unknown as GetAppsCatalogResponse;
    // return typed.appsCatalog;

    return APPS_CATALOG_DUMMY;
}
