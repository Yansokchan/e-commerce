import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const data = searchParams.get("data");

  if (!data) {
    return new Response("Missing data", { status: 400 });
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(
    data
  )}`;

  try {
    const response = await fetch(qrUrl);
    const blob = await response.blob();
    const contentType = response.headers.get("content-type") || "image/png";

    return new Response(blob, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("QR Proxy Error:", error);
    return new Response("Error fetching QR", { status: 500 });
  }
}
