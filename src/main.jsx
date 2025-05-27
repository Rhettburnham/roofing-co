import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import initPerformanceOptimizations from "./utils/client-hints.js";
import { ConfigProvider } from "./context/ConfigContext";

// Initialize performance optimizations
initPerformanceOptimizations();

// Add preload hints for commonly used assets
const preloadLinks = [
  // Add important stylesheets
  {
    rel: "preload",
    href: "/data/combined_data.json",
    as: "fetch",
    type: "application/json",
    crossorigin: "anonymous"
  },
  {
    rel: "preload",
    href: "/data/services.json",
    as: "fetch",
    type: "application/json",
    crossorigin: "anonymous"
  },
  {
    rel: "preload",
    href: "/data/ignore/services.json",
    as: "fetch",
    type: "application/json",
    crossorigin: "anonymous"
  },
  // Add common images that should be loaded early
  { rel: "preload", href: "/assets/images/logo.svg", as: "image" },
];

// Insert preload links into the document head
preloadLinks.forEach((linkProps) => {
  const link = document.createElement("link");
  Object.entries(linkProps).forEach(([key, value]) => {
    link.setAttribute(key, value);
  });
  document.head.appendChild(link);
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConfigProvider>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
