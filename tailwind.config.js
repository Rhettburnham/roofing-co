/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "faint-color": "#E0F7FA",
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
    function ({ addUtilities }) {
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
    },
  ],
};
