"use client";

import { createClient } from "@/lib/supabase/client";
import { useDispatch, useSelector } from "react-redux";
import { closeLoginModal } from "@/lib/features/auth/authSlice";
import { useState } from "react";

export default function LoginModal() {
  const dispatch = useDispatch();
  const showLoginModal = useSelector((state) => state.auth.showLoginModal);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  if (!showLoginModal) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleClose = () => {
    dispatch(closeLoginModal());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose}></div>

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Sign in to continue
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please sign in to add items to your cart
          </p>
        </div>

        <div className="mt-8">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Redirecting..." : "Sign in with Google"}
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-gray-500">
          By signing in, you agree to our terms and privacy policy
        </p>
      </div>
    </div>
  );
}
