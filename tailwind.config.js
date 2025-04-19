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

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        rye: ["Rye", "serif"],
      },
      colors: {
        // Use our website's color scheme
        accent: customColors.accent,
        banner: customColors.banner,
        "second-accent": customColors["second-accent"],
        "faint-color": customColors["faint-color"],
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
