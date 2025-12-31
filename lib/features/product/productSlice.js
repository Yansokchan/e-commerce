import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createClient } from "@/lib/supabase/client";

export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }
);

const productSlice = createSlice({
  name: "product",
  initialState: {
    list: [],
    status: "idle",
    error: null,
  },
  reducers: {
    setProduct: (state, action) => {
      state.list = action.payload;
    },
    clearProduct: (state) => {
      state.list = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.list = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { setProduct, clearProduct } = productSlice.actions;

export default productSlice.reducer;
