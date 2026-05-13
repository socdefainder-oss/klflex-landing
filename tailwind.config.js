/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html'],
  theme: {
    extend: {
      colors: {
        gold: {
          imperial: '#C88B1D',
          medium: '#B97714',
          dark: '#8D5A0A',
          champagne: '#D9A441',
          sand: '#E6C27A',
          bronze: '#5C3A09',
        },
        ice: '#F5F7F8',
        snow: '#E9ECEF',
        stone: {
          900: '#1c1917', 800: '#292524', 700: '#44403c',
          500: '#78716c', 400: '#a8a29e', 300: '#d6d3d1',
          200: '#e7e5e4', 100: '#f5f5f4', 50: '#fafaf9',
        }
      }
    }
  },
  plugins: [],
}
