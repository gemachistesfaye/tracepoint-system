module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#E8F5E9",
          100: "#C8E6C9",
          200: "#A5D6A7",
          300: "#81C784",
          400: "#66BB6A",
          500: "#2E7D32",
          600: "#2E7D32",
          700: "#1B5E20",
          800: "#145214",
          900: "#0D3B0D",
        },
        accent: {
          50: "#E8F5E9",
          100: "#C8E6C9",
          200: "#A5D6A7",
          300: "#81C784",
          400: "#66BB6A",
          500: "#43A047",
          600: "#388E3C",
          700: "#2E7D32",
        },
        hu: {
          green: "#2E7D32",
          light: "#E8F5E9",
          dark: "#1B5E20",
        },
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card-hover": "0 10px 25px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
      },
    },
  },
  plugins: [],
};
