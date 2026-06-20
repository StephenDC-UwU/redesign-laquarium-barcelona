import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales } from "@/types/Locale";

export function proxy(request: NextRequest){

    const {pathname} = request.nextUrl;

    const pathnameHasLocale = locales.some((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`);


    const localLang = locales[0];

    if (pathnameHasLocale) {
        return NextResponse.next();
    }

    request.nextUrl.pathname = `/${localLang}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)']
}

