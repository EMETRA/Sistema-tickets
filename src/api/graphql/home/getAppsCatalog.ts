import type { AppsCatalog } from "@/config/apps-catalog";
import { AUTH_COOKIE_NAME } from "@/auth/constants";
import { APPS_CATALOG_DUMMY } from "./appsCatalog.dummy";
import { getGraphqlEndpoint } from "@/api/config/env";
import { headers, cookies } from "next/headers";

export class AppsCatalogError extends Error {
    constructor(readonly status: number) {
        super(
            status === 401
                ? "Inicia sesión para consultar tus aplicaciones."
                : "No se pudo consultar el catálogo de aplicaciones.",
        );
    }
}

export async function getAppsCatalog(): Promise<AppsCatalog> {
    if (process.env.TICKETS_PLATFORM_ENABLED !== "true")
        return APPS_CATALOG_DUMMY;
    const incoming = await headers();
    // Una navegación RSC lleva cookie; el BFF recibe Authorization. El API valida
    // el token en ambos casos. Una cabecera inválida nunca se sustituye por otra identidad.
    const explicit = incoming.get("authorization");
    const cookie =
        explicit === null
            ? (await cookies()).get(AUTH_COOKIE_NAME)?.value
            : undefined;
    const authorization = explicit ?? (cookie ? "Bearer " + cookie : "");
    if (!/^Bearer [^\s]{1,8192}$/.test(authorization))
        throw new AppsCatalogError(401);
    try {
        const upstream = new URL(getGraphqlEndpoint());
        upstream.pathname =
            upstream.pathname.replace(/\/graphql\/?$/, "") +
            "/platform/catalog";
        upstream.search = "";
        upstream.hash = "";
        const response = await fetch(upstream, {
            headers: { Authorization: authorization },
            cache: "no-store",
            redirect: "error",
            signal: AbortSignal.timeout(15000),
        });
        if (!response.ok)
            throw new AppsCatalogError(
                response.status === 401
                    ? 401
                    : response.status === 403
                        ? 403
                        : 503,
            );
        if (!response.headers.get("content-type")?.includes("application/json"))
            throw new AppsCatalogError(502);
        const catalog = await response.json();
        if (!catalog || typeof catalog !== "object" || Array.isArray(catalog))
            throw new AppsCatalogError(502);
        return catalog;
    } catch (error) {
        if (error instanceof AppsCatalogError) throw error;
        throw new AppsCatalogError(503);
    }
}
