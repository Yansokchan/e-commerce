import { BakongKHQR, khqrData, IndividualInfo } from "bakong-khqr";
import axios from "axios";

// In-memory cache for the Bakong access token
let tokenCache = {
  accessToken: null,
  cookies: null,
  expiresAt: 0,
};

/**
 * Generate KHQR Data using bakong-khqr library
 */
export function generateKHQR({
  bakongId = process.env.BAKONG_ACCOUNT_ID || "sokchan_yan@aclb",
  merchantName = process.env.BAKONG_MERCHANT_NAME || "Sokchan Yan",
  merchantCity = "PHNOM PENH",
  amount = 0,
  currency = "KHR",
  billNumber = "",
  storeLabel = "Socheath Store",
  expirationTimestamp = Date.now() + 5 * 60 * 1000,
}) {
  const optionalData = {
    currency:
      currency === "KHR" ? khqrData.currency.khr : khqrData.currency.usd,
    amount: parseFloat(amount),
    billNumber: billNumber,
    storeLabel: storeLabel,
    terminalLabel: "Online Payment",
    expirationTimestamp: expirationTimestamp,
    merchantCategoryCode: "5999",
  };

  const individualInfo = new IndividualInfo(
    bakongId,
    merchantName,
    merchantCity,
    optionalData
  );

  const khqr = new BakongKHQR();
  const response = khqr.generateIndividual(individualInfo);

  // response.data will contain { qr, md5 }
  return response.data;
}

/**
 * Fetch dynamic access token from Bakong API
 */
export async function getBakongToken() {
  // 0. Use static token if provided in .env
  if (process.env.BAKONG_ACCESS_TOKEN) {
    return process.env.BAKONG_ACCESS_TOKEN;
  }

  // 1. If we have a valid token in cache, return it
  if (tokenCache.accessToken && Date.now() < tokenCache.expiresAt) {
    return tokenCache.accessToken;
  }

  const RAW_BASE_URL =
    process.env.BAKONG_BASE_URL || "https://api-bakong.nbc.gov.kh/v1";
  const BAKONG_BASE_URL = RAW_BASE_URL.replace(/\/$/, "");
  const merchantId = process.env.BAKONG_MERCHANT_ID;
  const secret = process.env.BAKONG_SECRET;

  if (!merchantId || !secret) {
    const errorMsg = `Bakong Config Missing: ${
      !merchantId ? "BAKONG_MERCHANT_ID " : ""
    }${!secret ? "BAKONG_SECRET" : ""}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  console.log("Fetching new Bakong access token...");
  try {
    const response = await fetch(`${BAKONG_BASE_URL}/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Origin: "https://bakong.nbc.gov.kh",
        Referer: "https://bakong.nbc.gov.kh/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({
        merchant_id: merchantId,
        secret: secret,
      }),
    });

    const data = await response.json();

    if (
      // check data.responseCode explicitly
      data &&
      data.responseCode === 0 &&
      data.data?.access_token
    ) {
      const accessToken = data.data.access_token;
      const expiresIn = data.data.expires_in || 3600;
      // Fetch headers structure is different from axios
      const cookieHeader = response.headers.get("set-cookie");
      const cookies = cookieHeader ? [cookieHeader] : null;

      // Store the new token
      tokenCache.accessToken = accessToken;
      tokenCache.cookies = cookies;
      tokenCache.expiresAt = Date.now() + (expiresIn - 60) * 1000;

      return accessToken;
    } else {
      const msg = data?.responseMessage || "Auth failed";
      console.error("Bakong Login Failed:", data);
      throw new Error(`Bakong: ${msg}`);
    }
  } catch (error) {
    const errorMsg = error.response?.data?.responseMessage || error.message;
    console.error("Bakong Auth Error:", errorMsg);
    throw new Error(errorMsg);
  }
}

export async function getBakongAuth() {
  const token = await getBakongToken();
  return { token, cookies: tokenCache.cookies };
}
