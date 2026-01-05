"use client";
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import ProductDetailsSkeleton from "@/components/ProductDetailsSkeleton";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function Product() {
  const { productId } = useParams();
  const [product, setProduct] = useState();
  const { list: products, status } = useSelector((state) => state.product);

  const fetchProduct = () => {
    const foundProduct = products.find((product) => product.id === productId);
    setProduct(foundProduct);
  };

  useEffect(() => {
    if (products.length > 0) {
      fetchProduct();
    }
    scrollTo(0, 0);
  }, [productId, products]);

  return (
    <div className="mx-6">
      <div className="max-w-7xl mx-auto min-h-[50vh]">
        {/* Breadcrumbs */}
        <div className="text-gray-600 text-sm mt-8 mb-5">
          Home / Products / {product ? product.category : "..."}
        </div>

        {/* Loading State */}
        {status === "loading" && <ProductDetailsSkeleton />}

        {/* Product Content */}
        {status !== "loading" && product && (
          <>
            <ProductDetails product={product} />
            <ProductDescription product={product} />
          </>
        )}

        {/* Not Found State */}
        {status !== "loading" && !product && products.length > 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <h2 className="text-2xl font-semibold text-slate-800">
              Product Not Found
            </h2>
            <p className="text-slate-500 mt-2">
              The product you are looking for does not exist or has been
              removed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
