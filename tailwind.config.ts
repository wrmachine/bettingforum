import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    borderRadius: {
      none: "0",
      sm: "0",
      DEFAULT: "0",
      md: "0",
      lg: "0",
      xl: "0",
      "2xl": "0",
      "3xl": "0",
      full: "0",
    },
    extend: {
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
      maxWidth: {
        "1280": "1280px",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
          },
        },
      },
      colors: {
        accent: {
          DEFAULT: "#ff6154",
          hover: "#e54d42",
          light: "#ff7a6f",
          muted: "#ff615420",
        },
        header: {
          green: "#1b9c43",
          greenDark: "#158a3a",
          navy: "#0e2236",
          navyDark: "#0a1928",
        },
        felt: {
          DEFAULT: "#0d4d2b",
          light: "#166534",
          dark: "#083d22",
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
