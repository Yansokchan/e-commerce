"use client";
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import OnboardingModal from "@/components/OnboardingModal";
import ProfileEditModal from "@/components/ProfileEditModal";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setUser,
  clearUser,
  setNeedsOnboarding,
  completeOnboarding,
} from "@/lib/features/auth/authSlice";
import { useSearchParams, useRouter } from "next/navigation";

export default function PublicLayout({ children }) {
  const dispatch = useDispatch();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);
  const needsOnboarding = useSelector((state) => state.auth.needsOnboarding);

  useEffect(() => {
    // Helper to fetch profile and dispatch
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
            ...profile, // Merge profile data (phone, location) into metadata for easy access
          },
        };

        dispatch(setUser(enrichedUser));

        // Immediate check using metadata
        const hasCompletedOnboarding =
          sessionUser.user_metadata?.onboarding_completed ||
          profile?.onboarding_completed;

        if (!hasCompletedOnboarding) {
          dispatch(setNeedsOnboarding(true));
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // Fallback to basic user if profile fetch fails
        dispatch(setUser(sessionUser));
      }
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfileAndSetUser(session.user);

        // Check if onboarding query param is present
        const isUrlOnboarding = searchParams.get("onboarding") === "true";
        if (isUrlOnboarding) {
          dispatch(setNeedsOnboarding(true));
          router.replace("/");
        }
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // If we already have the user in store and it matches session, we might skip,
        // but for safety/updates we refetch.
        // However, onAuthStateChange fires frequently.
        // We'll rely on fetchProfileAndSetUser to handle the dispatch.
        fetchProfileAndSetUser(session.user);
      } else {
        // User logged out - clear everything
        dispatch(clearUser());
        dispatch(completeOnboarding()); // Reset onboarding state
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch, supabase, searchParams, router]);

  const handleOnboardingComplete = () => {
    dispatch(completeOnboarding());
  };

  return (
    <>
      <Banner />
      <Navbar />
      {children}
      <Footer />
      <LoginModal />
      <ProfileEditModal />
      {needsOnboarding && user && (
        <OnboardingModal user={user} onComplete={handleOnboardingComplete} />
      )}
    </>
  );
}
