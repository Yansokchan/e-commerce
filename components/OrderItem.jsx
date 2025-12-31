"use client";
import Image from "next/image";
import { DotIcon } from "lucide-react";
import { useSelector } from "react-redux";
import Rating from "./Rating";
import { useState } from "react";
import RatingModal from "./RatingModal";

const OrderItem = ({ order }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  return (
    <>
      <tr className="text-sm">
        <td className="text-left">
          <div className="flex flex-col gap-6">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="size-16 bg-slate-100 flex items-center justify-center rounded-md overflow-hidden relative">
                  <Image
                    className="object-cover"
                    src={item.images?.[0] || "/placeholder.png"}
                    alt={item.name}
                    fill
                  />
                </div>
                <div className="flex flex-col justify-center text-sm">
                  <p className="font-medium text-slate-600 text-base">
                    {item.name}
                  </p>
                  <p>
                    {currency}
                    {item.price} x {item.quantity}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(order.created_at).toDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </td>

        <td className="text-center max-md:hidden align-top pt-8">
          {currency}
          {parseFloat(order.total).toLocaleString()}
        </td>

        <td className="text-left max-md:hidden align-top pt-8">
          <p className="text-slate-600 font-medium">Phone Order</p>
          <p>{order.phone}</p>
        </td>

        <td className="text-left space-y-2 text-sm max-md:hidden align-top pt-8">
          <div
            className={`flex items-center justify-center gap-1 rounded-full px-2 py-1 w-fit ${
              order.status === "confirmed" || order.status === "delivered"
                ? "text-green-600 bg-green-100"
                : order.status === "failed"
                ? "text-red-600 bg-red-100"
                : "text-yellow-600 bg-yellow-100"
            }`}
          >
            <DotIcon size={10} />
            <span className="capitalize">{order.status}</span>
          </div>
        </td>
      </tr>
      {/* Mobile View */}
      <tr className="md:hidden">
        <td colSpan={4} className="pb-8">
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded">
            <div>
              <p className="text-xs text-slate-400">Status</p>
              <p className="font-medium capitalize text-slate-700">
                {order.status}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Total</p>
              <p className="font-medium text-slate-700">
                {currency}
                {parseFloat(order.total).toLocaleString()}
              </p>
            </div>
          </div>
        </td>
      </tr>
      <tr>
        <td colSpan={4}>
          <div className="border-b border-slate-200 w-full" />
        </td>
      </tr>
    </>
  );
};

export default OrderItem;
