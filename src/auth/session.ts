import { NextRequest } from "next/server";
import { UserRole } from "@/types/roles";
import {
    AUTH_COOKIE_NAME,
    AUTH_ROLE_COOKIE_NAME,
    AUTH_DEPARTAMENTO_COOKIE_NAME,
} from "@/auth/constants";
import { normalizeRole } from "@/auth/normalizeRole";

export type Session = {
    token: string;
    role: UserRole;
    departamento: string | null;
};

export function getSessionFromRequest(request: NextRequest): Session | null {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) return null;

    const roleCookie = request.cookies.get(AUTH_ROLE_COOKIE_NAME)?.value;
    const role = normalizeRole(roleCookie);
    const departamento =
        request.cookies.get(AUTH_DEPARTAMENTO_COOKIE_NAME)?.value ?? null;

    return { token, role, departamento };
}
