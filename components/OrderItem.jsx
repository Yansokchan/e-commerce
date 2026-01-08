"use client";
import Image from "next/image";
import { DotIcon, Download, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { format } from "date-fns";
import RippleButton from "./ui/ripple-button";

const OrderItem = ({ order }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";
  const [downloading, setDownloading] = useState(false);
  const receiptRef = useRef(null);

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(receiptRef.current, {
        cacheBust: true,
        backgroundColor: "#fff",
      });
      const link = document.createElement("a");
      link.download = `receipt-${order.id.slice(0, 8)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download receipt:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <tr className="text-sm">
        <td className="text-left">
          <div className="flex flex-col gap-4">
            <h1 className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">
              Order ID: {order.id.slice(0, 8)}
            </h1>
            {order.items.map((item, index) => (
              <div key={index} className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 bg-slate-100/40 clay-element size-16 md:size-20 rounded-xl overflow-hidden relative border border-slate-200/50">
                    <Image
                      className="object-cover"
                      src={item.images?.[0] || "/placeholder.png"}
                      alt={item.name}
                      fill
                    />
                  </div>
                  <div className="flex flex-col justify-center text-sm">
                    <p className="font-medium text-slate-700 text-base">
                      {item.name}
                    </p>
                    <p>
                      {currency}
                      {item.price} x {item.quantity}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(order.created_at).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        second: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </td>

        <td className="text-center max-md:hidden align-top">
          {currency}
          {parseFloat(order.total).toLocaleString()}
        </td>

        <td className="text-left max-md:hidden align-top">
          <p>{order.location}</p>
        </td>

        <td className="text-right max-md:hidden align-top">
          <div
            className={`inline-flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
              order.status === "confirmed" || order.status === "delivered"
                ? "text-green-600 bg-green-100"
                : order.status === "failed"
                ? "text-red-600 bg-red-100"
                : "text-yellow-600 bg-yellow-100"
            }`}
          >
            <span className="capitalize">{order.status}</span>
          </div>
        </td>

        <td className="text-right max-md:hidden align-top">
          <button
            onClick={handleDownloadReceipt}
            disabled={downloading}
            className="inline-flex glass-btn items-center justify-center gap-1.5 px-4 rounded-full py-2 text-pink-600 font-bold hover:text-pink-700 hover:bg-pink-50 transition-all text-xs"
          >
            {downloading ? (
              <>
                <Loader2 className="animate-spin" size={14} />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <Download size={14} />
                <span>Receipt</span>
              </>
            )}
          </button>
        </td>
      </tr>

      {/* Mobile View */}
      <tr className="md:hidden">
        <td colSpan={4} className="pb-8 pt-2">
          <div className="flex flex-col gap-3 clay-element bg-gradient-to-tr from-slate-100/40 to-slate-50/40 p-4 rounded-xl ring ring-offset ring-white/50 shadow-md">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                  Status
                </p>
                <p
                  className={`font-bold capitalize text-sm ${
                    order.status === "confirmed"
                      ? "text-green-600"
                      : order.status === "delivered"
                      ? "text-blue-600"
                      : order.status === "cancelled"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {order.status}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                  Total
                </p>
                <p className="font-bold text-slate-700 text-sm">
                  {currency}
                  {parseFloat(order.total).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-pink-100/50">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                Delivery Address:{" "}
                <span className="text-xs text-slate-600 font-medium italic">
                  {order.location}
                </span>
              </p>
            </div>

            <button
              onClick={handleDownloadReceipt}
              disabled={downloading}
              className="w-full mt-1 glass-btn text-pink-600 text-xs font-bold py-2 rounded-full flex items-center justify-center gap-2 shadow-md"
            >
              {downloading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={14} />
                  Downloading...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Download size={14} />
                  Download Receipt
                </div>
              )}
            </button>
          </div>
        </td>
      </tr>

      {/* Hidden Receipt Template for Capture */}
      <tr className="absolute -left-[9999px] top-0 pointer-events-none">
        <td>
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
                <p className="text-slate-800">#{order.id.slice(0, 8)}</p>
              </div>
              <div className="text-right text-slate-500">
                <p>DATE</p>
                <p className="text-slate-800">
                  {format(new Date(order.created_at), "MMM dd, yyyy")}
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 border-b border-slate-50 pb-1">
                Items
              </p>
              {order.items?.map((item, idx) => (
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
                    {currency}
                    {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-dashed border-slate-100 py-6 space-y-2">
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>Subtotal</span>
                <span>
                  {currency}
                  {order.total?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>Tax</span>
                <span>{currency}0.00</span>
              </div>
              <div className="flex justify-between text-lg font-black text-slate-900 pt-2 border-t border-slate-50">
                <span>Total</span>
                <span className="text-pink-600">
                  {currency}
                  {order.total?.toLocaleString()}
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
                {order.phone}
              </p>
              <p className="text-[10px] font-semibold text-slate-700 ">
                <span className="font-semibold text-slate-500">Address:</span>{" "}
                {order.location}
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
        </td>
      </tr>

      <tr>
        <td colSpan={5}>
          <div className="border-b border-slate-200 w-full -mt-12" />
        </td>
      </tr>
    </>
  );
};

export default OrderItem;
