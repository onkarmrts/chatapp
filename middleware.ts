import { NextResponse, type NextRequest } from "next/server";

// India-only gate. Vercel sets x-vercel-ip-country on every request.
// Locally the header is missing, so requests are allowed.
export function middleware(req: NextRequest) {
  if (process.env.ALLOW_ALL_COUNTRIES === "true") return NextResponse.next();

  const country = req.headers.get("x-vercel-ip-country");
  if (country && country !== "IN") {
    const url = req.nextUrl.clone();
    url.pathname = "/blocked";
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|blocked|legal).*)"],
};
