import { recoveryRequest } from "@/auth/recovery.server";
export const runtime = "nodejs";
export async function POST(request: Request) {
    return recoveryRequest(request, "POST");
}
export async function PUT(request: Request) {
    return recoveryRequest(request, "PUT");
}
