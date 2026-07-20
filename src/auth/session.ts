import { NextRequest } from "next/server";
import { UserRole } from "@/types/roles";
import { AUTH_COOKIE_NAME, AUTH_ROLE_COOKIE_NAME } from "@/auth/constants";
import { normalizeRole } from "@/auth/normalizeRole";

export type Session = {
    token: string;
    role: UserRole;
};

export function getSessionFromRequest(request: NextRequest): Session | null {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) return null;

    const roleCookie = request.cookies.get(AUTH_ROLE_COOKIE_NAME)?.value;
    const role = normalizeRole(roleCookie);

    return { token, role };
}
