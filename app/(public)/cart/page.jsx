"use client";
import Counter from "@/components/Counter";
import OrderSummary from "@/components/OrderSummary";
import PageTitle from "@/components/PageTitle";
import { deleteItemFromCart } from "@/lib/features/cart/cartSlice";
import { openLoginModal } from "@/lib/features/auth/authSlice";
import { ShoppingCart, Trash2Icon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Cart() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";
  const router = useRouter();

  const { cartItems } = useSelector((state) => state.cart);
  const products = useSelector((state) => state.product.list);
  const user = useSelector((state) => state.auth.user);

  const dispatch = useDispatch();

  const [cartArray, setCartArray] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const createCartArray = () => {
    setTotalPrice(0);
    const cartArray = [];
    for (const [key, value] of Object.entries(cartItems)) {
      const product = products.find((product) => product.id === key);
      if (product) {
        cartArray.push({
          ...product,
          quantity: value,
        });
        setTotalPrice((prev) => prev + product.price * value);
      }
    }
    setCartArray(cartArray);
  };

  const handleDeleteItemFromCart = (productId) => {
    dispatch(deleteItemFromCart({ productId }));
  };

  useEffect(() => {
    if (!user) {
      router.push("/");
      dispatch(openLoginModal());
    }
  }, [user, router, dispatch]);

  useEffect(() => {
    if (products.length > 0) {
      createCartArray();
    }
  }, [cartItems, products]);

  if (!user) {
    return null;
  }

  return cartArray.length > 0 ? (
    <div className="min-h-screen mx-6 text-slate-800">
      <div className="max-w-7xl mx-auto ">
        {/* Title */}
        <PageTitle
          heading="My Cart"
          text="items in your cart"
          linkText="Add more"
        />

        <div className="flex items-start justify-between gap-5 max-lg:flex-col">
          <table className="w-full max-w-4xl text-slate-600 table-auto">
            <thead>
              <tr className="max-sm:text-sm">
                <th className="text-left">Product</th>
                <th>Quantity</th>
                <th>Total Price</th>
                <th className="max-md:hidden">Remove</th>
              </tr>
            </thead>
            <tbody>
              {cartArray.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-50 last:border-0"
                >
                  <td className="py-4">
                    <div className="flex gap-3 items-center">
                      {/* Standardized Image Container */}
                      <div className="flex-shrink-0 bg-slate-100 size-16 md:size-20 rounded-xl overflow-hidden relative border border-slate-200/50">
                        <Image
                          src={item.images?.[0] || "/placeholder.png"}
                          className="object-cover"
                          alt={item.name}
                          fill
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800 text-sm md:text-base truncate max-w-[120px] sm:max-w-none">
                          {item.name}
                        </p>
                        <p className="text-[10px] md:text-xs text-slate-400 uppercase font-bold tracking-wider">
                          {item.category}
                        </p>
                        <p className="text-pink-600 font-bold text-sm md:text-base mt-0.5">
                          {currency}
                          {item.price}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="text-center py-4">
                    <div className="scale-90 md:scale-100 origin-center">
                      <Counter productId={item.id} />
                    </div>
                  </td>
                  <td className="text-center py-4">
                    <div className="flex flex-col items-center gap-1">
                      <p className="font-bold text-slate-700 text-sm md:text-base">
                        {currency}
                        {(item.price * item.quantity).toLocaleString()}
                      </p>
                      <button
                        onClick={() => handleDeleteItemFromCart(item.id)}
                        className="text-red-500 bg-red-50 p-2 rounded-lg active:scale-95 transition-all md:hidden"
                        title="Remove item"
                      >
                        <Trash2Icon size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="text-center py-4 max-md:hidden">
                    <button
                      onClick={() => handleDeleteItemFromCart(item.id)}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-xl active:scale-95 transition-all"
                      title="Remove item"
                    >
                      <Trash2Icon size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <OrderSummary totalPrice={totalPrice} items={cartArray} />
        </div>
      </div>
    </div>
  ) : (
    <div className="min-h-[80vh] mx-6 flex flex-col gap-4 items-center justify-center text-slate-400">
      <h1 className="text-2xl sm:text-4xl font-semibold">Your cart is empty</h1>
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
