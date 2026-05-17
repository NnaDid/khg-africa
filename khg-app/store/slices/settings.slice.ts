import { createSlice } from "@reduxjs/toolkit";

type SettingsState = {
  theme: "light" | "dark";
  biometrics: boolean;
  notifications: boolean;
};

const initialState: SettingsState = {
  theme: "light",
  biometrics: false,
  notifications: true,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleBiometrics: (state) => {
      state.biometrics = !state.biometrics;
    },
    toggleNotifications: (state) => {
      state.notifications = !state.notifications;
    },
  },
});

export const {
  setTheme,
  toggleBiometrics,
  toggleNotifications,
} = settingsSlice.actions;

export default settingsSlice.reducer;