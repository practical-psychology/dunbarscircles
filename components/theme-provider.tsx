import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      // Check if localStorage is available and working
      if (
        typeof window !== "undefined" &&
        window.localStorage &&
        typeof window.localStorage.getItem === "function"
      ) {
        const stored = localStorage.getItem(storageKey);
        return (stored as Theme) || defaultTheme;
      }
    } catch (error) {
      // localStorage is not available or throws an error
      console.warn(
        "localStorage is not available, using default theme:",
        error,
      );
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      let systemTheme = "light"; // Default fallback

      try {
        // Safely check for matchMedia support with comprehensive validation
        if (
          typeof window !== "undefined" &&
          window.matchMedia &&
          typeof window.matchMedia === "function"
        ) {
          const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

          // Validate that mediaQuery is a valid object with matches property
          if (
            mediaQuery &&
            typeof mediaQuery === "object" &&
            "matches" in mediaQuery &&
            typeof mediaQuery.matches === "boolean"
          ) {
            systemTheme = mediaQuery.matches ? "dark" : "light";
          } else {
            // mediaQuery is invalid or missing matches property
            console.warn(
              "matchMedia returned invalid result, using light theme",
            );
          }
        } else {
          // matchMedia is not available
          console.warn("matchMedia is not available, using light theme");
        }
      } catch (error) {
        // matchMedia is not available or throws an error
        console.warn("matchMedia is not available, using light theme:", error);
      }

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      try {
        // Check if localStorage is available and working
        if (
          typeof window !== "undefined" &&
          window.localStorage &&
          typeof window.localStorage.setItem === "function"
        ) {
          localStorage.setItem(storageKey, theme);
        }
      } catch (error) {
        // localStorage is not available or throws an error
        console.warn("Failed to save theme to localStorage:", error);
      }
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
