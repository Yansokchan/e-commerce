"use client";

import {
  XIcon,
  TagIcon,
  ShoppingBag,
  DollarSignIcon,
  EditIcon,
  LayersIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ProductDetailsModal({ product, onClose }) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-4 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Product Details</h2>
            <p className="text-xs text-gray-500 font-mono">ID: {product.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <XIcon size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Header Info */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
                product.status === "archived"
                  ? "bg-gray-100 text-gray-600"
                  : "bg-green-100 text-green-700"
              }`}
            >
              <TagIcon size={14} />
              {product.status || "Active"}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
              <LayersIcon size={14} />
              {product.category}
            </div>
          </div>

          {/* Product Images */}
          {product.images && product.images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                Product Images
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {product.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-lg overflow-hidden border border-gray-100"
                  >
                    <Image
                      src={img}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product Info */}
          <div className="mb-6 p-4 bg-pink-50 rounded-lg border border-pink-100 shadow-xs">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              General Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block text-xs">Name</span>
                <span className="font-medium text-gray-900">
                  {product.name}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Stock</span>
                <span className="font-medium">{product.stock} items</span>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-gray-500 block text-xs mb-1">
                Description
              </span>
              <p className="text-gray-700 text-sm leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex justify-between items-center p-4 bg-pink-50 rounded-lg border border-pink-100 shadow-xs">
            <div>
              <span className="text-gray-500 block text-xs">MRP</span>
              <span className="text-sm text-gray-400 line-through">
                ${product.mrp}
              </span>
            </div>
            <div className="text-right">
              <span className="font-semibold text-indigo-900 block text-xs">
                Sale Price
              </span>
              <span className="text-2xl font-bold text-indigo-600 flex items-center justify-end">
                <DollarSignIcon size={20} />
                {product.price}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>

          <Link
            href={`/admin/products/edit/${product.id}`}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm hover:shadow flex items-center gap-2 transition-all"
          >
            <EditIcon size={16} />
            Edit Product
          </Link>
        </div>
      </div>
    </div>
  );
}
