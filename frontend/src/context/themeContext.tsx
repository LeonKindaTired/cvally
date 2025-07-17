import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type ThemeContextType = {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error(
      "useThemeContext must be used within a ThemeContextProvider"
    );
  }
  return context;
};

export const ThemeContextProvider = ({ children }: any) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem("theme");
    const initialTheme = storedTheme ? JSON.parse(storedTheme) : "light";

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(initialTheme);

    return initialTheme;
  });

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(theme));

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
