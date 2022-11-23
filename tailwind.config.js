const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    container: {
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px"
      },
      padding: {
        md: "1rem",
        lg: "1rem",
        xl: "1rem"
      }
    },
    colors: {
      transparent: "transparent",
      black: "#000",
      white: "#fff",
      red: {
        50: "#fef2f2",
        100: "#fee2e2",
        200: "#fecaca",
        300: "#fca5a5",
        400: "#f87171",
        500: "#ef4444",
        600: "#dc2626",
        700: "#b91c1c",
        800: "#991b1b",
        900: "#7f1d1d"
      },
      green: {
        50: "#f0fdf4",
        100: "#dcfce7",
        200: "#bbf7d0",
        300: "#86efac",
        400: "#4ade80",
        500: "#22c55e",
        600: "#16a34a",
        700: "#15803d",
        800: "#166534",
        900: "#14532d"
      },
      blue: {
        50: "#eff6ff",
        100: "#dbeafe",
        200: "#bfdbfe",
        300: "#93c5fd",
        400: "#60a5fa",
        500: "#3b82f6",
        600: "#2563eb",
        700: "#1d4ed8",
        800: "#1e40af",
        900: "#1e3a8a"
      },
      yellow: colors.yellow,
      gray: colors.gray,
      vgrey: {
        "100": "#FBF9F9",
        "200": "#F2F2F2",
        "300": "#E7E7E7",
        "400": "#D4D4D4",
        "500": "#C1C1C1",
        "600": "#999999",
        "700": "#6C6C6C",
        "800": "#4F4F4F",
        "900": "#333333"
      },
      aspire: "#ad1f29",
      vcarvePro: "#1f4586",
      vcarveDesktop: "#64a5d4",
      cut2dPro: "#056938",
      cut2dDesktop: "#6fc278",
      laserModule: "#e94e1e",
      vcarveShopbot: "#6e4399",
      cut2d: "#6fc278"
    },
    extend: {
      fontFamily: {
        sans: ["Raleway", ...defaultTheme.fontFamily.sans],
        lato: ["Lato", ...defaultTheme.fontFamily.sans]
      },
      keyframes: {
        "fade-in-down": {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        }
      },
      animation: {
        "fade-in-down": "fade-in-down 0.5s ease-out"
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
};
