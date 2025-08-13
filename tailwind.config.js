/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdedd3', 
          200: '#fbd7a5',
          300: '#f8ba6d',
          400: '#f59333',
          500: '#f37516',
          600: '#e4590c',
          700: '#bc420c',
          800: '#953411',
          900: '#782d12',
        },
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0', 
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    // ここがエラーの原因だった！async/awaitを削除
    require('@tailwindcss/forms'),
  ],
}