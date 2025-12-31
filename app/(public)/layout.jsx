"use client";
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoginModal from "@/components/LoginModal";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "@/lib/features/auth/authSlice";

export default function PublicLayout({ children }) {
  const dispatch = useDispatch();
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        dispatch(setUser(session.user));
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        dispatch(setUser(session.user));
      } else {
        dispatch(clearUser());
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch, supabase]);

  return (
    <>
      <Banner />
      <Navbar />
      {children}
      <Footer />
      <LoginModal />
    </>
  );
}
