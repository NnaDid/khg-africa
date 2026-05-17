import { createSlice } from "@reduxjs/toolkit";

type WalletState = {
  balance: number;
  currency: string;
  ledgerBalance: number;
  lockedBalance: number;
};

const initialState: WalletState = {
  balance: 0,
  currency: "NGN",
  ledgerBalance: 0,
  lockedBalance: 0,
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    setBalance: (state, action) => {
      state.balance = action.payload;
    },
    setLedgerBalance: (state, action) => {
      state.ledgerBalance = action.payload;
    },
    setLockedBalance: (state, action) => {
      state.lockedBalance = action.payload;
    },
    resetWallet: () => initialState,
  },
});

export const {
  setBalance,
  setLedgerBalance,
  setLockedBalance,
  resetWallet,
} = walletSlice.actions;

export default walletSlice.reducer;