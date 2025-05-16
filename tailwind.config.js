/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        blob: "blob 7s infinite",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(-50%, -50%) scale(1)",
          },
          "33%": {
            transform: "translate(-50%, -50%) scale(1.1)",
          },
          "66%": {
            transform: "translate(-50%, -50%) scale(0.9)",
          },
          "100%": {
            transform: "translate(-50%, -50%) scale(1)",
          },
        },
      },
    },
  },
  plugins: [],
}