"use client";

import { addToCart } from "@/lib/features/cart/cartSlice";
import { openLoginModal } from "@/lib/features/auth/authSlice";
import {
  StarIcon,
  TagIcon,
  EarthIcon,
  CreditCardIcon,
  UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Counter from "./Counter";
import { useDispatch, useSelector } from "react-redux";
import RippleButton from "./ui/ripple-button";
import ImageZoom from "./ImageZoom";

const ProductDetails = ({ product }) => {
  const productId = product.id;
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const cart = useSelector((state) => state.cart.cartItems);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();

  const router = useRouter();

  const [mainImage, setMainImage] = useState(product.images[0]);

  const addToCartHandler = () => {
    if (!isAuthenticated) {
      dispatch(openLoginModal());
      return;
    }
    dispatch(addToCart({ productId }));
  };

  return (
    <div className="flex max-lg:flex-col gap-12">
      <div className="flex max-sm:flex-col-reverse gap-3">
        <div className="flex sm:flex-col gap-3">
          {product.images.map((image, index) => (
            <div
              key={index}
              onClick={() => setMainImage(product.images[index])}
              className="bg-pink-50/50 border border-white/50 shadow-md shadow-slate-200/80 flex items-center justify-center size-26 rounded-lg group cursor-pointer"
            >
              <Image
                src={image}
                className="group-hover:scale-103 group-active:scale-95 transition"
                alt=""
                width={45}
                height={45}
              />
            </div>
          ))}
        </div>
        <div className="relative flex justify-center items-center h-100 sm:size-113 bg-pink-50/50 border border-white/50 shadow-md shadow-slate-200/80 rounded-lg overflow-hidden">
          <ImageZoom src={mainImage} alt={product.name} />
        </div>
      </div>
      <div className="flex-1">
        <h1 className="text-3xl font-semibold text-slate-800">
          {product.name}
        </h1>
        <div className="flex text-xs">
          {product.stock > 5 ? (
            <p className="text-green-600 font-medium">Instock</p>
          ) : product.stock > 0 ? (
            <p className="text-orange-600 font-medium">
              Only {product.stock} left in stock - order soon.
            </p>
          ) : (
            <p className="text-red-600 font-medium">Out of Stock</p>
          )}
        </div>
        <div className="my-2">
          <p className="text-slate-700">{product.description}</p>
        </div>
        <div className="flex items-start my-4 gap-3 text-2xl font-semibold text-slate-800">
          <p>
            {" "}
            {currency}
            {product.price}{" "}
          </p>
          <p className="text-xl text-slate-500 line-through">
            {currency}
            {product.mrp}
          </p>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <TagIcon size={14} />
          <p>
            Save{" "}
            {(((product.mrp - product.price) / product.mrp) * 100).toFixed(0)}%
            right now
          </p>
        </div>
        <div className="flex flex-row-reverse justify-end items-start gap-5 mt-4">
          {cart[productId] && (
            <div className="flex items-center gap-3">
              <p className="text-lg text-slate-800 font-semibold">Quantity</p>
              <Counter productId={productId} />
            </div>
          )}
          <RippleButton
            onClick={() => {
              if (product.stock > 0) {
                !cart[productId] ? addToCartHandler() : router.push("/cart");
              }
            }}
            disabled={product.stock <= 0 && !cart[productId]}
            className={`px-10 py-3 text-sm font-medium rounded transition ${
              product.stock <= 0 && !cart[productId]
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-pink-500 to-pink-400 active:scale-95 text-white"
            }`}
          >
            {product.stock <= 0 && !cart[productId]
              ? "Out of Stock"
              : !cart[productId]
              ? "Add to Cart"
              : "View Cart"}
          </RippleButton>
        </div>
        <hr className="border-gray-300 my-5" />
        <div className="flex flex-col gap-4 text-slate-600">
          <p className="flex gap-3">
            {" "}
            <EarthIcon className="text-slate-500" /> Free shipping in Cambodia{" "}
          </p>
          <p className="flex gap-3">
            {" "}
            <CreditCardIcon className="text-slate-500" /> 100% Secured Payment{" "}
          </p>
          <p className="flex gap-3">
            {" "}
            <UserIcon className="text-slate-500" /> Trusted by top brands{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
