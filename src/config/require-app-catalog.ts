import { redirect } from "next/navigation";
import { getAppsCatalog } from "@/api/graphql/home/getAppsCatalog";
import { canAccessAppPath } from "@/config/apps-access";
import type { AppsCatalog } from "@/config/apps-catalog";

/**
 * Catálogo del usuario autenticado para una ruta /home/{appId}/...
 * Si el nodo no está en ese catálogo, redirige a /unauthorized.
 */
export async function requireAppCatalog(pathname: string): Promise<AppsCatalog> {
    const catalog = await getAppsCatalog();

    if (!canAccessAppPath(pathname, catalog)) {
        redirect("/unauthorized");
    }

    return catalog;
}
