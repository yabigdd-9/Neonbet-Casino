import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import { installErrorMonitoring } from "./lib/diagnostics";
import "./styles/index.css";

const stopMonitoring = installErrorMonitoring();
if (import.meta.hot) import.meta.hot.dispose(stopMonitoring);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
