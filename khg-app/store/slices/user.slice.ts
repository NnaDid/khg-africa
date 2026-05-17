import { createSlice } from "@reduxjs/toolkit";

type UserState = {
  id: string | null;
  name: string | null;
  phone: string | null;
  email: string | null;
};

const initialState: UserState = {
  id: null,
  name: null,
  phone: null,
  email: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      return { ...state, ...action.payload };
    },
    clearUser: () => initialState,
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;