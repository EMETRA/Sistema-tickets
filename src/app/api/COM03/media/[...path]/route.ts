import { NextRequest, NextResponse } from 'next/server';
import { cmsBaseUrl, cmsFailure, CmsHttpError } from '@/api/cms/client.server';
export async function GET(_request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    try {
        const { path } = await params;
        if (path.length < 2 || path[0] !== 'noticias' || path.some(p => !/^[\w.-]+$/.test(p) || p === '.' || p === '..')) throw new CmsHttpError(400, { message: 'Ruta de imagen inválida' });
        const response = await fetch(`${cmsBaseUrl()}/uploads/${path.map(encodeURIComponent).join('/')}`, { cache: 'no-store', signal: AbortSignal.timeout(30000), redirect: 'error' });
        return new NextResponse(response.body, { status: response.status, headers: { 'Content-Type': response.headers.get('content-type') || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' } });
    } catch (error) { return cmsFailure(error); }
}
