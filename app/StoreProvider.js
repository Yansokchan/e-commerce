"use client";
import { useRef, useEffect } from "react";
import { Provider } from "react-redux";
import { makeStore } from "../lib/store";
import { fetchProducts } from "@/lib/features/product/productSlice";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import CartSynchronizer from "@/components/CartSynchronizer";

export default function StoreProvider({ children }) {
  const storeRef = useRef(undefined);
  const persistorRef = useRef(undefined);

  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
    persistorRef.current = persistStore(storeRef.current);
  }

  useEffect(() => {
    // Fetch initial products
    storeRef.current.dispatch(fetchProducts());
  }, []);

  return (
    <Provider store={storeRef.current}>
      <PersistGate loading={null} persistor={persistorRef.current}>
        <CartSynchronizer />
        {children}
      </PersistGate>
    </Provider>
  );
}
