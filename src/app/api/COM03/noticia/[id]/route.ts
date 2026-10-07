import { NextRequest, NextResponse } from 'next/server';
import { cmsFailure, cmsJson, noticiaId, privateCmsHeaders } from '@/api/cms/client.server';
import { mapCategoria, mapDetalle, type CmsNewsDto, type CmsCategoryDto } from '@/api/cms/mappers';
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = noticiaId((await params).id);
        const noticia = await cmsJson<CmsNewsDto>(request, `/news/${id}`);
        const categorias = await cmsJson<CmsCategoryDto[]>(request, '/taxonomy/categories');
        return NextResponse.json({ data: mapDetalle(noticia, categorias.map(mapCategoria)) }, { headers: privateCmsHeaders });
    } catch (error) { return cmsFailure(error); }
}
