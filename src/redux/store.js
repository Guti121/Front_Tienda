import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import userReducer from "./userSlice";
import { isWeb } from "../components/token/localstorage";
import createSecureStore from "redux-persist-expo-securestore";

// 📌 Adaptamos SecureStore para Redux Persist
const secureStorage = createSecureStore();

export const storageWrapper = isWeb
  ? {
      setItem: (key, value) =>
        Promise.resolve(localStorage.setItem(key, JSON.stringify(value))),
      getItem: (key) =>
        Promise.resolve(
          localStorage.getItem(key)
            ? JSON.parse(localStorage.getItem(key))
            : null,
        ),
      removeItem: (key) => Promise.resolve(localStorage.removeItem(key)),
    }
  : secureStorage; // Usa SecureStore si NO es web

const persistConfig = {
  key: "user",
  storage: storageWrapper, // Usamos la adaptación de SecureStore
  whitelist: ["user"],
};

const persistedReducer = persistReducer(persistConfig, userReducer);

export const store = configureStore({
  reducer: {
    user: persistedReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);
