"use client";
import { addToCart, removeFromCart } from "@/lib/features/cart/cartSlice";
import { useDispatch, useSelector } from "react-redux";

const Counter = ({ productId }) => {
  const { cartItems } = useSelector((state) => state.cart);
  const products = useSelector((state) => state.product.list);
  const product = products.find((p) => p.id === productId);
  const stock = product?.stock || 0;

  const dispatch = useDispatch();

  const addToCartHandler = () => {
    if (cartItems[productId] < stock) {
      dispatch(addToCart({ productId }));
    } else {
      // Optional: User feedback like a toast
      // toast.error("Max stock reached");
    }
  };

  const removeFromCartHandler = () => {
    dispatch(removeFromCart({ productId }));
  };

  return (
    <div className="inline-flex items-center gap-1 sm:gap-3 px-3 py-1 rounded border border-slate-200 max-sm:text-sm text-slate-600">
      <button onClick={removeFromCartHandler} className="p-1 select-none">
        -
      </button>
      <p className="p-1">{cartItems[productId]}</p>
      <button
        onClick={addToCartHandler}
        className={`p-1 select-none ${
          cartItems[productId] >= stock
            ? "text-gray-300 cursor-not-allowed"
            : ""
        }`}
        disabled={cartItems[productId] >= stock}
      >
        +
      </button>
    </div>
  );
};

export default Counter;
