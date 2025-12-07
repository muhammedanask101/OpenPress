// Key for localStorage
const UI_KEY = "ui";

const safeParse = (value, fallback) => {
  try {
    if (!value) return fallback;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

// Detect system preference once (if available)
const detectSystemTheme = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

// load / save whole UI state
const loadRawState = () => {
  if (typeof window === "undefined") return {};
  const stored = window.localStorage.getItem(UI_KEY);
  return safeParse(stored, {});
};

const saveRawState = (partial) => {
  if (typeof window === "undefined") return;
  const current = loadRawState();
  const next = { ...current, ...partial };
  window.localStorage.setItem(UI_KEY, JSON.stringify(next));
};

// exposed helpers 

// Used by initial Redux state
const getInitialUIState = () => {
  const stored = loadRawState();

  const themeMode =
    stored.themeMode ||
    "system"; // "system" means respect OS, but we also store effectiveTheme

  const effectiveTheme =
    themeMode === "system" ? detectSystemTheme() : themeMode;

  return {
    themeMode,                          // "light" | "dark" | "system"
    effectiveTheme,                     // actual mode applied: "light" | "dark"
    sidebarOpen:
      typeof stored.sidebarOpen === "boolean" ? stored.sidebarOpen : true,
    lastVisitedRoute: stored.lastVisitedRoute || "/",
  };
};

const setThemeMode = (mode) => {
  const themeMode = mode || "system";
  const effectiveTheme =
    themeMode === "system" ? detectSystemTheme() : themeMode;

  saveRawState({ themeMode, effectiveTheme });
  return { themeMode, effectiveTheme };
};

const setSidebarOpen = (isOpen) => {
  saveRawState({ sidebarOpen: !!isOpen });
  return !!isOpen;
};

const setLastVisitedRoute = (path) => {
  const normalized = typeof path === "string" && path.trim().length > 0 ? path : "/";
  saveRawState({ lastVisitedRoute: normalized });
  return normalized;
};

const clearUIState = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(UI_KEY);
};

const uiService = {
  getInitialUIState,
  setThemeMode,
  setSidebarOpen,
  setLastVisitedRoute,
  clearUIState,
};

export default uiService;
