import { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { getGraphqlEndpoint } from "@/api/config/env";
import { codigosArchivo } from "@/api/graphql/juzgado-archivo";
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
  const failure = (status: number, codigo: string) => {
    const referencia = randomUUID();
    console.error(
      JSON.stringify({
        evento: "PANEL_ARCHIVO_ERROR",
        recurso: path[0],
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
      headers: { Authorization: authorization },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(60000),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return failure(
        response.status,
        (codigosArchivo as readonly string[]).includes(body.codigo)
          ? body.codigo
          : "ARCHIVO_HTTP_ERROR",
      );
    }
    const type = response.headers.get("content-type") || "";
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
