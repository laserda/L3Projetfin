import { NextRequest, NextResponse } from "next/server";

import { cookies } from "next/headers";
import { decrypt } from "./server/sessions";

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    const cookie = await cookies();
    const session = cookie.get("session")?.value;

    const decryptedSession = await decrypt(session);

    // console.log(decryptedSession);

    // const sessionCookie = getSessionCookie(request);

    if (decryptedSession) {
        if (
            request.nextUrl.pathname === "/login" ||
            request.nextUrl.pathname === "/register"
        ) {
            return NextResponse.redirect(new URL("/", request.url));
        }
    } else {
        if (
            request.nextUrl.pathname === "/login" ||
            request.nextUrl.pathname === "/register"
        ) {
            return NextResponse.next();
        }
    }

    if (!session) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard", "/login", "/register", "/admin"], // Specify the routes the middleware applies to
};
