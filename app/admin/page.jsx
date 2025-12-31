"use client";

import OrdersAreaChart from "@/components/OrdersAreaChart";
import {
  CircleDollarSignIcon,
  ShoppingBasketIcon,
  TagsIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminDashboard() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "$";

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    products: 0,
    revenue: 0,
    orders: 0,
    allOrders: [],
  });
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch Products Count
      const { count: productCount, error: pError } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      // Fetch Orders
      const { data: orders, error: oError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: true });

      if (pError) console.error(pError);
      if (oError) console.error(oError);

      let totalRevenue = 0;
      if (orders) {
        totalRevenue = orders.reduce(
          (acc, order) => acc + (parseFloat(order.total) || 0),
          0
        );
      }

      setStats({
        products: productCount || 0,
        orders: orders?.length || 0,
        revenue: totalRevenue,
        allOrders: orders || [],
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  const dashboardCardsData = [
    {
      title: "Total Products",
      value: stats.products,
      icon: ShoppingBasketIcon,
    },
    {
      title: "Total Revenue",
      value: currency + stats.revenue.toLocaleString(),
      icon: CircleDollarSignIcon,
    },
    { title: "Total Orders", value: stats.orders, icon: TagsIcon },
  ];

  if (loading) return <div className="p-10">Loading Dashboard...</div>;

  return (
    <div className="text-slate-500 p-6">
      <h1 className="text-2xl">
        Admin <span className="text-slate-800 font-medium">Dashboard</span>
      </h1>

      {/* Cards */}
      <div className="flex flex-wrap gap-5 my-10 mt-4">
        {dashboardCardsData.map((card, index) => (
          <div
            key={index}
            className="flex items-center gap-10 border border-slate-200 p-3 px-6 rounded-lg bg-white shadow-sm"
          >
            <div className="flex flex-col gap-3 text-xs">
              <p>{card.title}</p>
              <b className="text-2xl font-medium text-slate-700">
                {card.value}
              </b>
            </div>
            <card.icon
              size={50}
              className="w-11 h-11 p-2.5 text-slate-400 bg-slate-100 rounded-full"
            />
          </div>
        ))}
      </div>

      {/* Area Chart */}
      <h2 className="text-xl font-medium text-slate-700 mb-4">
        Orders Overview
      </h2>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <OrdersAreaChart allOrders={stats.allOrders} />
      </div>
    </div>
  );
}
