/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Share Tech', 'sans-serif'], //set default font to Share Tech
      },
    },
  },
  plugins: [],
}