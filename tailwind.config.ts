import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Reddit 2024 Light Theme Colors
        canvas: "#DAE0E6", // Page background
        card: "#FFFFFF",   // Card background
        ink: "#1A1A1B",    // Primary text
        subink: "#576F76", // Secondary text
        line: "#CCCCCC",   // Borders
        accent: "#D93A00", // Reddit Orange
        sidebar: "#FFFFFF",
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'Arial', 'sans-serif'], // Reddit font stack approximation
        serif: ['"Noto Serif SC"', 'serif'], // Keep serif for content if desired, or switch to sans for Reddit feel
      },
    },
  },
  plugins: [],
};
export default config;