import { NextRequest, NextResponse } from 'next/server';
import { cmsFailure, cmsJson, privateCmsHeaders, CmsHttpError } from '@/api/cms/client.server';
import { mapNoticia, type CmsNewsDto } from '@/api/cms/mappers';
export async function GET(request: NextRequest) {
    try {
        const params = request.nextUrl.searchParams;
        const estado = params.get('estado')?.toLowerCase();
        if (estado && !['borrador','programada','publicada','archivada'].includes(estado)) throw new CmsHttpError(400, { message: 'Estado de noticia inválido' });
        const page = Number(params.get('page') || 1), limit = Number(params.get('limit') || 20);
        if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) throw new CmsHttpError(400, { message: 'Paginación inválida' });
        const query = new URLSearchParams({ page: String(page), limit: String(limit), idioma: 'es-GT' });
        if (estado) query.set('estado', estado);
        const q = params.get('busqueda')?.trim(); if (q) query.set('q', q);
        const result = await cmsJson<{ items: CmsNewsDto[]; total: number }>(request, `/news?${query}`);
        return NextResponse.json({ data: result.items.map(mapNoticia), total: Number(result.total), page, limit }, { headers: privateCmsHeaders });
    } catch (error) { return cmsFailure(error); }
}
