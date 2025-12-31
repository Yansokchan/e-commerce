import React from "react";
import { useRouter } from "next/navigation";

const OrderSummary = ({ totalPrice, items }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";
  const router = useRouter();

  const handlePlaceOrder = () => {
    router.push("/checkout");
  };

  return (
    <div className="w-full max-w-lg lg:max-w-[340px] bg-slate-50/30 border border-slate-200 text-slate-500 text-sm rounded-xl p-7">
      <h2 className="text-xl font-medium text-slate-600 mb-6">Order Summary</h2>

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

      <button
        onClick={handlePlaceOrder}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 active:scale-95 transition-all font-medium mt-2"
      >
        Proceed to Checkout
      </button>

      <p className="text-xs text-center text-slate-400 mt-4">
        Checkout securely via Telegram
      </p>
    </div>
  );
};

export default OrderSummary;
