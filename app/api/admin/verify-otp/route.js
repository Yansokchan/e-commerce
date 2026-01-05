import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const { code } = await request.json();
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 403 }
      );
    }

    // Find latest active OTP for this user
    const now = new Date().toISOString();
    const { data: otpRecord, error: fetchError } = await supabase
      .from("admin_otp_codes")
      .select("*")
      .eq("email", user.email)
      .eq("used", false)
      .gte("expires_at", now)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !otpRecord) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired code request" },
        { status: 401 }
      );
    }

    // Check failed attempts
    if (otpRecord.failed_attempts >= 5) {
      // Create cookie response first
      const response = NextResponse.json(
        {
          success: false,
          message: "Too many failed attempts. Please request a new code.",
        },
        { status: 429 }
      );

      // Optionally mark as used to kill it completely or just leave it blocked
      await supabase
        .from("admin_otp_codes")
        .update({ used: true })
        .eq("id", otpRecord.id);

      return response;
    }

    // Check if code matches
    if (otpRecord.code !== code) {
      // Increment failed attempts
      await supabase
        .from("admin_otp_codes")
        .update({ failed_attempts: (otpRecord.failed_attempts || 0) + 1 })
        .eq("id", otpRecord.id);

      return NextResponse.json(
        {
          success: false,
          message: `Invalid code. ${
            4 - (otpRecord.failed_attempts || 0)
          } attempts remaining.`,
        },
        { status: 401 }
      );
    }

    // Mark OTP as used
    await supabase
      .from("admin_otp_codes")
      .update({ used: true })
      .eq("id", otpRecord.id);

    // Set admin session cookie (10 minutes)
    const response = NextResponse.json({ success: true });

    response.cookies.set("admin_session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60, // 10 minutes (was 1 hour? maxAge is in seconds. 60*60 = 1 hr. Comment says 10 mins?)
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
