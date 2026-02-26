import { NextRequest, NextResponse } from "next/server";
import { protectedRoutes, publicRoutes, nologRoutes } from "@/config/protected-routes";
import { getSessionFromRequest } from "@/auth/session";

function isInternalPath( pathname: string ) {
    return (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname === "/favicon.ico"
    );
}

function matchRoute( pathname: string, routes: string[] ) {
    return routes.some(route => pathname.startsWith(route));
}

export function middleware( request: NextRequest ) {

    const { pathname } = request.nextUrl;

    if (isInternalPath(pathname)) {
        return NextResponse.next();
    }

    const isProtectedRoute = matchRoute(pathname, protectedRoutes);
    const isPublicRoute = matchRoute(pathname, publicRoutes);
    const isNologRoute = matchRoute(pathname, nologRoutes);
    const isDeclaredRoute = isProtectedRoute || isPublicRoute || nologRoutes;

    if (!isDeclaredRoute) {
        return NextResponse.rewrite(
            new URL('/404', request.url)
        );
    }

    const session = getSessionFromRequest(request);

    if (isProtectedRoute && !session) {
        return NextResponse.redirect(
            new URL('/login', request.url)
        );
    }

    if (isNologRoute && session) {
        return NextResponse.redirect(
            new URL('/home', request.url)
        );
    }

    return NextResponse.next();

};