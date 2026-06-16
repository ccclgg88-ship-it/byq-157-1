/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          pink: '#FFB6C1',
          blue: '#B0E0E6',
          yellow: '#FFFACD',
          purple: '#E6E6FA',
          green: '#98FB98',
          peach: '#FFDAB9',
          cream: '#FFFDD0',
        },
      },
      fontFamily: {
        cute: ['"Comic Sans MS"', 'cursive', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '3rem',
      },
      boxShadow: {
        'soft': '0 8px 32px rgba(0, 0, 0, 0.08)',
        'cute': '0 4px 16px rgba(255, 182, 193, 0.3)',
      },
    },
  },
  plugins: [],
}
