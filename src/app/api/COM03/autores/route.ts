import { NextRequest, NextResponse } from 'next/server';
import { cmsFailure, cmsJson, privateCmsHeaders } from '@/api/cms/client.server';
export async function GET(request: NextRequest) {
    try {
        return NextResponse.json({ data: await cmsJson(request, '/authors') }, { headers: privateCmsHeaders });
    } catch (error) { return cmsFailure(error); }
}
