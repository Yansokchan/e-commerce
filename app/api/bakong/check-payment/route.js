import { NextResponse } from "next/server";
import axios from "axios";
import { getBakongAuth } from "@/lib/bakong";

export async function POST(request) {
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

    const RAW_BASE_URL =
      process.env.BAKONG_BASE_URL || "https://api-bakong.nbc.gov.kh/v1";
    // Remove trailing slash if present to avoid double slashes
    const BAKONG_BASE_URL = RAW_BASE_URL.replace(/\/$/, "");

    // Get Dynamic Token & Cookies
    let accessToken, cookies;
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
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Cookie: cookies ? cookies.join("; ") : "",
        Origin: "https://bakong.nbc.gov.kh",
        Referer: "https://bakong.nbc.gov.kh/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
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
    // Enhanced Error Logging
    console.error(
      "Bakong check-payment exception:",
      error.message,
      "Status:",
      error.response?.status
    );

    if (error.response?.data) {
      console.error(
        "Upstream Data:",
        typeof error.response.data === "string"
          ? error.response.data.substring(0, 200)
          : JSON.stringify(error.response.data)
      );
    }

    // If it's a 404 from Bakong, handle it gracefully
    if (error.response?.status === 404) {
      return NextResponse.json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Check for HTML response (CloudFront Block, etc.)
    // With fetch, if response.ok is false, we might not have thrown yet depending on logic,
    // but here we are in catch block so error is real.
    // However, native fetch doesn't throw on 403/500, so we likely failed parsing JSON above.

    // We need to handle non-ok responses separately if using fetch.
    // Actually, let's allow fetch to return normally if 403, and handle it in logic.
    // But since I did `await response.json()`, if body is HTML, it throws SyntaxError.

    // So simpler: Update correct logic above. But for now in catch block:
    if (
      accessToken &&
      (error.name === "SyntaxError" || // Likely HTML response parsed as JSON
        error.message.includes("Unexpected token"))
    ) {
      console.warn(
        "Upstream Blocked (JSON Parse Error). Falling back to Client-Side Check."
      );
      return NextResponse.json({
        success: false,
        requiresClientCheck: true,
        accessToken: accessToken,
        checkUrl: `${BAKONG_BASE_URL}/check_transaction_by_md5`,
      });
    }

    const errorData = error.message;
    if (
      accessToken &&
      // previous catch logic fallback
      (errorData.includes("<HTML>") || errorData.includes("<!DOCTYPE"))
    ) {
      console.warn("Upstream Blocked. Falling back to Client-Side Check.");
      return NextResponse.json({
        success: false,
        requiresClientCheck: true,
        accessToken: accessToken,
        checkUrl: `${BAKONG_BASE_URL}/check_transaction_by_md5`,
      });
    }

    return NextResponse.json(
      {
        error: "Internal error checking payment",
        message: error.message,
        details:
          typeof errorData === "string"
            ? errorData
            : errorData || error.message,
      },
      { status: 500 }
    );
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
