import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("app-theme") || "system";
  });

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      let effectiveTheme = theme;
      if (theme === "system") {
        effectiveTheme = mediaQuery.matches ? "dark" : "light";
      }
      
      root.setAttribute("data-theme", effectiveTheme);
      localStorage.setItem("app-theme", theme);
    };

    applyTheme();

    // Listen for OS-level theme changes if set to "system"
    const handleSystemChange = () => {
      if (theme === "system") applyTheme();
    };

    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}