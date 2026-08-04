import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F6F7F4",
        surface: "#FFFFFF",
        surface2: "#EEF1EC",
        ink: "#1B2420",
        inksoft: "#5B655F",
        inkfaint: "#8C948C",
        line: "#DEE4DD",
        teal: "#2C6E68",
        tealsoft: "#E4EEEC",
        ochre: "#B8823C",
        ochresoft: "#F3E9D6",
        coral: "#C1554C",
        coralsoft: "#F6E4E2",
        green: "#4C8768",
        greensoft: "#E5EFE7",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plexmono)", "monospace"],
      },
      borderRadius: { xl2: "18px" },
      boxShadow: {
        soft: "0 1px 2px rgba(27,36,32,0.04), 0 8px 24px -12px rgba(27,36,32,0.10)",
      },
    },
  },
  plugins: [],
};
export default config;
