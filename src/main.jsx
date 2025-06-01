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
  // Add important data files that are actually fetched by components
  {
    rel: "preload",
    href: "/personal/old/jsons/combined_data.json",
    as: "fetch",
    type: "application/json",
    crossorigin: "anonymous"
  },
  {
    rel: "preload",
    href: "/personal/old/jsons/services.json",
    as: "fetch",
    type: "application/json",
    crossorigin: "anonymous"
  },
  {
    rel: "preload",
    href: "/personal/old/jsons/about_page.json",
    as: "fetch",
    type: "application/json",
    crossorigin: "anonymous"
  },
  {
    rel: "preload",
    href: "/personal/old/jsons/all_blocks_showcase.json",
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
