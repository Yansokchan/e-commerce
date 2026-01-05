"use client";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { createClient } from "@/lib/supabase/client";
import { setUser, clearUser } from "@/lib/features/auth/authSlice";

export default function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          dispatch(setUser(session.user));
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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        dispatch(setUser(session.user));
      } else {
        dispatch(clearUser());
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch, supabase]);

  if (loading) {
    return null; // Prevent mismatched renders or premature redirects
  }

  return children;
}
