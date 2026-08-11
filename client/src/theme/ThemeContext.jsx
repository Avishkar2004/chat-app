import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Three options, in plain language. "System" follows the device setting.
 */
export const THEMES = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "system", label: "System" },
];

const STORAGE_KEY = "app.theme";
const DEFAULT_THEME = "system";
const DARK_QUERY = "(prefers-color-scheme: dark)";

/** Old six-theme values still sitting in localStorage. */
const LEGACY_THEMES = {
  midnight: "dark",
  ocean: "dark",
  forest: "dark",
  sunset: "dark",
  whatsapp: "dark",
  daylight: "light",
};

const isValid = (id) => THEMES.some((t) => t.id === id);

function readInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isValid(saved)) return saved;
    if (saved && LEGACY_THEMES[saved]) return LEGACY_THEMES[saved];
  } catch {
    // localStorage can throw in private mode — fall through to the default.
  }
  return DEFAULT_THEME;
}

function prefersDark() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(DARK_QUERY).matches;
}

const ThemeContext = createContext({
  theme: DEFAULT_THEME,
  resolvedTheme: "light",
  setTheme: () => {},
  themes: THEMES,
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readInitialTheme);
  const [systemIsDark, setSystemIsDark] = useState(prefersDark);

  // Track the OS setting so `resolvedTheme` is right while on "System".
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mql = window.matchMedia(DARK_QUERY);
    const onChange = (e) => setSystemIsDark(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // `data-theme` drives the CSS overrides in index.css. "system" is left on
  // the element as a marker: it matches neither [data-theme="dark"] nor the
  // :not([data-theme="light"]) guard's exclusion, so the media query wins.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const setTheme = useCallback((next) => {
    if (!isValid(next)) return;
    setThemeState(next);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme:
        theme === "system" ? (systemIsDark ? "dark" : "light") : theme,
      setTheme,
      themes: THEMES,
    }),
    [theme, systemIsDark, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
