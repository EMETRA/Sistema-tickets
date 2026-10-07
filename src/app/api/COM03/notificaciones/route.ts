import { NextRequest, NextResponse } from 'next/server';
import { cmsFailure, cmsJson, CmsHttpError, noticiaId, privateCmsHeaders } from '@/api/cms/client.server';
import { estadoPush, type CmsNewsDto } from '@/api/cms/mappers';
export async function GET(request: NextRequest) {
    try {
        const ids = [...new Set((request.nextUrl.searchParams.get('ids') || '').split(',').filter(Boolean))];
        if (ids.length > 50) throw new CmsHttpError(400, { message: 'Consultar hasta 50 noticias por petición' });
        const data = [];
        for (const id of ids) {
            const noticia = await cmsJson<CmsNewsDto>(request, `/news/${noticiaId(id)}`);
            data.push({ noticiaId: id, estado: estadoPush(noticia.notificacionPush?.estado) });
        }
        return NextResponse.json({ data }, { headers: privateCmsHeaders });
    } catch (error) { return cmsFailure(error); }
}
