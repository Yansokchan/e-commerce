"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import Image from "next/image";
import { clearCart } from "@/lib/features/cart/cartSlice"; // Assuming this action exists or I check slice

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const products = useSelector((state) => state.product.list);

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [cartArray, setCartArray] = useState([]);
  const [total, setTotal] = useState(0);

  // Hydrate cart data
  useEffect(() => {
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
  }, [cartItems, products]);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Original submit logic, now called after confirmation
  const handleFinalSubmit = async () => {
    setLoading(true);
    setShowConfirmModal(false); // Close modal

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    try {
      const res = await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          items: cartArray,
          total,
          user,
        }),
      });

      if (!res.ok) throw new Error("Order failed");

      toast.success("Order sent to Telegram!");

      dispatch(clearCart());

      router.push("/orders/success");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!phone) {
      toast.error("Please enter your phone number");
      return;
    }
    // Open confirmation modal
    setShowConfirmModal(true);
  };

  if (cartArray.length === 0) {
    return <div className="p-10 text-center">Your cart is empty</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Checkout</h2>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Order Summary
          </h3>
          <div className="space-y-4">
            {cartArray.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 rounded overflow-hidden">
                    <Image
                      src={item.images?.[0] || "/placeholder.png"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
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

        <form onSubmit={handlePreSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number (Required)
            </label>
            <div className="mt-1">
              <input
                type="tel"
                id="phone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                placeholder="(+1) 123 456 7890"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              The store owner will contact you via Telegram or Phone to confirm.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Submit Order
          </button>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Confirm Phone Number
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Please verify that your phone number is correct. The store will
                use this number to contact you.
              </p>

              <div className="bg-gray-50 p-3 rounded-lg border mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                  You entered:
                </p>
                <p className="text-xl font-mono font-bold text-indigo-600">
                  {phone}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleFinalSubmit}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Yes, Confirm & Submit
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full py-2.5 px-4 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Edit / Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
