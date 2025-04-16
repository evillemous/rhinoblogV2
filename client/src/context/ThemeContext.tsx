import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Get theme preference from localStorage or system preference
  const getThemePreference = (): Theme => {
    const storedTheme = localStorage.getItem("theme");
    
    if (storedTheme === "dark") {
      return "dark";
    }
    
    if (storedTheme === "light") {
      return "light";
    }
    
    // Use system preference as fallback
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };
  
  const [theme, setTheme] = useState<Theme>("light"); // Default to light to avoid flickering
  
  // Initialize theme on mount
  useEffect(() => {
    setTheme(getThemePreference());
  }, []);
  
  // Apply theme class to html element
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // Store preference
    localStorage.setItem("theme", theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === "light" ? "dark" : "light"));
  };
  
  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
