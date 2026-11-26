import { NextRequest, NextResponse } from "next/server";
import { cmsFailure, cmsJson, privateCmsHeaders } from "@/api/cms/client.server";
export async function GET(request: NextRequest) {
    try {
        const data = await cmsJson<{ id: number; nombre: string; slug: string }[]>(request, "/taxonomy/tags");
        return NextResponse.json(
            { data: data.map((t) => ({ ...t, id: String(t.id) })) },
            { headers: privateCmsHeaders },
        );
    } catch (error) {
        return cmsFailure(error);
    }
}
