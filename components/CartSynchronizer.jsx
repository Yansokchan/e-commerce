"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, syncCart } from "@/lib/features/cart/cartSlice";

export default function CartSynchronizer() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  // Optional: Select cartItems too if we want to sync on change,
  // but need to be careful about loops or overriding.
  const cartItems = useSelector((state) => state.cart.cartItems);

  // To avoid initial sync overriding remote with empty local or vice versa immediately
  // we rely on fetchCart running once on mount/login.

  const isFirstRender = useRef(true);
  const prevUserRef = useRef(null);

  useEffect(() => {
    // When user logs in (or mount if already logged in)
    if (user && user.id) {
      // Fetch cart from server
      // If server has data, it updates store (via extraReducers)
      dispatch(fetchCart(user.id));
    }
    prevUserRef.current = user;
  }, [user, dispatch]);

  // Debounced Sync Hook
  useEffect(() => {
    // Only sync if user is logged in
    if (!user || !user.id) return;

    // Skip the very first render to avoid syncing initial empty state if fetch hasn't finished
    // But actually, if different tab updates, we might want to know...
    // For now, let's just debounce sync upstream changes.

    // We need a debounce here
    const timeoutId = setTimeout(() => {
      // We sync current state to server
      // Note: this might override server if multiple tabs are open and one is stale.
      // Real-time sync needs Supabase subscriptions, but this is a simple "save" mechanism.
      dispatch(syncCart({ userId: user.id, cartItems }));
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [cartItems, user, dispatch]);

  return null; // Logic only component
}
