import { createSlice } from "@reduxjs/toolkit";

type SessionState = {
  deviceId: string | null;
  lastLogin: string | null;
  ipAddress: string | null;
};

const initialState: SessionState = {
  deviceId: null,
  lastLogin: null,
  ipAddress: null,
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setSession: (state, action) => {
      return { ...state, ...action.payload };
    },
    clearSession: () => initialState,
  },
});

export const { setSession, clearSession } = sessionSlice.actions;
export default sessionSlice.reducer;