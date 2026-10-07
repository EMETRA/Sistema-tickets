import { NextRequest, NextResponse } from 'next/server';
import { cmsFailure, cmsJson, CmsHttpError, privateCmsHeaders } from '@/api/cms/client.server';
export async function POST(request: NextRequest) {
    try {
        if (!request.headers.get('content-type')?.startsWith('multipart/form-data;')) throw new CmsHttpError(415, { message: 'Enviar imágenes como multipart/form-data' });
        return NextResponse.json(await cmsJson(request, '/resources', 'POST'), { headers: privateCmsHeaders });
    } catch (error) { return cmsFailure(error); }
}
