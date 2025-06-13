import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sidebarOpen: false,
  theme: "dark",
  notifications: [],
  modals: {
    videoPlayer: {
      isOpen: false,
      contentId: null,
      contentType: null,
    },
    confirmDialog: {
      isOpen: false,
      title: "",
      message: "",
      onConfirm: null,
    },
  },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    openVideoPlayer: (state, action) => {
      state.modals.videoPlayer = {
        isOpen: true,
        contentId: action.payload.contentId,
        contentType: action.payload.contentType,
      };
    },
    closeVideoPlayer: (state) => {
      state.modals.videoPlayer = {
        isOpen: false,
        contentId: null,
        contentType: null,
      };
    },
    openConfirmDialog: (state, action) => {
      state.modals.confirmDialog = {
        isOpen: true,
        ...action.payload,
      };
    },
    closeConfirmDialog: (state) => {
      state.modals.confirmDialog = {
        isOpen: false,
        title: "",
        message: "",
        onConfirm: null,
      };
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  addNotification,
  removeNotification,
  clearNotifications,
  openVideoPlayer,
  closeVideoPlayer,
  openConfirmDialog,
  closeConfirmDialog,
} = uiSlice.actions;

export default uiSlice.reducer;
