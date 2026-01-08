import { NextResponse } from "next/server";
import axios from "axios";
import { getBakongAuth } from "@/lib/bakong";

export async function POST(request) {
  try {
    return await handlePost(request);
  } catch (fatalError) {
    console.error("FATAL API ERROR:", fatalError);
    return NextResponse.json(
      {
        error: "Fatal Internal Error",
        message: fatalError.message,
      },
      { status: 500 }
    );
  }
}

async function handlePost(request) {
  let accessToken = null;
  const RAW_BASE_URL =
    process.env.BAKONG_BASE_URL || "https://api-bakong.nbc.gov.kh/v1";
  const BAKONG_BASE_URL = RAW_BASE_URL.replace(/\/$/, "");

  try {
    const {
      md5,
      amount: expectedAmount,
      generationTime,
    } = await request.json();
    console.log("Checking payment for MD5:", md5, "Expected:", expectedAmount);

    if (!md5) {
      return NextResponse.json({ error: "MD5 is required" }, { status: 400 });
    }

    // Get Dynamic Token & Cookies
    let cookies;
    try {
      const authData = await getBakongAuth();
      accessToken = authData.token;
      cookies = authData.cookies;
    } catch (tokenErr) {
      return NextResponse.json(
        { error: "Bakong Auth Failed", details: tokenErr.message },
        { status: 500 }
      );
    }

    const checkUrl = `${BAKONG_BASE_URL}/check_transaction_by_md5`;
    console.log(`Checking Payment at: ${checkUrl} for MD5: ${md5}`);

    // Call Bakong API to check payment
    const response = await fetch(checkUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        // Minimum headers to look like a standard API client, not a browser spoof
      },
      body: JSON.stringify({ md5 }),
    });

    const data = await response.json();
    // console.log("Bakong Raw Response for MD5", md5, ":", JSON.stringify(data));

    // responseCode 0 means success in Bakong API
    if (data.responseCode === 0 && data.data?.hash) {
      const trans = data.data;

      // 0. Verify Recipient ID (to avoid mixed transactions if shared merchant id)
      const expectedToPool =
        process.env.BAKONG_ACCOUNT_ID || "sokchan_yan@aclb";
      if (trans.toAccountId !== expectedToPool) {
        console.log(
          `Recipient mismatch. Expected: ${expectedToPool}, Actual: ${trans.toAccountId}`
        );
        return NextResponse.json({
          success: false,
          message: "Transaction found but recipient does not match.",
        });
      }

      // 1. Verify it's a NEW transaction (after QR generation)
      // We allow a small 5s buffer for server/client clock drift
      if (generationTime && trans.createdDateMs < generationTime - 5000) {
        console.log(
          "Ignore OLD transaction for MD5:",
          md5,
          "Created:",
          trans.createdDateMs,
          "Gen:",
          generationTime
        );
        return NextResponse.json({
          success: false,
          message: "Transaction found but it's old/stale.",
        });
      }

      // 2. Verify Amount (Optional but recommended)
      // If we have an expected amount, we should verify it roughly matches.
      // Note: If user pays KHR for USD QR, Bakong might return KHR amount.
      // For now, let's just log it or do a loose check.
      if (expectedAmount) {
        const actualAmount = trans.amount;
        // Basic check: if same currency, must match exactly.
        // If different, we might need a conversion rate, but for now let's just log.
        console.log(
          `Amount Check - Expected: ${expectedAmount}, Actual: ${actualAmount} ${trans.currency}`
        );
      }

      // console.log(`Payment confirmed for MD5: ${md5}, Hash: ${trans.hash}`);
      return NextResponse.json({
        success: true,
        message: "Payment confirmed",
        bakongHash: trans.hash,
        bakongData: trans,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: data.responseMessage || "Payment not found or not completed",
        bakongData: data.data || null,
        debug: {
          md5,
          responseCode: data.responseCode,
        },
      });
    }
  } catch (error) {
    console.error("Bakong Check Error:", error.message);

    // If we have an accessToken, we can try client fallback for ANY upstream error
    // (SyntaxError from HTML response, Network Error, etc.)
    if (accessToken) {
      console.warn("Upstream Blocked/Failed. Returning Client Fallback.");
      return NextResponse.json({
        success: false,
        requiresClientCheck: true,
        accessToken: accessToken,
        checkUrl: `${BAKONG_BASE_URL}/check_transaction_by_md5`,
      });
    }

    throw error; // If no token, we can't do fallback, so fatal error.
  }
}

// Health Check for Vercel Deployment Verification
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Bakong Check Payment Service is Running",
    env: {
      hasAccountId: !!process.env.BAKONG_ACCOUNT_ID,
      baseUrl:
        process.env.BAKONG_BASE_URL ||
        "https://api-bakong.nbc.gov.kh/v1 (default)",
    },
    timestamp: new Date().toISOString(),
  });
}
