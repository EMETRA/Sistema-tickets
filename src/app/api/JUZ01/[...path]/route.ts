import { NextRequest } from 'next/server';
import { getGraphqlEndpoint } from '@/api/config/env';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const privateHeaders = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' };
async function proxy(request: NextRequest, params: Promise<{ path: string[] }>, method: 'GET' | 'POST') {
  const { path } = await params;
  const ruta = path.join('/');
  const permitido = method === 'GET' ? /^(evidencias|documentos)\/[1-9]\d{0,18}$/.test(ruta) : /^resoluciones\/[1-9]\d{0,18}\/documento\/generar$/.test(ruta);
  if (!permitido) return Response.json({ error: 'Ruta no disponible' }, { status: 404, headers: privateHeaders });
  const authorization = request.headers.get('authorization');
  if (!authorization?.match(/^Bearer\s+\S+$/i)) return Response.json({ error: 'Sesión requerida' }, { status: 401, headers: privateHeaders });
  try {
    const endpoint = new URL(getGraphqlEndpoint());
    if (!/\/graphql\/?$/.test(endpoint.pathname)) throw new Error('Endpoint inválido');
    endpoint.pathname = endpoint.pathname.replace(/\/graphql\/?$/, '/vivi/juzgado/' + ruta); endpoint.search = ''; endpoint.hash = '';
    if (endpoint.origin === request.nextUrl.origin) throw new Error('La API apunta al Panel');
    const response = await fetch(endpoint, { method, headers: { Authorization: authorization }, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(60000) });
    if (!response.ok) return Response.json({ error: response.status === 403 ? 'Sin permiso para el archivo' : 'No se pudo completar la consulta privada' }, { status: response.status, headers: privateHeaders });
    const headers = new Headers(privateHeaders);
    for (const name of ['content-type', 'content-disposition', 'content-length']) { const value = response.headers.get(name); if (value) headers.set(name, value); }
    return new Response(response.body, { status: response.status, headers });
  } catch { return Response.json({ error: 'El servicio judicial no está disponible' }, { status: 502, headers: privateHeaders }); }
}
export function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) { return proxy(request, params, 'GET'); }
export function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) { return proxy(request, params, 'POST'); }
