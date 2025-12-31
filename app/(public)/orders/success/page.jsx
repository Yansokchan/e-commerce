"use client";
import Link from "next/link";
import { CheckCircle2Icon, ShoppingBagIcon } from "lucide-react";

export default function OrderSuccessPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="mb-8 animate-bounce">
        <CheckCircle2Icon size={80} className="text-green-500" />
      </div>

      <h1 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4">
        Order Placed Successfully!
      </h1>

      <p className="text-lg text-slate-500 max-w-lg mb-8">
        Thank you for your purchase. We have sent the order details to our team
        via Telegram. We will contact you shortly to confirm the delivery.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/shop"
          className="flex items-center gap-2 bg-slate-800 text-white px-8 py-3 rounded-lg hover:bg-slate-900 transition active:scale-95"
        >
          <ShoppingBagIcon size={20} />
          Continue Shopping
        </Link>

        <Link
          href="/"
          className="px-8 py-3 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition active:scale-95"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}
