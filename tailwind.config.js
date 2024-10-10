/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      rotate: {
        'y-6': '2deg',
      },
      scale: {
        '105': '1.05',
        '110': '1.10',
      },
    },
  },
  plugins: [],
}
