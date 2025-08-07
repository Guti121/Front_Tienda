import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import userReducer from "./userSlice";
import { isWeb } from "../components/token/localstorage";
import * as SecureStore from "expo-secure-store";

// 🚫 Ya no usamos redux-persist-expo-securestore
const secureStorage = {
  setItem: async (key, value) => {
    await SecureStore.setItemAsync(key, value);
  },
  getItem: async (key) => {
    return await SecureStore.getItemAsync(key);
  },
  removeItem: async (key) => {
    await SecureStore.deleteItemAsync(key);
  },
};

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
  : secureStorage;

const persistConfig = {
  key: "user",
  storage: storageWrapper,
  whitelist: ["user","empresa"],
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
