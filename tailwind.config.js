/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Chinese Chess theme colors
        chess: {
          'board-light': '#F0D9B5',
          'board-dark': '#B58863',
          'red': '#C00',
          'black': '#111',
        },
      },
      spacing: {
        // Board grid spacing (will be calculated dynamically)
        'board-cell': 'clamp(30px, 8vmin, 60px)',
      },
      aspectRatio: {
        'board': '8 / 10',
      },
    },
  },
  plugins: [],
}
