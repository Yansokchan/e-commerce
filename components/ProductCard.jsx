"use client";
import { StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const ProductCard = ({ product }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  // calculate the average rating of the product
  const rating = product.rating?.length
    ? Math.round(
        product.rating.reduce((acc, curr) => acc + curr.rating, 0) /
          product.rating.length
      )
    : 0;

  return (
    <Link href={`/product/${product.id}`} className="group block w-full">
      <div className="bg-[#F5F5F5] w-full aspect-[4/5] sm:aspect-[3/4] rounded-lg flex items-center justify-center overflow-hidden">
        <Image
          width={500}
          height={500}
          className="w-full h-full object-contain p-4 transition duration-300 sm:group-hover:scale-[1.07]"
          src={product.images[0]}
          alt={product.name}
        />
      </div>
      <div className="flex justify-between gap-3 text-sm text-slate-800 pt-2 w-full">
        <div>
          <p className="line-clamp-1">{product.name}</p>
          <div className="flex">
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
          </div>
        </div>
        <p>
          {currency}
          {product.price}
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;
