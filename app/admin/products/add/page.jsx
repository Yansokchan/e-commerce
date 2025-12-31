"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { XIcon, UploadCloudIcon } from "lucide-react";
import Image from "next/image";

export default function AddProductPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    mrp: "",
    category: "",
    images: [],
  });

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
    setLoading(true);

    const { error } = await supabase.from("products").insert([
      {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        mrp: parseFloat(formData.mrp),
        category: formData.category,
        stock: 0, // Default stock to 0 for admin-added products
        images: formData.images,
      },
    ]);

    if (error) {
      alert("Error creating product: " + error.message);
      setLoading(false);
    } else {
      router.push("/admin/products");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            name="name"
            required
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
              onChange={handleChange}
              className="mt-1 block w-full rounded border border-gray-300 p-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            name="category"
            required
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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Product"}
        </button>
      </form>
    </div>
  );
}
