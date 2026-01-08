import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { generateKHQR, getBakongToken } from "@/lib/bakong";
import axios from "axios";

export async function POST(request) {
  try {
    const {
      phone,
      address,
      items,
      total,
      user,
      payment_method,
      bakongData: clientBakongData,
    } = await request.json();

    let bakongData = clientBakongData;
    if (payment_method === "bakong" && !bakongData) {
      bakongData = generateKHQR({ amount: total });
    }

    if (!phone || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing phone or items" },
        { status: 400 }
      );
    }

    // --- BAKONG VERIFICATION STEP ---
    if (payment_method === "bakong") {
      if (!bakongData?.md5) {
        return NextResponse.json(
          { error: "Bakong data missing" },
          { status: 400 }
        );
      }

      const BAKONG_BASE_URL =
        process.env.BAKONG_API_URL || "https://api-bakong.nbc.gov.kh/v1";
      try {
        const accessToken = await getBakongToken();
        const bakongRes = await axios.post(
          `${BAKONG_BASE_URL}/check_transaction_by_md5`,
          { md5: bakongData.md5 },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (bakongRes.data?.responseCode !== 0 || !bakongRes.data?.data?.hash) {
          console.log("Bakong Verify Failed:", JSON.stringify(bakongRes.data));
          return NextResponse.json(
            { error: "Payment not verified or not completed yet" },
            { status: 400 }
          );
        }
        // Payment is legit!
        const trans = bakongRes.data.data;
        bakongData.hash = trans.hash;

        // Final sanity check: amount matches (roughly)
        console.log(
          `Telegram Bot verified Bakong. Hash: ${trans.hash}, Amount: ${trans.amount} ${trans.currency}`
        );
      } catch (err) {
        console.error("Bakong re-verify error:", err);
        return NextResponse.json(
          { error: "Failed to verify Bakong payment", details: err.message },
          { status: 500 }
        );
      }
    }

    // Sanitize credentials
    let botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
    const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
    if (botToken && botToken.startsWith("bot")) botToken = botToken.slice(3);

    if (!botToken || !chatId) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Format Caption
    const itemsList = items
      .map((item) => `- ${item.name} x${item.quantity} ($${item.price})`)
      .join("\n");

    const header =
      payment_method === "bakong"
        ? "✅ *Payment Confirmed (Bakong)*"
        : "📦 *New Order Received*";
    const caption = `
${header}

👤 *Customer*: ${user?.email || "Guest"}
📱 *Phone*: ${phone}
📍 *Address*: ${address || "N/A"}
💳 *Payment*: ${
      payment_method === "bakong"
        ? "Bakong KHQR (Paid)"
        : "Telegram/Cash (Pending)"
    }

🛒 *Items*:
${itemsList}

💰 *Total*: $${total}
    `.trim();

    // Collect images
    const mediaGroup = [];
    items.forEach((item) => {
      if (item.images?.length > 0 && mediaGroup.length < 10) {
        mediaGroup.push({ type: "photo", media: item.images[0] });
      }
    });

    let telegramUrl = "";
    let body = {};
    if (mediaGroup.length > 0) {
      mediaGroup[0].caption = caption;
      mediaGroup[0].parse_mode = "Markdown";
      if (mediaGroup.length > 1) {
        telegramUrl = `https://api.telegram.org/bot${botToken}/sendMediaGroup`;
        body = { chat_id: chatId, media: mediaGroup };
      } else {
        telegramUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;
        body = {
          chat_id: chatId,
          photo: mediaGroup[0].media,
          caption: caption,
          parse_mode: "Markdown",
        };
      }
    } else {
      telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      body = { chat_id: chatId, text: caption, parse_mode: "Markdown" };
    }

    // Initialize Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Save to Supabase
    const { data: orderData, error: dbError } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id || null,
        items,
        total,
        phone,
        location: address,
        status: payment_method === "bakong" ? "confirmed" : "pending",
        payment_method: payment_method || "telegram",
        payment_status: payment_method === "bakong" ? "paid" : "pending",
        bakong_md5: bakongData?.md5 || null,
        bakong_hash: bakongData?.hash || null,
        qr_string: bakongData?.qr || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Supabase DB Error:", dbError);
      return NextResponse.json(
        { error: `Database Error: ${dbError.message}` },
        { status: 500 }
      );
    }

    // Send Telegram Notification
    try {
      const tgRes = await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!tgRes.ok) throw new Error(await tgRes.text());

      // Clear Cart in DB if logged in
      if (user?.id) {
        await supabase
          .from("carts")
          .update({ items: {} })
          .eq("user_id", user.id);
      }
    } catch (telegramError) {
      console.error("Telegram Error:", telegramError);
    }

    return NextResponse.json({
      success: true,
      orderId: orderData.id,
      bakongData,
    });
  } catch (error) {
    console.error("Error processing order:", error);
    return NextResponse.json(
      { error: "Failed to process order" },
      { status: 500 }
    );
  }
}
