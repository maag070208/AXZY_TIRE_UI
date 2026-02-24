import store from "@core/store/store";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { HashRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import ToastProvider from "./providers/toast.provider.tsx";
import React from "react";
import { ITThemeProvider } from "@axzydev/axzy_ui_system";


 const theme = {
    colors: {
      primary: {
        50: "#fef2f2",
        100: "#fee2e2",
        200: "#fecaca",
        300: "#fca5a5",
        400: "#f87171",
        500: "#ef4444", // Red 500
        600: "#dc2626",
        700: "#b91c1c",
        800: "#991b1b",
        900: "#7f1d1d",
        950: "#450a0a",
      }
    },
  };

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
  <Provider store={store}>
    <ITThemeProvider theme={theme}>
    <ToastProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </ToastProvider>
    </ITThemeProvider>
  </Provider>
  </React.StrictMode>
);
