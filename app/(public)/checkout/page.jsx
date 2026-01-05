"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import Image from "next/image";
import { clearCart } from "@/lib/features/cart/cartSlice"; // Assuming this action exists or I check slice
import { Loader2, ShoppingCart } from "lucide-react";
import RippleButton from "@/components/ui/ripple-button";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const products = useSelector((state) => state.product.list);

  // const [phone, setPhone] = useState(""); // Removed manual phone input
  const [loading, setLoading] = useState(false);
  const [cartArray, setCartArray] = useState([]);
  const [total, setTotal] = useState(0);

  // Hydrate cart data
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Hydrate cart data
  useEffect(() => {
    if (isSuccess) return; // Stop updating if order is successful (prevents empty flash)
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

  // Get user from Redux state (synced with Supabase via AuthProvider)
  const { user } = useSelector((state) => state.auth);

  // Original submit logic, now called after confirmation
  const handleFinalSubmit = async () => {
    setLoading(true);

    // Use stored phone and address
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
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Order failed");
      }

      // Order success
      setIsSuccess(true);
      setShowConfirmModal(false);
      toast.success("Order sent to Telegram!");
      dispatch(clearCart());

      // Redirect to success page
      router.push(`/orders/success/${data.orderId}`);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
      setLoading(false); // Only stop loading if error
    }
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
    // Open confirmation modal
    setShowConfirmModal(true);
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-md mx-auto bg-white rounded-xl ring-1 ring-offset ring-white/30 shadow-xl overflow-hidden md:max-w-2xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-pink-600">Checkout</h2>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Items</h3>
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

        <div className="space-y-6">
          <div className="bg-gradient-to-tl from-pink-200/60 to-pink-100/60 shadow-sm ring ring-inset ring-white/30 p-4 rounded-lg text-sm text-slate-600">
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
            className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-pink-600 to-pink-500 ring-1 ring-inset ring-white/70 shadow-xl disabled:opacity-50 transition-all active:scale-[0.98]"
          >
            Confirm & Submit Order
          </RippleButton>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛍️</span>
              </div>
              <h3 className="text-lg font-bold text-pink-600 mb-2">
                Confirm Order
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to place this order with total{" "}
                <strong>${total.toLocaleString()}</strong>?
              </p>

              <div className="flex flex-col gap-3">
                <RippleButton
                  disabled={loading}
                  onClick={handleFinalSubmit}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-pink-600 to-pink-500 ring-1 ring-inset ring-white/70 text-white font-medium rounded-lg transition-colors shadow-xl disabled:opacity-50"
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
                  className="w-full py-2.5 px-4 bg-white border border-gray-300/30 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
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
