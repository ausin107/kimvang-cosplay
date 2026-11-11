import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        offwhite: "#FAFAFA",
        charcoal: "#18181B",
        muted: "#71717A",
        hairline: "#E4E4E7",
        gold: {
          DEFAULT: "#C5A059",
          light: "#FBF7EF",
          dark: "#9E7B36",
        },
        jet: "#09090B",
        rent: {
          bg: "#EEF2FF",
          text: "#4338CA",
          border: "#C7D2FE",
        },
        buy: {
          bg: "#ECFDF5",
          text: "#047857",
          border: "#A7F3D0",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        "8xl": "1440px",
      },
    },
  },
  plugins: [],
};
export default config;
