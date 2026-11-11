import { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { getGraphqlEndpoint } from "@/api/config/env";
import { codigosArchivo, referenciaArchivo } from "@/api/graphql/juzgado-archivo";
import { queuePanelIncident } from "@/observability/server-incidents";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const privateHeaders = {
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
};
async function proxy(
    request: NextRequest,
    params: Promise<{ path: string[] }>,
    method: "GET" | "POST",
) {
    const { path } = await params;
    const ruta = path.join("/");
    const permitido =
    method === "GET"
        ? /^(evidencias|documentos)\/[1-9]\d{0,18}$/.test(ruta)
        : /^resoluciones\/[1-9]\d{0,18}\/documento\/generar$/.test(ruta);
    if (!permitido)
        return Response.json(
            { error: "Ruta no disponible" },
            { status: 404, headers: privateHeaders },
        );
    const authorization = request.headers.get("authorization");
    if (!authorization?.match(/^Bearer\s+\S+$/i))
        return Response.json(
            { error: "Sesión requerida" },
            { status: 401, headers: privateHeaders },
        );
    const failure = async (status: number, codigo: string, backendRef?: unknown, cause?: unknown) => {
        const upstream = referenciaArchivo(backendRef);
        const referencia = upstream || (status >= 500
            ? await queuePanelIncident(`JUZ01.${method}.${path[0]}`, cause || {
                response: { status, errors: [{ extensions: { code: "SERVICE_UNAVAILABLE" } }] },
            }) : randomUUID());
        console.error(
            JSON.stringify({
                evento: "PANEL_ARCHIVO_ERROR",
                recurso: path[0],
                metodo: method,
                http: status,
                codigo,
                referencia,
            }),
        );
        return Response.json(
            {
                error: "No fue posible recuperar el archivo del servicio",
                codigo,
                referencia,
            },
            { status, headers: privateHeaders },
        );
    };
    try {
        const endpoint = new URL(getGraphqlEndpoint());
        if (
            !/\/graphql\/?$/.test(endpoint.pathname) ||
      endpoint.username ||
      endpoint.password
        )
            throw new Error("Endpoint inválido");
        endpoint.pathname = endpoint.pathname.replace(
            /\/graphql\/?$/,
            "/vivi/juzgado/" + ruta,
        );
        endpoint.search = "";
        endpoint.hash = "";
        if (endpoint.origin === request.nextUrl.origin)
            throw new Error("La API apunta al Panel");
        const response = await fetch(endpoint, {
            method,
            headers: { Authorization: authorization,...Object.fromEntries(['x-ticket-request-id','x-ticket-confirmation'].map(name=>[name,request.headers.get(name)]).filter(([,value])=>value)) } as Record<string,string>,
            cache: "no-store",
            redirect: "error",
            signal: AbortSignal.timeout(60000),
        });
        if (!response.ok) {
            const raw = await response.json().catch(() => null);
            const body = raw && typeof raw === "object" ? raw : {};
            return failure(
                response.status,
                (codigosArchivo as readonly string[]).includes(body.codigo)
                    ? body.codigo
                    : "ARCHIVO_HTTP_ERROR",
                body.referencia,
            );
        }
        const type = response.headers.get("content-type") || "";
        if (method === "POST" && !/^application\/json(?:;|$)/i.test(type)) {
            await response.body?.cancel();
            return failure(502, "ARCHIVO_RESPUESTA_INVALIDA");
        }
        if (
            method === "GET" &&
      !/^(image\/(jpeg|png)|video\/mp4|application\/(pdf|octet-stream))(;|$)/i.test(
          type,
      )
        ) {
            await response.body?.cancel();
            return failure(502, "ARCHIVO_RESPUESTA_INVALIDA");
        }
        const headers = new Headers(privateHeaders);
        for (const name of [
            "content-type",
            "content-disposition",
            "content-length",
        ]) {
            const value = response.headers.get(name);
            if (value) headers.set(name, value);
        }
        return new Response(response.body, { status: response.status, headers });
    } catch (error) {
        const e = error as { name?: string; cause?: { code?: string } };
        const code = e.cause?.code;
        return failure(
            e.name === "TimeoutError" ? 504 : 502,
            code &&
        [
            "ENOTFOUND",
            "ECONNREFUSED",
            "ETIMEDOUT",
            "UND_ERR_CONNECT_TIMEOUT",
        ].includes(code)
                ? code
                : "ARCHIVO_SERVICIO_NO_DISPONIBLE",
            undefined,
            error,
        );
    }
}
export function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) {
    return proxy(request, params, "GET");
}
export function POST(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> },
) {
    return proxy(request, params, "POST");
}
