"use client";
import { useEffect, useState, Suspense } from "react";
import { useDispatch } from "react-redux";
import { createClient } from "@/lib/supabase/client";
import {
  setUser,
  clearUser,
  setNeedsOnboarding,
} from "@/lib/features/auth/authSlice";
import { useSearchParams, useRouter } from "next/navigation";

function AuthLogic({ children }) {
  const dispatch = useDispatch();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const fetchProfileAndSetUser = async (sessionUser) => {
      try {
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", sessionUser.id)
          .single();

        const enrichedUser = {
          ...sessionUser,
          user_metadata: {
            ...sessionUser.user_metadata,
            ...profile,
          },
        };

        dispatch(setUser(enrichedUser));

        const hasCompletedOnboarding =
          sessionUser.user_metadata?.onboarding_completed ||
          profile?.onboarding_completed;

        if (!hasCompletedOnboarding) {
          dispatch(setNeedsOnboarding(true));
        }

        // Check if onboarding query param is present
        const isUrlOnboarding = searchParams.get("onboarding") === "true";
        if (isUrlOnboarding) {
          dispatch(setNeedsOnboarding(true));
          // Remove query param without reload
          router.replace("/");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        dispatch(setUser(sessionUser));
      }
    };

    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          // Set basic user immediately to unblock UI
          dispatch(setUser(session.user));
          // Fetch profile in background
          fetchProfileAndSetUser(session.user);
        } else {
          dispatch(clearUser());
        }
      } catch (error) {
        console.error("Error checking auth session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Set basic user immediately
        dispatch(setUser(session.user));
        // Verify/Enrich in background
        fetchProfileAndSetUser(session.user);
      } else {
        dispatch(clearUser());
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch, supabase, searchParams, router]);

  // Don't block rendering.
  // If loading is true, we just render children.
  // The user state will be null initially and update when checkUser completes.
  // This prevents the white screen of death.

  return children;
}

export default function AuthProvider({ children }) {
  return (
    <Suspense fallback={null}>
      <AuthLogic>{children}</AuthLogic>
    </Suspense>
  );
}
