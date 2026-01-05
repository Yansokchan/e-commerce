import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Sanitize credentials
    let botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
    const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
    if (botToken && botToken.startsWith("bot")) botToken = botToken.slice(3);

    // Initialize Supabase Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase credentials missing");
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn("Using ANON KEY for Supabase. RLS might block inserts.");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { phone, address, items, total, user } = await request.json();

    if (!phone || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing phone or items" },
        { status: 400 }
      );
    }

    // Sanitize credentials
    if (botToken && botToken.startsWith("bot")) botToken = botToken.slice(3);

    if (!botToken || !chatId) {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    // Format Caption
    const itemsList = items
      .map((item) => `- ${item.name} x${item.quantity} ($${item.price})`)
      .join("\n");

    const caption = `
📦 *New Order Received*

👤 *Customer*: ${user?.email || "Guest"}
📱 *Phone*: ${phone}
📍 *Address*: ${address || "N/A"}

🛒 *Items*:
${itemsList}

💰 *Total*: $${total}
    `.trim();

    // Collect all unique product images (max 10 for telegram album)
    const mediaGroup = [];
    items.forEach((item) => {
      if (item.images?.length > 0) {
        // Add first image of each product
        if (mediaGroup.length < 10) {
          mediaGroup.push({
            type: "photo",
            media: item.images[0],
          });
        }
      }
    });

    let telegramUrl = "";
    let body = {};

    if (mediaGroup.length > 0) {
      // Send Album (Group of Photos)
      // Attach caption to the first photo
      mediaGroup[0].caption = caption;
      mediaGroup[0].parse_mode = "Markdown";

      // Use sendMediaGroup if > 1 image, otherwise sendPhoto works better for single
      if (mediaGroup.length > 1) {
        telegramUrl = `https://api.telegram.org/bot${botToken}/sendMediaGroup`;
        body = {
          chat_id: chatId,
          media: mediaGroup,
        };
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
      // Text Only fallback
      telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      body = {
        chat_id: chatId,
        text: caption,
        parse_mode: "Markdown",
      };
    }

    // 1. Save to Supabase
    // Note: We initialized supabase at the start of the function

    const { data: orderData, error: dbError } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id || null, // Link if logged in
        items: items, // JSONB
        total: total,
        phone: phone,
        location: address,
        status: "pending",
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

    // Send Request
    try {
      const response = await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // Order saved successfully and notified
      // 2. Clear Cart in DB if user is logged in
      if (user?.id) {
        const { error: clearCartError } = await supabase
          .from("carts")
          .update({ items: {} }) // Clear items
          .eq("user_id", user.id);

        if (clearCartError) {
          console.error("Failed to clear remote cart:", clearCartError);
          // Non-critical: we continue as the order was successful
        }
      }
    } catch (telegramError) {
      console.error("Telegram Error:", telegramError);

      // If failed, update status to 'failed'
      if (orderData?.id) {
        await supabase
          .from("orders")
          .update({ status: "failed" })
          .eq("id", orderData.id);
      }

      // Rethrow or return error depending on desired UX.
      // User wants to know if it failed.
      throw telegramError;
    }

    return NextResponse.json({ success: true, orderId: orderData.id });
  } catch (error) {
    console.error("Error sending order:", error);
    return NextResponse.json(
      { error: "Failed to process order" },
      { status: 500 }
    );
  }
}
