import React, { createContext, useContext, useEffect, useState } from "react";

export const THEMES = [
  { id: "midnight", label: "Midnight" },
  { id: "ocean", label: "Ocean" },
  { id: "forest", label: "Forest" },
  { id: "sunset", label: "Sunset" },
  { id: "daylight", label: "Daylight" },
  { id: "whatsapp", label: "WhatsApp" },
];

const STORAGE_KEY = "app.theme";
const DEFAULT_THEME = "midnight";

const ThemeContext = createContext({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

function readInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && THEMES.some((t) => t.id === saved)) return saved;
  } catch {
    // ignore
  }
  return DEFAULT_THEME;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  function setTheme(next) {
    if (!THEMES.some((t) => t.id === next)) return;
    setThemeState(next);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
