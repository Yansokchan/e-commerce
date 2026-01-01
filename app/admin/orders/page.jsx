"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import {
  CheckCircleIcon,
  ClockIcon,
  PhoneIcon,
  AlertTriangleIcon,
} from "lucide-react";
import toast from "react-hot-toast";

import OrderDetailsModal from "./OrderDetailsModal";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setOrders(data);
    setLoading(false);
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      console.log("=== Starting order confirmation for:", orderId);

      // Get the order details
      const order = orders.find((o) => o.id === orderId);
      if (!order) {
        console.error("Order not found");
        return;
      }

      console.log("Order found:", order);
      console.log("Order items:", order.items);

      // Parse items
      const items = Array.isArray(order.items) ? order.items : [];
      console.log("Parsed items count:", items.length);

      if (items.length === 0) {
        toast.error("No items in this order");
        return;
      }

      // Update stock for each item
      for (const item of items) {
        console.log(
          "Processing item:",
          item.name,
          "ID:",
          item.id,
          "Qty:",
          item.quantity
        );

        const { data: product, error: fetchError } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.id)
          .single();

        console.log("Product fetch:", { product, fetchError });

        if (fetchError) {
          toast.error(`Error fetching product: ${fetchError.message}`);
          return;
        }

        if (product) {
          const currentStock = product.stock || 0;
          const newStock = Math.max(0, currentStock - item.quantity);
          console.log(`Stock update: ${currentStock} -> ${newStock}`);

          const { error: updateError } = await supabase
            .from("products")
            .update({ stock: newStock })
            .eq("id", item.id);

          if (updateError) {
            console.error("Stock update error:", updateError);
            toast.error(`Error updating stock: ${updateError.message}`);
            return;
          }
          console.log("Stock updated successfully");
        }
      }

      // Update order status to confirmed
      console.log("Updating order status...");
      const { error } = await supabase
        .from("orders")
        .update({ status: "confirmed" })
        .eq("id", orderId);

      if (!error) {
        console.log("Order confirmed!");
        fetchOrders(); // Refresh list
        toast.success("Order confirmed and stock updated!");
      } else {
        console.error("Order update error:", error);
        toast.error("Error confirming order: " + error.message);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Error: " + error.message);
    }
  };

  const handleDeliveredOrder = async (orderId) => {
    try {
      console.log("Marking order as delivered:", orderId);
      const { error } = await supabase
        .from("orders")
        .update({ status: "delivered" })
        .eq("id", orderId);

      if (error) {
        throw error;
      }

      toast.success("Order marked as delivered!");
      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order: " + error.message);
    }
  };

  const handleCancelOrder = async (orderId, currentStatus, items) => {
    try {
      console.log("Cancelling order:", orderId);

      // If order was confirmed, we need to restore stock
      if (currentStatus === "confirmed") {
        console.log("Restoring stock for confirmed order...");

        for (const item of items) {
          const { data: product, error: fetchError } = await supabase
            .from("products")
            .select("stock")
            .eq("id", item.id)
            .single();

          if (fetchError) {
            console.error(`Error fetching product ${item.id}:`, fetchError);
            continue; // Skip or handle error
          }

          if (product) {
            const currentStock = product.stock || 0;
            const restoredStock = currentStock + item.quantity;
            console.log(
              `Restoring stock for ${item.name}: ${currentStock} -> ${restoredStock}`
            );

            const { error: updateError } = await supabase
              .from("products")
              .update({ stock: restoredStock })
              .eq("id", item.id);

            if (updateError) {
              console.error(
                `Error restoring stock for ${item.id}:`,
                updateError
              );
            }
          }
        }
      }

      // Update order status to cancelled
      const { error } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId);

      if (error) {
        throw error;
      }

      toast.success("Order cancelled successfully");
      fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order: " + error.message);
    }
  };

  if (loading) return <div className="p-10">Loading orders...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders Management</h1>
        <div className="text-sm text-gray-500">
          Total: {orders.length} orders
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 font-medium text-gray-600">Order ID</th>
              <th className="p-4 font-medium text-gray-600">Items</th>
              <th className="p-4 font-medium text-gray-600">Phone</th>
              <th className="p-4 font-medium text-gray-600">Total</th>
              <th className="p-4 font-medium text-gray-600">Status</th>
              <th className="p-4 font-medium text-gray-600">Date</th>
              <th className="p-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <td className="p-4">
                  <div className="text-xs font-mono text-gray-600 underline decoration-dotted hover:text-indigo-600">
                    {order.id.slice(0, 8)}...
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm">
                    {Array.isArray(order.items)
                      ? order.items.length
                      : typeof order.items === "string"
                      ? JSON.parse(order.items || "[]").length
                      : 0}
                    item(s)
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {/* <PhoneIcon size={14} /> */}
                    {order.phone || "N/A"}
                  </div>
                </td>
                <td className="p-4 font-medium">${order.total}</td>
                <td className="p-4">
                  {order.status === "confirmed" ? (
                    <span className="inline-flex items-center gap-1 w-[90px] py-1 justify-center rounded text-xs bg-green-100 text-green-700">
                      <CheckCircleIcon size={14} />
                      Confirmed
                    </span>
                  ) : order.status === "delivered" ? (
                    <span className="inline-flex items-center gap-1 w-[90px] py-1 justify-center rounded text-xs bg-blue-100 text-blue-700">
                      <CheckCircleIcon size={14} />
                      Delivered
                    </span>
                  ) : order.status === "cancelled" ? (
                    <span className="inline-flex items-center gap-1 w-[90px] py-1 justify-center rounded text-xs bg-red-100 text-red-700">
                      <AlertTriangleIcon size={14} />
                      Cancelled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 w-[90px] py-1 justify-center rounded text-xs bg-orange-100 text-orange-700">
                      <ClockIcon size={14} />
                      Pending
                    </span>
                  )}
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                  {order.status === "pending" ? (
                    <button
                      onClick={() => handleConfirmOrder(order.id)}
                      className="w-[85px] py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Confirm
                    </button>
                  ) : order.status === "confirmed" ? (
                    <button
                      onClick={() => handleDeliveredOrder(order.id)}
                      className="w-[85px] py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Delivered
                    </button>
                  ) : order.status === "delivered" ? (
                    <button
                      disabled
                      className="w-[85px] py-1 bg-gray-200 text-gray-400 text-sm rounded cursor-not-allowed"
                    >
                      Delivered
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-[85px] py-1 bg-gray-200 text-gray-400 text-sm rounded cursor-not-allowed"
                    >
                      Cancelled
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="p-8 text-center text-gray-500">No orders found.</div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onCancel={handleCancelOrder}
        />
      )}
    </div>
  );
}
