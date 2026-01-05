import React, { useState } from "react";
import { useRouter } from "next/navigation";
import RippleButton from "./ui/ripple-button";
import LiquidGlassWrapper from "./ui/LiquidGlassWrapper";
import { Loader2 } from "lucide-react";

const OrderSummary = ({ totalPrice, items }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = () => {
    setLoading(true);
    router.push("/checkout");
  };

  return (
    <div className="w-full max-w-lg lg:max-w-[340px]">
      <LiquidGlassWrapper className="h-full shadow-xl rounded-2xl ring-1 ring-inset ring-white/70">
        <div className="text-slate-500 text-sm p-7">
          <h2 className="text-xl font-medium text-slate-600 mb-6">
            Order Summary
          </h2>

          <div className="pb-4 border-b border-slate-200 space-y-3">
            <div className="flex justify-between">
              <p>Subtotal</p>
              <p className="font-medium text-slate-700">
                {currency}
                {totalPrice.toLocaleString()}
              </p>
            </div>
            <div className="flex justify-between">
              <p>Shipping</p>
              <p className="font-medium text-green-600">Free</p>
            </div>
          </div>

          <div className="flex justify-between py-4 text-lg font-semibold text-slate-800">
            <p>Total</p>
            <p>
              {currency}
              {totalPrice.toLocaleString()}
            </p>
          </div>

          <RippleButton
            disabled={loading}
            onClick={handlePlaceOrder}
            className="w-full bg-gradient-to-r from-pink-600 to-pink-500 text-white py-3 rounded-lg ring-1 shadow-xl ring-inset ring-white/50 active:scale-95 transition-all mt-2"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={20} /> Proceeding to
                Checkout...
              </div>
            ) : (
              "Proceed to Checkout"
            )}
          </RippleButton>

          <p className="text-xs text-center text-slate-400 mt-4">
            Checkout securely via Telegram
          </p>
        </div>
      </LiquidGlassWrapper>
    </div>
  );
};

export default OrderSummary;
