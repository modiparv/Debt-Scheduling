import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#2B2B2B",
        graphite: "#333333",
        mid: "#757575",
        muted: "#8C8C8C",
        silver: "#E0E0E0",
        platinum: "#F5F5F5",
        champagne: "#D4AF37",
        champagneSoft: "#BFA76E",
        champagneDeep: "#B89A3C",
        charcoal: "#1A1A1A",
        carbon: "#121212",
        // Seniority chart palette: senior = navy/slate, junior = champagne,
        // preferred = aubergine, equity = ink.
        senior: {
          50: "#F1F3F8",
          100: "#D9DEE9",
          300: "#8A95B0",
          500: "#3F4F7A",
          700: "#1F2A4A",
          900: "#0E142B",
        },
        junior: {
          50: "#FBF6E7",
          100: "#F0E5BD",
          300: "#D4B964",
          500: "#B89A3C",
          700: "#8C6F1F",
          900: "#5C470F",
        },
        equity: {
          50: "#EFEFEF",
          100: "#CFCFCF",
          300: "#8C8C8C",
          500: "#404040",
          700: "#1A1A1A",
          900: "#000000",
        },
        preferred: {
          500: "#5E3A6B",
          700: "#412750",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
        card: "0 1px 2px rgba(0,0,0,0.03), 0 8px 24px rgba(0,0,0,0.05)",
      },
      letterSpacing: {
        tightish: "-0.011em",
        wider2: "0.14em",
      },
    },
  },
  plugins: [],
};

export default config;
