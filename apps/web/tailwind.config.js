/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: '#f3efe6', 50: '#faf8f3', 100: '#f3efe6', 200: '#e6dfd0' },
        ink: {
          50: '#f5f3ee',
          100: '#e7e2d8',
          200: '#cfc6b6',
          300: '#b0a48f',
          400: '#8a7f6c',
          500: '#6c6253',
          600: '#4d463c',
          700: '#342f29',
          800: '#221f1b',
          900: '#161411',
          950: '#0e0c0a',
        },
        forest: {
          50: '#eef4f1',
          100: '#d5e4dc',
          200: '#a9c8b8',
          400: '#4d8a72',
          500: '#2f6754',
          600: '#1f4a3c',
          700: '#17382e',
          800: '#122c24',
        },
      },
      fontFamily: {
        sans: ['"Figtree"', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(22,20,17,0.04), 0 12px 28px rgba(22,20,17,0.06)',
      },
    },
  },
  plugins: [],
};
