import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "ui-frameworks": [
            "framer-motion",
            "gsap",
            "leaflet",
            "react-leaflet",
          ],
          "utility-libraries": ["axios", "lodash"],
          "icon-packages": [
            "react-icons",
            "@fortawesome/fontawesome-svg-core",
            "@fortawesome/free-solid-svg-icons",
            "@fortawesome/free-regular-svg-icons",
            "@fortawesome/react-fontawesome",
            "lucide-react",
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    // Optimize production builds
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  // Add performance prefetch for dynamic imports
  server: {
    host: '0.0.0.0',  // This allows external access
    port: 5173,       // Default Vite port
    hmr: {
      overlay: true,
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
    fs: {
      strict: false,
      allow: ['..']
    },
    proxy: {
      "/api/auth": {
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,
      },
      "/api/admin": {
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,
      },
      "/api/submit-booking": {
        target: process.env.NODE_ENV === 'production' 
          ? 'https://roofing-co.pages.dev'
          : 'http://localhost:8788',
        changeOrigin: true,
        secure: true,
      },
      "/api/upload": {
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,
      },
      "/api/download": {
        target: "http://localhost:5001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
