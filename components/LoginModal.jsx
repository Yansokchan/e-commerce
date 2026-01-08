"use client";

import { createClient } from "@/lib/supabase/client";
import { useDispatch, useSelector } from "react-redux";
import { closeLoginModal } from "@/lib/features/auth/authSlice";
import { useState } from "react";
import RippleButton from "./ui/ripple-button";
import { Loader2, X } from "lucide-react";

const GoogleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.01.67-2.28 1.05-3.71 1.05-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Modal Box */}
      <div className="relative w-full max-w-md rounded-xl backdrop-blur-2xl bg-white/95 p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-5 top-5 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-pink-600">
            Welcome to{" "}
            <p className="text-slate-700">
              <span className="text-pink-600">socheath</span>store
              <span className="text-pink-600 text-5xl leading-0">.</span>
            </p>
          </h2>
          <p className="mt-2 text-slate-500 font-medium tracking-tight">
            Sign in to continue your shopping journey
          </p>
        </div>

        <div className="mt-8">
          <RippleButton
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-br from-pink-600 to-pink-500 px-4 py-3 text-sm font-medium text-white shadow-xl focus:outline-none transition-all disabled:opacity-50 ring-1 ring-inset ring-white/20"
          >
            <div className="flex items-center justify-center gap-2 w-full px-4">
              {loading ? (
                <Loader2 className="animate-spin text-white" size={20} />
              ) : (
                <GoogleIcon />
              )}
              <span className="text-base font-semibold text-white">
                {loading ? "Connecting..." : "Continue with Google"}
              </span>
            </div>
          </RippleButton>
        </div>

        <p className="mt-8 text-center text-xs text-gray-700 leading-relaxed px-4">
          By continuing, you agree to our{" "}
          <span className="text-pink-500 cursor-pointer hover:underline">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="text-pink-500 cursor-pointer hover:underline">
            Privacy Policy
          </span>
        </p>
      </div>
    </div>
  );
}
