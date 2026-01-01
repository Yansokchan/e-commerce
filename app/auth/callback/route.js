import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/lib/supabase/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Check if user has completed onboarding
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // First check Auth Metadata (fastest)
        const hasCompletedOnboarding = user.user_metadata?.onboarding_completed;
        let needsOnboarding = !hasCompletedOnboarding;

        // If metadata says not completed, double check DB (just in case they finished but metadata didn't sync)
        if (needsOnboarding) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("onboarding_completed")
            .eq("id", user.id)
            .single();

          if (profile?.onboarding_completed) {
            needsOnboarding = false;
            // Sync metadata back if DB says they are done
            await supabase.auth.updateUser({
              data: { onboarding_completed: true },
            });
          }
        }

        const redirectPath = needsOnboarding ? "/?onboarding=true" : next;

        const forwardedHost = request.headers.get("x-forwarded-host");
        const isLocalEnv = process.env.NODE_ENV === "development";

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${redirectPath}`);
        } else if (forwardedHost) {
          return NextResponse.redirect(
            `https://${forwardedHost}${redirectPath}`
          );
        } else {
          return NextResponse.redirect(`${origin}${redirectPath}`);
        }
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
