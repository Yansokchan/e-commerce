"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "../Loading";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import { createClient } from "@/lib/supabase/client";
import RippleButton from "../ui/ripple-button";
import {
  Loader2,
  Mail,
  KeyRound,
  ArrowRight,
  Smartphone,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";

const AdminLayout = ({ children }) => {
  const [authState, setAuthState] = useState("loading"); // loading, login, sendOtp, verifyOtp, unlocked, unauthorized
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Skip auth check if already in verifyOtp state (user is typing code)
    if (authState === "verifyOtp") {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        // Check if user is logged in
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setAuthState("login");
          setLoading(false);
          return;
        }

        // Check if admin email
        if (user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
          setAuthState("unauthorized");
          router.push("/");
          return;
        }

        // Check session via server-side API
        const response = await fetch("/api/admin/session");
        const data = await response.json();

        if (data.isUnlocked) {
          setAuthState("unlocked");
        } else {
          // Only set to sendOtp if not already in OTP flow
          setAuthState((prev) => (prev === "verifyOtp" ? prev : "sendOtp"));
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setAuthState("login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes - but don't interrupt OTP flow
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session && authState !== "verifyOtp") {
        checkAuth();
      } else if (event === "SIGNED_OUT") {
        setAuthState("login");
      }
    });

    return () => subscription.unsubscribe();
  }, [authState]);

  const handleOtpSuccess = () => {
    setAuthState("unlocked");
  };

  if (loading || authState === "unauthorized") {
    return <Loading />;
  }

  // Not logged in - show Google login
  if (authState === "login") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <AdminLoginModal />
      </div>
    );
  }

  // Logged in - show Send OTP modal
  if (authState === "sendOtp") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <AdminSendOTPModal
          onProceed={() => {
            setAuthState("verifyOtp");
          }}
        />
      </div>
    );
  }

  // Show Verify OTP modal
  if (authState === "verifyOtp") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <AdminVerifyOTPModal onSuccess={handleOtpSuccess} />
      </div>
    );
  }

  // Fully authenticated
  return (
    <div className="flex flex-col h-screen">
      <AdminNavbar />
      <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
        <AdminSidebar />
        <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll">
          {children}
        </div>
      </div>
    </div>
  );
};

// =====================
// Google Login Modal
// =====================
function AdminLoginModal() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/admin`,
      },
    });
    if (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-xl backdrop-blur-2xl bg-white/95 p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-pink-600">Admin Access</h2>
          <p className="mt-2 text-slate-500 font-medium tracking-tight">
            Sign in with your admin Google account
          </p>
        </div>

        <div className="mt-8">
          <RippleButton
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-br from-pink-600 to-pink-500 px-4 py-3 text-sm font-medium text-white shadow-xl hover:bg-gray-50 focus:outline-none transition-all disabled:opacity-50 ring-offset-[0.5px] ring-white/20"
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

        <p className="mt-8 text-center text-xs text-gray-500">
          Only authorized admin email can access this dashboard
        </p>
      </div>
    </div>
  );
}

// =====================
// Send OTP Modal
// =====================
function AdminSendOTPModal({ onProceed }) {
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSendEmailOTP = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/send-otp", {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Verification code sent!");
        onProceed();
      } else {
        toast.error(data.message);
        if (data.waitSeconds) {
          setCooldown(data.waitSeconds);
        }
      }
    } catch (err) {
      toast.error("Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-xl backdrop-blur-2xl bg-white/95 p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pink-600 to-pink-400 rounded-full flex items-center justify-center mb-4">
            <Mail className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Verify Identity</h2>
          <p className="mt-2 text-slate-500 font-medium tracking-tight">
            Check your email for the code
          </p>
        </div>

        <div className="mt-8">
          <RippleButton
            onClick={handleSendEmailOTP}
            disabled={loading || cooldown > 0}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-br from-pink-600 to-pink-500 px-4 py-3 text-sm font-medium text-white shadow-xl transition-all disabled:opacity-50"
          >
            <div className="flex items-center justify-center gap-2 w-full px-4">
              {loading ? (
                <Loader2 className="animate-spin text-white" size={20} />
              ) : (
                <ArrowRight size={20} />
              )}
              <span className="text-base font-semibold text-white">
                {loading
                  ? "Sending..."
                  : cooldown > 0
                  ? `Wait ${cooldown}s`
                  : "Send Verification Code"}
              </span>
            </div>
          </RippleButton>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Code expires after 5 minutes
        </p>
      </div>
    </div>
  );
}

// =====================
// Verify OTP Modal
// =====================
function AdminVerifyOTPModal({ onSuccess }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60); // Start with 60s countdown

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();

      if (data.success) {
        onSuccess();
      } else {
        toast.error(data.message);
        setCode("");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to verify code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const response = await fetch("/api/admin/send-otp", {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        setResendCooldown(60);
        toast.success("Verification code sent!");
      } else {
        toast.error(data.message);
        if (data.waitSeconds) {
          setResendCooldown(data.waitSeconds);
        }
      }
    } catch (err) {
      toast.error("Failed to resend code");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-xl backdrop-blur-2xl bg-white/95 p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pink-600 to-pink-400 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="text-white" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">Enter Code</h2>
          <p className="mt-2 text-slate-500 font-medium tracking-tight">
            Check your email for the code
          </p>
        </div>

        <form onSubmit={handleVerify} className="mt-8">
          <div className="flex justify-center gap-[6px] sm:gap-2 mb-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={code[index] || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!/^[0-9]*$/.test(val)) return;

                  const newCode = code.split("");
                  newCode[index] = val;
                  const newCodeStr = newCode.join("");
                  setCode(newCodeStr);

                  // Auto focus next
                  if (val && index < 5) {
                    document.getElementById(`otp-${index + 1}`)?.focus();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !code[index] && index > 0) {
                    document.getElementById(`otp-${index - 1}`)?.focus();
                  }
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedData = e.clipboardData
                    .getData("text")
                    .slice(0, 6)
                    .replace(/\D/g, "");
                  if (pastedData) {
                    setCode(pastedData);
                    // Focus the last filled input or the next empty one
                    const nextIndex = Math.min(pastedData.length, 5);
                    document.getElementById(`otp-${nextIndex}`)?.focus();
                  }
                }}
                className="w-11 h-11 sm:w-12 sm:h-12 text-center text-2xl font-bold bg-gray-50 rounded-md focus:border-pink-500/30 focus:ring-2 focus:ring-pink-500/10 outline-none transition-all shadow-sm border border-white/40 text-pink-600 placeholder-gray-300"
                placeholder="-"
                required={index === 0} // Only first required strictly for form submission logic to prompt
                autoFocus={index === 0}
              />
            ))}
          </div>

          <RippleButton
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-gradient-to-r from-pink-600 to-pink-400 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 ring-2 ring-white/40"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin text-white" size={20} />
                Verifying...
              </div>
            ) : (
              "Verify Code"
            )}
          </RippleButton>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="text-sm text-pink-600 hover:text-pink-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {resendCooldown > 0
              ? `Resend code in ${resendCooldown}s`
              : "Resend code"}
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================
// Google Icon
// =====================
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

export default AdminLayout;
