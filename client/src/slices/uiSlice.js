import { createSlice } from "@reduxjs/toolkit";
import uiService from "../services/uiService";

const persisted = uiService.getInitialUIState();

const initialState = {
  // persisted UI prefs
  themeMode: persisted.themeMode,          // "light" | "dark" | "system"
  effectiveTheme: persisted.effectiveTheme, // "light" | "dark"
  sidebarOpen: persisted.sidebarOpen,
  lastVisitedRoute: persisted.lastVisitedRoute,

  // nice-to-have global UI bits
  globalLoading: false,
  toast: null, // { type: "success" | "error" | "info" | "warning", message, id }
};

let toastIdCounter = 0;

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // THEME
    setThemeMode: (state, action) => {
      const mode = action.payload || "system";
      const { themeMode, effectiveTheme } = uiService.setThemeMode(mode);
      state.themeMode = themeMode;
      state.effectiveTheme = effectiveTheme;
    },
    toggleTheme: (state) => {
      // cycles light -> dark -> system -> light ...
      let next;
      if (state.themeMode === "light") next = "dark";
      else if (state.themeMode === "dark") next = "system";
      else next = "light";

      const { themeMode, effectiveTheme } = uiService.setThemeMode(next);
      state.themeMode = themeMode;
      state.effectiveTheme = effectiveTheme;
    },

    // SIDEBAR 
    setSidebarOpen: (state, action) => {
      const isOpen = !!action.payload;
      state.sidebarOpen = uiService.setSidebarOpen(isOpen);
    },
    toggleSidebar: (state) => {
      const isOpen = !state.sidebarOpen;
      state.sidebarOpen = uiService.setSidebarOpen(isOpen);
    },

    // ROUTE 
    setLastVisitedRoute: (state, action) => {
      const path = action.payload;
      state.lastVisitedRoute = uiService.setLastVisitedRoute(path);
    },

    // GLOBAL LOADING
    setGlobalLoading: (state, action) => {
      state.globalLoading = !!action.payload;
    },

    // TOASTS
    showToast: (state, action) => {
      const { type = "info", message } = action.payload || {};
      if (!message) return;
      toastIdCounter += 1;
      state.toast = { id: toastIdCounter, type, message };
    },
    clearToast: (state) => {
      state.toast = null;
    },

    // RESET ALL
    resetUI: (state) => {
      uiService.clearUIState();
      const fresh = uiService.getInitialUIState();
      state.themeMode = fresh.themeMode;
      state.effectiveTheme = fresh.effectiveTheme;
      state.sidebarOpen = fresh.sidebarOpen;
      state.lastVisitedRoute = fresh.lastVisitedRoute;
      state.globalLoading = false;
      state.toast = null;
    },
  },
});

export const {
  setThemeMode,
  toggleTheme,
  setSidebarOpen,
  toggleSidebar,
  setLastVisitedRoute,
  setGlobalLoading,
  showToast,
  clearToast,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;
