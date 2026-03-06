import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
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
          green: "#0d4d2b",
          greenDark: "#083d22",
          navy: "#1e3a5f",
          navyDark: "#152a45",
        },
        felt: {
          DEFAULT: "#0d4d2b",
          light: "#166534",
          dark: "#083d22",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
