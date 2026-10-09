import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { getGraphqlEndpoint } from '@/api/config/env';

export class CmsHttpError extends Error {
    constructor(public readonly status: number, public readonly payload: Record<string, unknown>) {
        super(typeof payload.message === 'string' ? payload.message : `Servicio de noticias: HTTP ${status}`);
    }
}
export const privateCmsHeaders = { 'Cache-Control': 'private, no-store' };
export function cmsBaseUrl(): string {
    try {
        const url = new URL(getGraphqlEndpoint());
        if (!/\/graphql\/?$/.test(url.pathname) || url.username || url.password) throw new Error('Endpoint inválido');
        url.pathname = url.pathname.replace(/\/graphql\/?$/, '');
        url.search = ''; url.hash = '';
        return url.toString().replace(/\/+$/, '');
    } catch {
        throw new CmsHttpError(503, { message: 'Configurar GRAPHQL_ENDPOINT de api-tickets en el servidor del Panel' });
    }
}
/** Las lecturas y recursos usan el Bearer del usuario. El Panel no utiliza la clave interna. */
export async function cmsFetch(request: NextRequest, path: string, method = 'GET'): Promise<Response> {
    const bearer = request.headers.get('authorization');
    if (!bearer || !/^Bearer\s+\S+/i.test(bearer)) throw new CmsHttpError(401, { message: 'Token Bearer requerido' });
    const headers = new Headers({ authorization: bearer, accept: 'application/json' });
    const type = request.headers.get('content-type');
    if (method !== 'GET' && type) headers.set('content-type', type);
    const response = await fetch(`${cmsBaseUrl()}${path}`, {
        method, headers, cache: 'no-store', redirect: 'error',
        ...(method !== 'GET' ? { body: request.body, duplex: 'half' } : {}),
        signal: AbortSignal.timeout(60000),
    } as RequestInit & { duplex?: 'half' });
    if (!response.ok) throw new CmsHttpError(response.status, await response.json().catch(() => ({})) as Record<string, unknown>);
    return response;
}
export async function cmsJson<T>(request: NextRequest, path: string, method = 'GET'): Promise<T> {
    return (await cmsFetch(request, path, method)).json() as Promise<T>;
}
export function cmsFailure(error: unknown): NextResponse {
    const status = error instanceof CmsHttpError ? error.status : 502;
    const payload = error instanceof CmsHttpError ? error.payload : { message: 'No se pudo contactar api-tickets' };
    return NextResponse.json(status === 500 ? { message: 'No se pudo completar la operación de noticias' } : payload, { status, headers: privateCmsHeaders });
}
export function noticiaId(id: string): string {
    if (!/^[1-9]\d{0,9}$/.test(id) || Number(id) > 2147483647) throw new CmsHttpError(400, { message: 'ID de noticia inválido' });
    return id;
}
