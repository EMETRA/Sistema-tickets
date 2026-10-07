import { NextRequest } from 'next/server';
import { getGraphqlEndpoint } from '@/api/config/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Conserva JSON y multipart GraphQL sin exponer la dirección interna al navegador. */
export async function POST(request: NextRequest) {
    const type = request.headers.get('content-type') || '';
    const privateHeaders = { 'Cache-Control': 'private, no-store' };
    if (!/^application\/json(?:;|$)|^multipart\/form-data(?:;|$)/i.test(type)) {
        return Response.json({ errors: [{ message: 'Content-Type no permitido' }] }, { status: 415, headers: privateHeaders });
    }
    const headers = new Headers({ 'Content-Type': type });
    for (const name of ['authorization', 'apollo-require-preflight']) {
        const value = request.headers.get(name);
        if (value) headers.set(name, value);
    }
    try {
        const endpoint = getGraphqlEndpoint();
        if (endpoint === request.url) throw new Error('GRAPHQL_ENDPOINT apunta al propio proxy');
        const timeout = Number(process.env.GRAPHQL_PROXY_TIMEOUT_MS || 60000);
        const response = await fetch(endpoint, {
            method: 'POST', headers, body: request.body,
            duplex: 'half', cache: 'no-store', redirect: 'error',
            signal: AbortSignal.timeout(Number.isFinite(timeout) && timeout > 0 ? timeout : 60000),
        } as RequestInit & { duplex: 'half' });
        return new Response(response.body, { status: response.status, headers: {
            ...privateHeaders, 'Content-Type': response.headers.get('content-type') || 'application/json',
        } });
    } catch (error) {
        const timeout = error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name);
        return Response.json({ errors: [{ message: timeout ? 'La API tardó demasiado en responder' : 'No se pudo contactar api-tickets', extensions: { code: timeout ? 'GATEWAY_TIMEOUT' : 'BAD_GATEWAY' } }] }, { status: timeout ? 504 : 502, headers: privateHeaders });
    }
}
