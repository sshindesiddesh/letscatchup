/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        time: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
        },
        location: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        food: {
          50: '#fff7ed',
          500: '#f97316',
          600: '#ea580c',
        },
        activity: {
          50: '#faf5ff',
          500: '#a855f7',
          600: '#9333ea',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounce 2s infinite',
      },
    },
  },
  plugins: [],
}
