"use client";
import { useEffect, useState } from "react";
import OrderItem from "@/components/OrderItem";
import PageTitle from "@/components/PageTitle";
import { Loader2 } from "lucide-react";
import RippleButton from "@/components/ui/ripple-button";

const PAGE_SIZE = 10;

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchOrders = async (pageNumber, isInitial = false) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .range(pageNumber * PAGE_SIZE, (pageNumber + 1) * PAGE_SIZE - 1);

        if (data) {
          if (isInitial) {
            setOrders(data);
          } else {
            setOrders((prev) => [...prev, ...data]);
          }
          setHasMore(data.length === PAGE_SIZE);
        }
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchOrders(0, true);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchOrders(nextPage);
  };

  return (
    <div className="min-h-[70vh] mx-6">
      <PageTitle
        heading="My Orders"
        text={
          loading
            ? "Loading your orders..."
            : `Showing ${orders.length} latest orders`
        }
        linkText={"Go to home"}
      />

      {loading ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-slate-400">
          <Loader2 className="animate-spin text-pink-600" size={40} />
          <p className="font-medium animate-pulse">Loading your orders...</p>
        </div>
      ) : orders.length > 0 ? (
        <div className="my-10 max-w-7xl mx-auto">
          <table className="w-full max-w-5xl text-slate-500 table-auto border-separate border-spacing-y-12 border-spacing-x-4">
            <thead>
              <tr className="max-sm:text-sm text-slate-600 max-md:hidden">
                <th className="text-left">Product</th>
                <th className="text-center">Total Price</th>
                <th className="text-left">Address</th>
                <th className="text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <OrderItem order={order} key={order.id} />
              ))}
            </tbody>
          </table>

          {hasMore && (
            <div className="flex justify-center">
              <RippleButton
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="bg-gradient-to-r from-pink-600 to-pink-500 shadow-xl ring ring-offset ring-white/50 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-pink-50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    Loading...
                  </div>
                ) : (
                  "See More"
                )}
              </RippleButton>
            </div>
          )}
        </div>
      ) : (
        <div className="min-h-[80vh] mx-6 flex flex-col items-center justify-center gap-4 text-slate-400">
          <h1 className="text-2xl sm:text-4xl font-semibold">
            You have no orders
          </h1>
          <p className="text-slate-500">
            Start shopping to see your orders here!
          </p>
          <RippleButton
            onClick={() => (window.location.href = "/shop")}
            className="bg-gradient-to-r from-pink-600 to-pink-500 text-white px-8 py-3 rounded-xl font-bold shadow-xl active:scale-95 transition-all"
          >
            Go to Shop
          </RippleButton>
        </div>
      )}
    </div>
  );
}
