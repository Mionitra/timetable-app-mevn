/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx,vue}",
  ],
  theme: {
    extend: {
      colors: {
        'gt-bg': '#0b0f19', // The darkest background
        'gt-card': '#13182b', // Card background
        'gt-blue': '#2563eb', // Primary neon blue
        'gt-blue-glow': 'rgba(37, 99, 235, 0.5)',
        'gt-gray': '#1e243b', // Subtle borders/secondary elements
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}