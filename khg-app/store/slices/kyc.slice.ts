import { createSlice } from "@reduxjs/toolkit";

type KYCState = {
  level: number;
  verified: boolean;
  documentType: string | null;
};

const initialState: KYCState = {
  level: 0,
  verified: false,
  documentType: null,
};

const kycSlice = createSlice({
  name: "kyc",
  initialState,
  reducers: {
    setKYC: (state, action) => {
      return { ...state, ...action.payload };
    },
    resetKYC: () => initialState,
  },
});

export const { setKYC, resetKYC } = kycSlice.actions;
export default kycSlice.reducer;