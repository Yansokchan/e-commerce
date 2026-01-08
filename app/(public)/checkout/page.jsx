"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import Image from "next/image";
import { clearCart } from "@/lib/features/cart/cartSlice";
import { Loader2, ShoppingCart, CreditCard, Send } from "lucide-react";
import RippleButton from "@/components/ui/ripple-button";
import Link from "next/link";

import BakongQRModal from "@/components/BakongQRModal";

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const products = useSelector((state) => state.product.list);

  const [loading, setLoading] = useState(false);
  const [cartArray, setCartArray] = useState([]);
  const [total, setTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("bakong"); // Default to bakong
  const [showBakongModal, setShowBakongModal] = useState(false);
  const [qrString, setQrString] = useState("");
  const [qrMd5, setQrMd5] = useState("");
  const [qrExpiration, setQrExpiration] = useState(null);
  const [qrAmount, setQrAmount] = useState(0);
  const [qrGenerationTime, setQrGenerationTime] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Hydrate cart data
  useEffect(() => {
    if (isSuccess) return;
    if (products.length > 0) {
      const arr = [];
      let t = 0;
      for (const [key, value] of Object.entries(cartItems)) {
        const product = products.find((p) => p.id === key);
        if (product) {
          arr.push({ ...product, quantity: value });
          t += product.price * value;
        }
      }
      setCartArray(arr);
      setTotal(t);
    }
  }, [cartItems, products, isSuccess]);

  const { user } = useSelector((state) => state.auth);

  const handleFinalSubmit = async (bakongData = null) => {
    setLoading(true);

    const phone = user?.user_metadata?.phone;
    const address = user?.user_metadata?.location;

    try {
      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          address,
          items: cartArray,
          total,
          user,
          payment_method: paymentMethod,
          bakongData: bakongData instanceof Event ? null : bakongData, // Prevent Event object from being passed
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Order failed");
      }

      // If we are already showing the modal (for Bakong), and we don't have confirmation data yet, don't redirect
      if (paymentMethod === "bakong" && !bakongData && !isSuccess) {
        setLoading(false);
        return;
      }

      // Success for Telegram
      setIsSuccess(true);
      setShowConfirmModal(false);
      setShowBakongModal(false);
      toast.success("Order placed successfully!");
      dispatch(clearCart());

      router.push(`/orders/success/${data.orderId}`);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
      setLoading(false);
    }
  };

  const fetchBakongQR = (isRefresh = false) => {
    // Check if we already have a valid QR for this amount (unless it's a refresh)
    if (
      !isRefresh &&
      qrString &&
      qrAmount === total &&
      qrExpiration &&
      qrExpiration > Date.now() + 10000 // At least 10s left
    ) {
      setShowBakongModal(true);
      return;
    }

    setLoading(true);
    fetch("/api/bakong/generate-khqr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: total, currency: "KHR" }),
    })
      .then((res) => res.json())
      .then((resData) => {
        setLoading(false);
        if (resData.success) {
          const bData = resData.data;
          setQrString(bData.qr);
          setQrMd5(bData.md5);
          setQrExpiration(bData.expiration);
          setQrAmount(total);
          setQrGenerationTime(bData.generationTime);
          setShowBakongModal(true);
        } else {
          toast.error("Failed to generate QR code");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error generating QR");
        setLoading(false);
      });
  };

  const handlePreSubmit = () => {
    if (!user?.user_metadata?.phone) {
      toast.error(
        "Please update your phone number in your profile to proceed."
      );
      return;
    }
    if (!user?.user_metadata?.location) {
      toast.error("Please update your address in your profile to proceed.");
      return;
    }

    if (paymentMethod === "bakong") {
      fetchBakongQR(false);
    } else {
      setShowConfirmModal(true);
    }
  };

  if (cartArray.length === 0) {
    return (
      <div className="min-h-[80vh] mx-6 flex flex-col gap-4 items-center justify-center text-slate-400">
        <h1 className="text-2xl sm:text-4xl font-semibold">
          Your cart is empty
        </h1>
        <Link
          href="/shop"
          className="text-pink-600 font-bold underline flex items-center gap-1"
        >
          <ShoppingCart size={16} />
          Go to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-md mx-auto clay-element rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden md:max-w-2xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-pink-600 text">Checkout</h2>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Items</h3>
          <div className="space-y-4">
            {cartArray.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 bg-slate-100 clay-element size-16 md:size-20 rounded-xl overflow-hidden relative border border-slate-200/50">
                    <Image
                      src={item.images?.[0] || "/placeholder.png"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm md:text-base truncate max-w-[120px] sm:max-w-none">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <p className="font-medium text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between">
            <p className="font-bold text-lg">Total</p>
            <p className="font-bold text-lg">${total.toLocaleString()}</p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Payment Method
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setPaymentMethod("bakong")}
              className={`flex active:scale-95 clay-element items-center gap-3 p-4 rounded-full ${
                paymentMethod === "bakong"
                  ? "border-red-500 bg-red-50 text-red-700 shadow-md ring-1 ring-red-200"
                  : " text-slate-600 "
              }`}
            >
              <div
                className={`p-2 rounded-full clay-element ${
                  paymentMethod === "bakong"
                    ? "bg-red-200/80 text-red-700"
                    : "bg-slate-100"
                }`}
              >
                <CreditCard size={20} />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm">Bakong KHQR</p>
                <p className="text-[10px] opacity-70">Pay Now with Bank App</p>
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod("telegram")}
              className={`flex active:scale-95 clay-element rounded-full items-center gap-3 p-4 transition-all ${
                paymentMethod === "telegram"
                  ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md ring-1 ring-blue-200"
                  : " text-slate-600 "
              }`}
            >
              <div
                className={`p-2 rounded-full clay-element ${
                  paymentMethod === "telegram"
                    ? "bg-blue-200/80 text-blue-700"
                    : "bg-slate-100"
                }`}
              >
                <Send size={20} />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm">Via Telegram</p>
                <p className="text-[10px] opacity-70">Confirm with Owner</p>
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className=" text-sm text-slate-600">
            <p className="font-medium mb-2 text-slate-800">Your Details:</p>
            <p>Name: {user?.user_metadata?.full_name}</p>
            <p>
              Phone:{" "}
              {user?.user_metadata?.phone || (
                <span className="text-red-500 font-bold">Missing</span>
              )}
            </p>
            <p>
              Address:{" "}
              {user?.user_metadata?.location || (
                <span className="text-red-500 font-bold">Missing</span>
              )}
            </p>
            <p className="mt-2 text-xs italic text-slate-500">
              * Please update your profile if this information is incorrect.
            </p>
          </div>

          <RippleButton
            onClick={handlePreSubmit}
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 rounded-full text-base font-bold text-white bg-gradient-to-r from-pink-600 to-pink-500 ring-1 ring-inset ring-white/50  disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            {paymentMethod === "bakong"
              ? "Pay & Place Order"
              : "Confirm & Place Order"}
          </RippleButton>
        </div>
      </div>

      {/* Bakong Modal */}
      <BakongQRModal
        isOpen={showBakongModal}
        onClose={() => setShowBakongModal(false)}
        qrString={qrString}
        md5={qrMd5}
        amount={total}
        expiration={qrExpiration}
        generationTime={qrGenerationTime}
        onConfirm={handleFinalSubmit}
        onRefresh={() => fetchBakongQR(true)}
      />

      {/* Confirmation Modal (for Telegram) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="rounded-xl bg-white shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 clay-element bg-slate-100/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛍️</span>
              </div>
              <h3 className="text-lg font-bold text-pink-600 mb-2">
                Confirm Order
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to place this order with total{" "}
                <strong>${total.toLocaleString()}</strong> via Telegram?
              </p>

              <div className="flex flex-col gap-3">
                <RippleButton
                  disabled={loading}
                  onClick={() => handleFinalSubmit()}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-pink-600 to-pink-500 ring-1 ring-inset ring-white/70 text-white font-medium rounded-full transition-colors shadow-xl disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={20} />{" "}
                      Processing...
                    </div>
                  ) : (
                    "Yes, Place Order"
                  )}
                </RippleButton>
                <RippleButton
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full py-2.5 px-4 glass-btn bg-white border border-gray-300/30 text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Cancel
                </RippleButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
