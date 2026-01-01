"use client";

import {
  XIcon,
  PackageIcon,
  PhoneIcon,
  CalendarIcon,
  DollarSignIcon,
  AlertTriangleIcon,
  Copy,
  Check,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function OrderDetailsModal({ order, onClose, onCancel }) {
  const [cancelling, setCancelling] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!order) return null;

  const items = Array.isArray(order.items)
    ? order.items
    : typeof order.items === "string"
    ? JSON.parse(order.items || "[]")
    : [];

  const handleCancelClick = async () => {
    if (
      confirm(
        "Are you sure you want to cancel this order? This action cannot be undone."
      )
    ) {
      setCancelling(true);
      await onCancel(order.id, order.status, items);
      setCancelling(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-4 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Order Details</h2>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500 font-mono">ID: {order.id}</p>
              <button
                onClick={() => handleCopy(order.id, "id")}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Copy Order ID"
              >
                {copiedField === "id" ? (
                  <Check size={14} className="text-green-500" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
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
          {/* Status & Date */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
                order.status === "confirmed"
                  ? "bg-green-100 text-green-700"
                  : order.status === "delivered"
                  ? "bg-blue-100 text-blue-700"
                  : order.status === "cancelled"
                  ? "bg-red-100 text-red-700"
                  : "bg-orange-100 text-orange-700"
              }`}
            >
              {order.status === "confirmed"
                ? "Confirmed"
                : order.status === "delivered"
                ? "Delivered"
                : order.status === "cancelled"
                ? "Cancelled"
                : "Pending"}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
              <CalendarIcon size={14} />
              {new Date(order.created_at).toLocaleString()}
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-6 p-4 bg-pink-50 rounded-lg border border-pink-100 shadow-xs">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <PhoneIcon size={16} /> Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block text-xs">
                  Phone Number
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{order.phone || "N/A"}</span>
                  {order.phone && (
                    <button
                      onClick={() => handleCopy(order.phone, "phone")}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy Phone"
                    >
                      {copiedField === "phone" ? (
                        <Check size={14} className="text-green-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  )}
                </div>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">User ID</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium font-mono text-xs">
                    {order.user_id || "Guest"}
                  </span>
                  {order.user_id && (
                    <button
                      onClick={() => handleCopy(order.user_id, "userId")}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy User ID"
                    >
                      {copiedField === "userId" ? (
                        <Check size={14} className="text-green-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <PackageIcon size={16} /> Order Items ({items.length})
            </h3>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-3 shadow-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden relative flex-shrink-0">
                    {item.images && item.images[0] ? (
                      <Image
                        src={item.images[0]}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <PackageIcon size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 line-clamp-1">
                      {item.name}
                    </h4>
                    <div className="flex justify-between items-end mt-1">
                      <div className="text-sm text-gray-500">
                        Qty:{" "}
                        <span className="font-semibold text-gray-700">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="font-medium text-indigo-600">
                        ${item.price}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center p-4 bg-pink-50 rounded-lg border border-pink-100 shadow-xs">
            <span className="font-semibold text-indigo-900">Total Amount</span>
            <span className="text-2xl font-bold text-indigo-600 flex items-center">
              <DollarSignIcon size={20} />
              {order.total}
            </span>
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

          {order.status !== "cancelled" && order.status !== "delivered" && (
            <button
              onClick={handleCancelClick}
              disabled={cancelling}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-sm hover:shadow flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelling ? (
                <>Processing...</>
              ) : (
                <>
                  <AlertTriangleIcon size={16} />
                  Cancel Order
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
