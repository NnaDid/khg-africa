import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/auth.slice";
import userReducer from "./slices/user.slice";
import walletReducer from "./slices/wallet.slice";
import settingsReducer from "./slices/settings.slice";
import kycReducer from "./slices/kyc.slice";
import sessionReducer from "./slices/session.slice";

export const store = configureStore({ 
  reducer: {
    auth: authReducer,
    user: userReducer,
    wallet: walletReducer,
    settings: settingsReducer,
    kyc: kycReducer,
    session: sessionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;