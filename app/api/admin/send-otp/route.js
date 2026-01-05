import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
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

    // Check for recent OTP (1 minute cooldown)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { data: recentOTP } = await supabase
      .from("admin_otp_codes")
      .select("id, created_at")
      .eq("email", user.email)
      .gte("created_at", oneMinuteAgo)
      .order("created_at", { ascending: false })
      .limit(1);

    if (recentOTP && recentOTP.length > 0) {
      const createdAt = new Date(recentOTP[0].created_at);
      const waitSeconds = Math.ceil(
        (60000 - (Date.now() - createdAt.getTime())) / 1000
      );
      return NextResponse.json(
        {
          success: false,
          message: `Please wait ${waitSeconds} seconds before requesting a new code`,
          waitSeconds,
        },
        { status: 429 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Save to database
    const { error: insertError } = await supabase
      .from("admin_otp_codes")
      .insert({
        email: user.email,
        code: otp,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error("Error saving OTP:", insertError);
      return NextResponse.json(
        { success: false, message: "Failed to generate code" },
        { status: 500 }
      );
    }

    // Send email via Resend
    const { error: emailError } = await resend.emails.send({
      from: "Admin <onboarding@resend.dev>", // Change to your verified domain
      to: user.email,
      subject: "Your Admin Access Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Admin Access Code</h2>
          <p style="color: #666; text-align: center;">Use this code to access your admin dashboard:</p>
          <div style="background: linear-gradient(135deg, #ec4899, #db2777); color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 10px; letter-spacing: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #999; text-align: center; font-size: 12px;">This code expires in 10 minutes.</p>
          <p style="color: #999; text-align: center; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      return NextResponse.json(
        { success: false, message: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email",
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
