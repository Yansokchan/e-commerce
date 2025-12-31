"use client";

import { createClient } from "@/lib/supabase/client";
import { PlusIcon, TrashIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setProducts(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  };

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link
          href="/admin/products/add"
          className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <PlusIcon size={18} /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-500">Image</th>
              <th className="p-4 font-medium text-gray-500">Name</th>
              <th className="p-4 font-medium text-gray-500">Price</th>
              <th className="p-4 font-medium text-gray-500">Category</th>
              <th className="p-4 font-medium text-gray-500">Stock</th>
              <th className="p-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="p-4">
                  <div className="relative h-12 w-12 rounded bg-gray-100 overflow-hidden">
                    {product.images?.[0] && (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                </td>
                <td className="p-4 font-medium">{product.name}</td>
                <td className="p-4">${product.price}</td>
                <td className="p-4 text-gray-500">{product.category}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      product.stock > 5
                        ? "bg-green-100 text-green-700"
                        : product.stock > 0
                        ? "bg-orange-100 text-orange-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product.stock || 0}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/products/edit/${product.id}`}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        <path d="m15 5 4 4" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No products found.
          </div>
        )}
      </div>
    </div>
  );
}
