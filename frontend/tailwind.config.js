/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx,vue}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#0D737D',
        'secondary': '#01173F',
        'background': '#FFFFFF',
        'gt-bg': '#0b0f19',
        'gt-card': '#13182b',
        'gt-blue': '#2563eb',
        'gt-blue-glow': 'rgba(37, 99, 235, 0.5)',
        'gt-gray': '#1e243b',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}