/** @type {import('tailwindcss').Config} */

const fs = require("fs");
const path = require("path");

// Attempt to read your color_extractor output JSON:
let customColors = {
  "faint-color": "#E0F7FA",
  "hover-color": "#434358",
  "dark-below-header": "#6a0202",
}; // defaults

const jsonPath = path.join(__dirname, "public", "data", "colors_output.json");
try {
  const raw = fs.readFileSync(jsonPath, "utf-8");
  const parsed = JSON.parse(raw);
  // Expecting an object with keys "faint-color", "hover-color", "dark-below-header"
  if (
    typeof parsed === "object" &&
    parsed["faint-color"] &&
    parsed["hover-color"] &&
    parsed["dark-below-header"]
  ) {
    customColors = parsed;
    console.log("[INFO] Using colors from colors_output.json:", customColors);
  } else {
    console.log(
      "[WARN] colors_output.json missing required keys. Using defaults."
    );
  }
} catch (err) {
  console.log("[WARN] Could not read colors_output.json. Using defaults.", err);
}

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        rye: ["Rye", "serif"],
      },
      colors: {
        // Just use the 3 custom keys from the JSON
        ...customColors,
        blue: "#2997FF",
        gray: {
          DEFAULT: "#86868b",
          100: "#94928d",
          200: "#afafaf",
          300: "#42424570",
        },
        zinc: "#101010",
      },
    },
  },
  plugins: [
    function ({ addUtilities, theme }) {
      // Existing Utilities
      addUtilities({
        ".clip-bottom-triangle": {
          "clip-path":
            "polygon(0 0, 100% 0, 100% calc(100% - var(--triangle-height)), 50% 100%, 0 calc(100% - var(--triangle-height)))",
        },
        ".triangle-height-sm": {
          "--triangle-height": "30px",
        },
        ".md\\:triangle-height-md": {
          "@screen md": {
            "--triangle-height": "50px",
          },
        },
        ".lg\\:triangle-height-lg": {
          "@screen lg": {
            "--triangle-height": "70px",
          },
        },
      });

      // Custom Font Stretch Utilities
      addUtilities(
        {
          ".font-ultra-condensed": { "font-stretch": "ultra-condensed" },
          ".font-extra-condensed": { "font-stretch": "extra-condensed" },
          ".font-condensed": { "font-stretch": "condensed" },
          ".font-semi-condensed": { "font-stretch": "semi-condensed" },
          ".font-normal-stretch": { "font-stretch": "normal" },
          ".font-semi-expanded": { "font-stretch": "semi-expanded" },
          ".font-expanded": { "font-stretch": "expanded" },
          ".font-extra-expanded": { "font-stretch": "extra-expanded" },
          ".font-ultra-expanded": { "font-stretch": "ultra-expanded" },
        },
        { variants: ["responsive"] }
      );
    },
  ],
};
