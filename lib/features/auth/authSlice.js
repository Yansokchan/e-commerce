import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    showLoginModal: false,
    showEditProfileModal: false,
    needsOnboarding: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
    openLoginModal: (state) => {
      state.showLoginModal = true;
    },
    closeLoginModal: (state) => {
      state.showLoginModal = false;
    },
    openEditProfileModal: (state) => {
      state.showEditProfileModal = true;
    },
    closeEditProfileModal: (state) => {
      state.showEditProfileModal = false;
    },
    setNeedsOnboarding: (state, action) => {
      state.needsOnboarding = action.payload;
    },
    completeOnboarding: (state) => {
      state.needsOnboarding = false;
    },
  },
});

export const {
  setUser,
  clearUser,
  openLoginModal,
  closeLoginModal,
  openEditProfileModal,
  closeEditProfileModal,
  setNeedsOnboarding,
  completeOnboarding,
} = authSlice.actions;
export default authSlice.reducer;
