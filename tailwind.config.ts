import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rust: "#D55D27",
        yellow: "#FFFE00",
        ink: "#1C1B1A",
        olive: "#45471D",
        sand: "#D1B788",
        cream: "#FFFBF5",
        admin: "#F9F7F4",
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        display: "0.06em",
        wide: "0.12em",
      },
      fontWeight: {
        display: "800",
      },
    },
  },
  plugins: [],
};
export default config;
