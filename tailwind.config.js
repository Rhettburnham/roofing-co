/** @type {import('tailwindcss').Config} */

const fs = require("fs");
const path = require("path");

// Default professional color scheme
let customColors = {
  accent: "#2B4C7E", // Professional blue
  banner: "#1A2F4D", // Darker blue
  "second-accent": "#FFF8E1", // Amber 100 equivalent
  "faint-color": "#E0F7FA", // Light blue
};

const jsonPath = path.join(
  __dirname,
  "public",
  "data",
  "step_2",
  "colors_output.json"
);
try {
  const raw = fs.readFileSync(jsonPath, "utf-8");
  const parsed = JSON.parse(raw);
  if (typeof parsed === "object") {
    customColors = parsed;
    console.log("[INFO] Using colors from colors_output.json:", customColors);
  } else {
    console.log(
      "[WARN] colors_output.json has invalid format. Using defaults."
    );
  }
} catch (err) {
  console.log("[WARN] Could not read colors_output.json. Using defaults.", err);
}

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        rye: ["Rye", "cursive"],
        'ultra-condensed': ['Arial Narrow', 'Arial', 'sans-serif'],
      },
      colors: {
        // Use CSS variables for dynamic theming, with fallbacks to the JSON-loaded values
        accent: `var(--color-accent, ${customColors.accent})`,
        banner: `var(--color-banner, ${customColors.banner})`,
        "second-accent": `var(--color-second-accent, ${customColors["second-accent"]})`,
        "faint-color": `var(--color-faint-color, ${customColors["faint-color"]})`,
        // Add utility colors
        blue: {
          DEFAULT: "#2997FF",
          light: "#E0F7FA",
          dark: "#1A2F4D",
        },
        gray: {
          DEFAULT: "#86868b",
          100: "#94928d",
          200: "#afafaf",
          300: "#42424570",
        },
        "custom-blue": "#007BFF",
        "custom-gray": "#F8F9FA",
        "brand-charcoal": "#333333",
        "brand-red": "#FF0000",
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3), 0 0 60px rgba(59, 130, 246, 0.1)' 
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.8), 0 0 60px rgba(59, 130, 246, 0.5), 0 0 90px rgba(59, 130, 246, 0.3)' 
          },
        },
      },
    },
  },
  plugins: [],
};
