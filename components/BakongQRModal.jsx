"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Loader2, ExternalLink, X, ClockAlert } from "lucide-react";
import RippleButton from "@/components/ui/ripple-button";
import toast from "react-hot-toast";
import { toPng } from "html-to-image";

export default function BakongQRModal({
  isOpen,
  onClose,
  qrString,
  md5,
  amount,
  expiration,
  generationTime,
  onConfirm,
  onRefresh,
}) {
  const [loading, setLoading] = useState(true);
  // Reset loading when qrString changes (e.g. on refresh)
  useEffect(() => {
    if (qrString) {
      setLoading(true);
    }
  }, [qrString]);
  const [timeLeft, setTimeLeft] = useState(null);
  const qrRef = useRef(null);
  const captureRef = useRef(null);

  const qrUrl = `/api/bakong/qr-proxy?data=${encodeURIComponent(qrString)}`;

  // Combined Countdown and Sync timer
  useEffect(() => {
    if (!isOpen || !expiration) {
      setTimeLeft(null);
      return;
    }

    // Initial sync
    const calculateTimeLeft = () => {
      const diff = Math.max(0, Math.floor((expiration - Date.now()) / 1000));
      setTimeLeft(diff);
      return diff;
    };

    const initialDiff = calculateTimeLeft();
    if (initialDiff <= 0) return;

    const timer = setInterval(() => {
      const currentDiff = calculateTimeLeft();
      if (currentDiff <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, expiration]);

  // Polling for payment status
  useEffect(() => {
    let interval;
    if (isOpen && md5 && timeLeft !== null && timeLeft > 0) {
      interval = setInterval(async () => {
        try {
          const res = await fetch("/api/bakong/check-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              md5,
              amount,
              generationTime,
            }),
          });

          if (!res.ok) {
            // ... (keep existing error logging if strict error) behavior might vary,
            // but usually next.js returns 200 for our logic unless we explicitly did status 500.
            // Actually our API returns specific JSON on error, let's parse it first.
            // Wait, standard fetch flow:
          }

          const data = await res.json();

          // HANDLE CLIENT SIDE FALLBACK
          if (data.requiresClientCheck && data.accessToken && data.checkUrl) {
            // console.log("Falling back to client-side check...");
            try {
              const clientRes = await fetch(data.checkUrl, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${data.accessToken}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ md5 }),
              });
              const clientData = await clientRes.json();

              if (clientData.responseCode === 0) {
                clearInterval(interval);
                toast.success("Payment Received!");
                onConfirm({ ...clientData.data, md5 });
              }
            } catch (clientErr) {
              console.error("Client fallback failed:", clientErr);
            }
            return;
          }

          if (data.success) {
            clearInterval(interval);
            toast.success("Payment Received!");
            onConfirm({ ...data.bakongData, md5 }); // Pass the payment data AND md5 back
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isOpen, md5, onConfirm, timeLeft === null || timeLeft <= 0]);

  if (!isOpen) return null;

  const formatTime = (seconds) => {
    if (seconds === null) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const downloadQR = async () => {
    if (!captureRef.current) return;

    try {
      toast.loading("Preparing QR...", { id: "qr-download" });

      const dataUrl = await toPng(captureRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "white",
      });

      const link = document.createElement("a");
      link.download = `bakong-qr-${md5.slice(0, 6)}.png`;
      link.href = dataUrl;
      link.click();

      toast.success("High-quality QR downloaded!", { id: "qr-download" });
    } catch (err) {
      console.error("Download failed", err);
      toast.error("Failed to download QR code. Please try again.", {
        id: "qr-download",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      {/* Hidden Capture Area - Excluded from view but resident in DOM for reliable capture */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none">
        <div
          ref={captureRef}
          className="bg-white p-12 flex flex-col items-center gap-6"
          style={{ width: "500px" }}
        >
          <div className="bg-white p-6 rounded-3xl border-4 border-slate-50 shadow-2xl">
            {qrString && (
              <img
                src={qrUrl}
                alt="Capture QR"
                className="w-[350px] h-[350px]"
                crossOrigin="anonymous"
              />
            )}
          </div>
          <div className="text-center font-sans tracking-tight">
            <h2 className="text-3xl font-black text-slate-900 mb-1">
              Bakong KHQR
            </h2>
            <p className="text-5xl font-black text-red-600">
              KHR
              {amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-slate-400 text-sm mt-4 font-bold uppercase tracking-widest">
              Store: Socheath Store
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white max-h-[90vh] rounded-3xl shadow-2xl w-full max-w-[360px] overflow-hidden animate-in zoom-in duration-300 relative">
        {/* Header */}
        <div className="bg-gradient-to-br from-pink-600 to-pink-500 px-4 py-3 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <span className="font-bold tracking-tight text-lg ml-2">
              Confirm Payment
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-whiste/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 md:p-8">
          <div className="text-center mb-6 flex items-center justify-between gap-3">
            <p className="text-slate-400 text-xl font-bold uppercase tracking-widest">
              Transfer Amount
            </p>
            <p className="text-xl font-black text-slate-900">
              KHR:
              {amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* QR Code Container */}
          <div
            ref={qrRef}
            className="relative clay-element aspect-square w-full max-w-[240px] mx-auto mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-xl flex items-center justify-center overflow-hidden"
          >
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10 gap-2">
                <Loader2 className="animate-spin text-red-600" size={32} />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                  Generating QR
                </span>
              </div>
            )}
            {qrString ? (
              <div className="p-2 bg-white">
                <Image
                  src={qrUrl}
                  alt="Bakong KHQR"
                  width={220}
                  height={220}
                  className={`transition-all duration-700 mix-blend-multiply ${
                    loading
                      ? "opacity-0 scale-90 blur-sm"
                      : "opacity-100 scale-100 blur-0"
                  }`}
                  onLoad={() => setLoading(false)}
                  unoptimized
                />
              </div>
            ) : (
              <div className="text-slate-400 text-xs italic">
                Awaiting data...
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Timer and Status */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex clay-element items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  timeLeft < 60
                    ? "bg-red-50 text-red-600 animate-pulse"
                    : "bg-slate-50 text-slate-600"
                }`}
              >
                Expires in {formatTime(timeLeft)}
              </div>
              <p className="text-[11px] text-slate-400 font-medium animate-pulse text-center">
                Waiting for transaction confirmation...
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <RippleButton
                onClick={downloadQR}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-pink-400 ring-1 ring-inset ring-white/40 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 group"
              >
                Download QR Code
              </RippleButton>

              <p className="text-center text-[10px] text-slate-400 mt-2 font-medium">
                Payments are processed instantly via NBC Bakong system.
              </p>
            </div>
          </div>
        </div>

        {timeLeft <= 0 && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
            <div className="w-16 clay-element h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
              <ClockAlert size={32} />
            </div>
            <h3 className="text-xl font-bold text-pink-600 mb-2">QR Expired</h3>
            <p className="text-sm text-slate-500 mb-6">
              The payment window has closed. You can request a new QR code to
              continue with your payment.
            </p>
            <RippleButton
              onClick={onRefresh}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-pink-400 ring-1 ring-inset ring-white/40 text-white font-bold rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 group"
            >
              Request new QR
            </RippleButton>
          </div>
        )}
      </div>
    </div>
  );
}
