/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: { luna: { bg: "#fffafc", tint: "#f6e7f1", ink: "#1f1f1f" } },
      borderRadius: { xl2: "1.25rem" }
    },
  },
  plugins: [],
}
