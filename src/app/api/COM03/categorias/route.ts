import { NextRequest, NextResponse } from 'next/server';
import { cmsFailure, cmsJson, privateCmsHeaders } from '@/api/cms/client.server';
import { mapCategoria, type CmsCategoryDto } from '@/api/cms/mappers';
export async function GET(request: NextRequest) {
    try {
        const data = await cmsJson<CmsCategoryDto[]>(request, '/taxonomy/categories');
        return NextResponse.json({ data: data.map(mapCategoria) }, { headers: privateCmsHeaders });
    } catch (error) { return cmsFailure(error); }
}
