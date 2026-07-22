import { NextRequest, NextResponse } from "next/server";
import {
    protectedRoutes,
    publicRoutes,
    nologRoutes,
    sessionOnlyRoutes,
} from "@/config/protected-routes";
import { getSessionFromRequest } from "@/auth/session";
import { canAccessPath } from "@/config/route-access";
import { canAccessAppPath } from "@/config/apps-access";

function isInternalPath(pathname: string) {
    return (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname === "/favicon.ico"
    );
}

function matchRoute(pathname: string, routes: string[]) {
    return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (isInternalPath(pathname)) {
        return NextResponse.next();
    }

    const isProtectedRoute = matchRoute(pathname, protectedRoutes);
    const isPublicRoute = matchRoute(pathname, publicRoutes);
    const isNologRoute = matchRoute(pathname, nologRoutes);
    const isSessionOnlyRoute = matchRoute(pathname, sessionOnlyRoutes);
    const isDeclaredRoute =
        isProtectedRoute || isPublicRoute || isNologRoute || isSessionOnlyRoute;

    // Rutas no declaradas: dejar que Next.js renderice app/not-found.tsx
    if (!isDeclaredRoute) {
        return NextResponse.next();
    }

    const session = getSessionFromRequest(request);

    if ((isProtectedRoute || isSessionOnlyRoute) && !session) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isNologRoute && session) {
        return NextResponse.redirect(new URL("/home", request.url));
    }

    if (isProtectedRoute && session && !canAccessPath(session.role, pathname)) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    if (
        isProtectedRoute &&
        session &&
        !canAccessAppPath(session.departamento, pathname)
    ) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return NextResponse.next();
}
