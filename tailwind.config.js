/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        rye: ["Rye", "serif"],
      },
      
      colors: {
        "faint-color": "#E0F7FA",
        "hover-color": "#434358",
        "dark-below-header": "#6a0202",
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
      addUtilities({
        // Ultra Condensed
        ".font-ultra-condensed": {
          "font-stretch": "ultra-condensed",
        },
        // Extra Condensed
        ".font-extra-condensed": {
          "font-stretch": "extra-condensed",
        },
        // Condensed
        ".font-condensed": {
          "font-stretch": "condensed",
        },
        // Semi Condensed
        ".font-semi-condensed": {
          "font-stretch": "semi-condensed",
        },
        // Normal
        ".font-normal-stretch": {
          "font-stretch": "normal",
        },
        // Semi Expanded
        ".font-semi-expanded": {
          "font-stretch": "semi-expanded",
        },
        // Expanded
        ".font-expanded": {
          "font-stretch": "expanded",
        },
        // Extra Expanded
        ".font-extra-expanded": {
          "font-stretch": "extra-expanded",
        },
        // Ultra Expanded
        ".font-ultra-expanded": {
          "font-stretch": "ultra-expanded",
        },
      }, {
        // Specify the variants you want to generate (responsive, hover, etc.)
        variants: ['responsive'],
      });
    },
  ],
};
