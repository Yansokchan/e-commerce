"use client";
import Link from "next/link";
import {
  CheckCircle2Icon,
  ShoppingBagIcon,
  Loader2,
  House,
  Download,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toPng } from "html-to-image";
import RippleButton from "@/components/ui/ripple-button";
import { format } from "date-fns";

export default function OrderSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [order, setOrder] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const receiptRef = useRef(null);

  useEffect(() => {
    const verifyOrder = async () => {
      if (!params?.orderId) {
        router.replace("/");
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", params.orderId)
        .single();

      if (error || !data) {
        // Invalid order ID
        router.replace("/");
      } else {
        setOrder(data);
        setIsValid(true);
      }
      setVerifying(false);
    };

    verifyOrder();
  }, [params, router]);

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(receiptRef.current, {
        cacheBust: true,
        backgroundColor: "#fff",
      });
      const link = document.createElement("a");
      link.download = `receipt-${params.orderId.slice(0, 8)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download receipt:", err);
    } finally {
      setDownloading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  if (!isValid) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-10 relative overflow-hidden">
      {/* Hidden Receipt Template for Capture */}
      <div className="absolute -left-[9999px] top-0">
        <div
          ref={receiptRef}
          className="w-[400px] bg-white p-8 text-left text-slate-800 font-sans"
        >
          <div className="text-center mb-8 border-b pb-6 border-slate-100">
            <h2 className="text-2xl font-black text-pink-600 tracking-tighter italic">
              socheath<span className="text-slate-800">store</span>
              <span className="text-3xl font-bold">.</span>
            </h2>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">
              Official Receipt
            </p>
          </div>

          <div className="flex justify-between text-[11px] mb-6 font-medium">
            <div className="text-slate-500">
              <p>ORDER ID</p>
              <p className="text-slate-800">#{params.orderId.slice(0, 8)}</p>
            </div>
            <div className="text-right text-slate-500">
              <p>DATE</p>
              <p className="text-slate-800">
                {order && format(new Date(order.created_at), "MMM dd, yyyy")}
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 border-b border-slate-50 pb-1">
              Items
            </p>
            {order?.items?.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-start text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-800">{item.name}</p>
                  <p className="text-[10px] text-slate-400">
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="font-bold text-slate-700">
                  ${(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-dashed border-slate-100 py-6 space-y-2">
            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span>Subtotal</span>
              <span>${order?.total?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span>Tax</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between text-lg font-black text-slate-900 pt-2 border-t border-slate-50">
              <span>Total</span>
              <span className="text-pink-600">
                ${order?.total?.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-pink-100/30 p-4 rounded-xl space-y-1 mt-2">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">
              Delivery Details
            </p>
            <p className="text-[10px] font-semibold text-slate-700">
              <span className="font-semibold text-slate-500">
                Phone Number:
              </span>{" "}
              {order?.phone}
            </p>
            <p className="text-[10px] font-semibold text-slate-700 ">
              <span className="font-semibold text-slate-500">Address:</span>{" "}
              {order?.location}
            </p>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-100 text-center">
            <p className="text-[11px] font-bold text-pink-600/80 italic">
              Thank you for shopping with socheath
              <span className="text-slate-800">store</span>
              <span className="text-xl font-bold">.</span>
            </p>
            <p className="text-[9px] text-slate-300 mt-1">
              Keep this for your records
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8 animate-bounce">
        <CheckCircle2Icon size={80} className="text-pink-600" />
      </div>

      <h1 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4 tracking-tight">
        Order Placed Successfully!
      </h1>

      <p className="text-sm md:text-lg text-slate-500 max-w-lg mb-8 font-medium leading-relaxed">
        Thank you for your purchase. We have received your order and will
        contact you shortly to confirm payment and delivery.
      </p>

      <div className="flex text-sm sm:flex-row gap-4 items-center justify-center">
        <Link
          href="/"
          className="text-pink-600 font-bold underline flex items-center gap-1"
        >
          <House size={16} />
          Go to Home
        </Link>{" "}
        <RippleButton
          onClick={handleDownloadReceipt}
          disabled={downloading}
          className="flex items-center justify-center gap-2 bg-gradient-to-b from-pink-600 to-pink-500 text-white ring-1 ring-white/30 shadow-xl px-5 py-2 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50"
        >
          {downloading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={20} />
              Downloading...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Download size={16} />
              Download Receipt
            </div>
          )}
        </RippleButton>
      </div>
    </div>
  );
}
