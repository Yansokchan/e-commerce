"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { XIcon, UploadCloudIcon, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id;
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    mrp: "",
    category: "",
    stock: "",
    status: "",
    images: [],
  });

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    if (error) {
      alert("Error loading product: " + error.message);
      router.push("/admin/products");
      return;
    }

    if (data) {
      setFormData({
        name: data.name || "",
        description: data.description || "",
        price: data.price || "",
        mrp: data.mrp || "",
        mrp: data.mrp || "",
        category: data.category || "",
        stock: data.stock || 0,
        status: data.status || "active",
        images: data.images || [],
      });
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpload = (result) => {
    if (result.event === "success") {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, result.info.secure_url],
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from("products")
      .update({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        mrp: parseFloat(formData.mrp),
        category: formData.category,
        stock: parseInt(formData.stock),
        status: formData.status,
        images: formData.images,
      })
      .eq("id", productId);

    if (error) {
      alert("Error updating product: " + error.message);
      setSaving(false);
    } else {
      router.push("/admin/products");
    }
  };

  if (loading) return <div className="p-10">Loading product...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Products
      </Link>
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded border border-gray-300 p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded border border-gray-300 p-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Price ($)
            </label>
            <input
              name="price"
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={handleChange}
              className="mt-1 block w-full rounded border border-gray-300 p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              MRP ($)
            </label>
            <input
              name="mrp"
              type="number"
              step="0.01"
              required
              value={formData.mrp}
              onChange={handleChange}
              className="mt-1 block w-full rounded border border-gray-300 p-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded border border-gray-300 p-2"
            >
              <option value="">Select Category</option>
              <option value="Electronics">Electronics</option>
              <option value="Fashion">Fashion</option>
              <option value="Home">Home</option>
              <option value="Beauty">Beauty</option>
              <option value="Sports">Sports</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Stock Quantity
            </label>
            <input
              name="stock"
              type="number"
              required
              value={formData.stock}
              onChange={handleChange}
              className="mt-1 block w-full rounded border border-gray-300 p-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Product Status
          </label>
          <select
            name="status"
            required
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded border border-gray-300 p-2"
          >
            <option value="active">Active (Selling)</option>
            <option value="archived">Archived (Not Selling)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {formData.images.map((url, i) => (
              <div
                key={i}
                className="relative aspect-square group rounded-lg border border-gray-200 overflow-hidden bg-gray-50"
              >
                <Image src={url} alt="Product" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({
                        ...p,
                        images: p.images.filter((_, idx) => idx !== i),
                      }))
                    }
                    className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <XIcon size={18} />
                  </button>
                </div>
              </div>
            ))}

            <CldUploadWidget
              uploadPreset="gocart_preset"
              onSuccess={(result) => {
                console.log("Upload success:", result);
                handleUpload(result);
              }}
              onError={(err) => {
                console.error("Cloudinary Error:", err);
                alert(
                  'Upload failed. Check console for details. Ensure your Cloudinary Cloud Name is set in .env.local and Upload Preset is "Unsigned"'
                );
              }}
              options={{ multiple: true }}
            >
              {({ open }) => {
                return (
                  <button
                    type="button"
                    onClick={() => open()}
                    className="aspect-square flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
                  >
                    <UploadCloudIcon size={24} />
                    <span className="text-xs font-medium">Upload</span>
                  </button>
                );
              }}
            </CldUploadWidget>
          </div>
          <p className="text-xs text-gray-500">
            Supported extensions: jpg, png, webp. Max size: 5MB.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="px-6 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
