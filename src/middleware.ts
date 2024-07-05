import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export { default } from "next-auth/middleware";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
	const token = await getToken({ req: request });
	const url = request.nextUrl;

	if (
		(token && 
      (
        url.pathname.startsWith("/sign-in") ||
        url.pathname.startsWith("/sign-up") ||
        url.pathname.startsWith("/verify")
      )
    )
	) {
		return NextResponse.redirect(new URL("/", request.url));
	}
	if (!token && url.pathname.startsWith("/dashboard") ) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }
  return NextResponse.next()
}

export const config = {
	matcher: ["/", "/sign-up", "/sign-in", "/dashboard/:path*", "/verify/:path*"],
};
