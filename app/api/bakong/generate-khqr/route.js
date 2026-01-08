import { generateKHQR } from "@/lib/bakong";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the total number of orders to generate a sequential-looking ID (optional, but following user logic)
    const { count, error: countError } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    if (countError) throw countError;

    const newOrderNumber = (count || 0) + 1;
    const timestamp = Date.now();
    const orderIdStr = `ORDER_${String(newOrderNumber).padStart(
      5,
      "0"
    )}_${timestamp}`;

    // Expiration timestamp (5 mins from now)
    const expirationTimestamp = new Date(Date.now() + 5 * 60 * 1000);

    const { amount, currency = "KHR" } = await request.json();

    // Use the helper from lib/bakong.js
    const qrData = generateKHQR({
      amount: amount || 0,
      currency: currency,
      billNumber: orderIdStr,
      expirationTimestamp: expirationTimestamp.getTime(),
    });

    return NextResponse.json({
      success: true,
      message: "QR generated successfully",
      data: {
        orderId: orderIdStr,
        qr: qrData.qr,
        md5: qrData.md5,
        expiration: expirationTimestamp.getTime(),
        generationTime: timestamp,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
