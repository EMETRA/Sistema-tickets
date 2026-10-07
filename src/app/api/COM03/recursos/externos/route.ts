import { NextRequest, NextResponse } from 'next/server';
import { cmsFailure, cmsJson, CmsHttpError, privateCmsHeaders } from '@/api/cms/client.server';
export async function POST(request: NextRequest) {
    try {
        if (!request.headers.get('content-type')?.startsWith('application/json')) throw new CmsHttpError(415, { message: 'Enviar el video como JSON' });
        return NextResponse.json(await cmsJson(request, '/resources/externos', 'POST'), { headers: privateCmsHeaders });
    } catch (error) { return cmsFailure(error); }
}
