import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FBF7EE",
        ink: "#0B1F3A",
        navy: "#0F2A4F",
        navySoft: "#1B3B6B",
        editable: "#1D4ED8",
        senior: {
          50: "#E8F0FE",
          100: "#C7DBFE",
          300: "#7AA8F0",
          500: "#3B6FD1",
          700: "#1F4DAA",
          900: "#0F2A6B",
        },
        junior: {
          50: "#FFF1E6",
          100: "#FFDDBF",
          300: "#FFB077",
          500: "#F08035",
          700: "#C25F1A",
          900: "#7A3A0E",
        },
        equity: {
          50: "#E9F8EF",
          100: "#C5ECD3",
          300: "#7FD09F",
          500: "#3DAA66",
          700: "#1F7F44",
          900: "#0E4D28",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
