import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (userId, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("carts")
        .select("items")
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw error;
      }
      return data ? data.items : null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const syncCart = createAsyncThunk(
  "cart/syncCart",
  async ({ userId, cartItems }, { rejectWithValue }) => {
    try {
      const { error } = await supabase.from("carts").upsert({
        user_id: userId,
        items: cartItems,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      return cartItems;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    total: 0,
    cartItems: {},
    isLoading: false,
    error: null,
  },
  reducers: {
    addToCart: (state, action) => {
      const { productId } = action.payload;
      if (state.cartItems[productId]) {
        state.cartItems[productId]++;
      } else {
        state.cartItems[productId] = 1;
      }
      state.total += 1;
    },
    removeFromCart: (state, action) => {
      const { productId } = action.payload;
      if (state.cartItems[productId]) {
        state.cartItems[productId]--;
        if (state.cartItems[productId] === 0) {
          delete state.cartItems[productId];
        }
      }
      state.total -= 1;
    },
    deleteItemFromCart: (state, action) => {
      const { productId } = action.payload;
      state.total -= state.cartItems[productId]
        ? state.cartItems[productId]
        : 0;
      delete state.cartItems[productId];
    },
    clearCart: (state) => {
      state.cartItems = {};
      state.total = 0;
    },
    setCart: (state, action) => {
      state.cartItems = action.payload;
      // Recalculate total
      state.total = Object.values(action.payload).reduce(
        (acc, qty) => acc + qty,
        0
      );
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      if (action.payload) {
        // Merge remote cart with local cart?
        // For now, let's adopt the remote cart if it has items,
        // merging strategy could be complex.
        // Or, if local has items and remote has items, merge.
        // Simple strategy: If remote exists, use it.
        state.cartItems = action.payload;
        state.total = Object.values(state.cartItems).reduce(
          (acc, curr) => acc + curr,
          0
        );
      }
    });
  },
});

export const {
  addToCart,
  removeFromCart,
  clearCart,
  deleteItemFromCart,
  setCart,
} = cartSlice.actions;

export default cartSlice.reducer;
