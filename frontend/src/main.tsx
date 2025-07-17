import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { ThemeContextProvider } from "./context/themeContext.tsx";
import { AuthProvider } from "./context/authContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeContextProvider>
          <App />
        </ThemeContextProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
