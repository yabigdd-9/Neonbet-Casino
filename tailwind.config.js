/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        neon: "0 0 25px rgba(34, 211, 238, 0.45)",
        gold: "0 0 25px rgba(245, 158, 11, 0.35)"
      }
    },
  },
  plugins: [],
};
