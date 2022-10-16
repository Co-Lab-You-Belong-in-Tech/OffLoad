import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  currentScreen: null,
  emojiId: null,
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setScreen: (state, action) => {
      state.currentScreen = action.payload;
    },
    resetScreen: (state) => {
      state.currentScreen = null;
    },
    storeEmojiId: (state, action) => {
      state.emojiId = action.payload;
    },
  },
});

export const { setUser, setScreen, resetScreen, storeEmojiId } =
  appSlice.actions;
export const selectUser = (state) => state.app.user;

export default appSlice.reducer;
