import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import ErrorBoundary from "./components/ErrorBoundary";
import "./styles/index.css";

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary label="application">
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
