import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4fb",
          100: "#dce8f6",
          200: "#c0d6ee",
          300: "#96b8df",
          400: "#628fca",
          500: "#3268ad",
          600: "#1f4d8f",
          700: "#183d71",
          800: "#17345d",
          900: "#162b49",
        },
        accent: {
          50: "#fcf8ef",
          100: "#f7eed7",
          200: "#f0dead",
          300: "#e5c67a",
          400: "#d4a64d",
          500: "#bc842f",
          600: "#9f6824",
          700: "#814f20",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
