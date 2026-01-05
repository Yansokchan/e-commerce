import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request) {
  // Update session first
  const response = await updateSession(request);

  // Check for protected routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Allow access to login page without checks
    if (request.nextUrl.pathname === "/admin/login") {
      return response;
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {},
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // First check: User must be logged in
    // If not logged in, AdminLayout will show login modal
    // No redirect needed here

    // Second check: User email must match ADMIN_EMAIL
    if (user && user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Admin session check is now handled by AdminLayout modal
    // Middleware just ensures user has admin email if logged in
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
