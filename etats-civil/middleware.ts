// middlewares/auth.ts
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/server/sessions";
import { cookies } from "next/headers";

export async function authMiddleware(request: NextRequest) {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    const decryptedSession = await decrypt(session);

    if (!decryptedSession) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export async function redirectIfAuthenticated(request: NextRequest) {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    const decryptedSession = await decrypt(session);

    if (
        decryptedSession &&
        ["/login", "/register"].includes(request.nextUrl.pathname)
    ) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export async function requireAdmin(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;
    const decryptedSession = await decrypt(session);

    if (pathname === "/admin" || pathname === "/admin/register") {
        // Si session existe, on redirige vers /admin/dashboard
        if (decryptedSession) {
            return NextResponse.redirect(
                new URL("/admin/dashboard", request.url)
            );
        }
    }

    // Ne pas bloquer les routes d'auth admin
    if (pathname === "/admin" || pathname === "/admin/register") {
        return NextResponse.next();
    }

    if (!session) {
        return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (
        decryptedSession?.role !== "admin" &&
        decryptedSession?.role !== "agent"
    ) {
        return NextResponse.redirect(new URL("/", request.url)); // ou /403
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Rediriger si déjà connecté (mais seulement pour les citoyens)
    if (["/login", "/register"].includes(pathname)) {
        const response = await redirectIfAuthenticated(request);
        if (response.status !== 200) return response;
    }

    // Middleware spécial pour les routes admin
    if (pathname.startsWith("/admin")) {
        const adminResponse = await requireAdmin(request);
        if (adminResponse && adminResponse.status !== 200) return adminResponse;
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard", "/login", "/register", "/admin/:path*"],
};
