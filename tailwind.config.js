/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#f8fafc',
          DEFAULT: '#0f172a',
          primary: '#10b981',
          danger: '#f43f5e',
        }
      }
    },
  },
  plugins: [],
}