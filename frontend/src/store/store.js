import authReducer from "./slices/authSlice";
import { configureStore } from "@reduxjs/toolkit";
import contentReducer from "./slices/contentSlice";
import favoritesReducer from "./slices/favoritesSlice";
import searchReducer from "./slices/searchSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    content: contentReducer,
    favorites: favoritesReducer,
    search: searchReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["auth/login/fulfilled", "auth/register/fulfilled"],
        // Ignore these field paths in all actions
        ignoredActionPaths: ["meta.arg", "payload.timestamp"],
        // Ignore these paths in the state
        ignoredPaths: ["auth.user"],
      },
    }),
});
