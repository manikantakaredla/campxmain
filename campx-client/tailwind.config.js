/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fitbit: {
          primary: '#14B8A6',
          secondary: '#0F766E',
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          text: '#0F172A',
          muted: '#64748B',
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#EF4444'
        },
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
        blue: {
          50: '#eef2f9',
          100: '#d4e1f1',
          200: '#adc4e5',
          300: '#7ba2d5',
          400: '#4d7dc2',
          500: '#2b5ea9',
          600: '#204a8c',
          700: '#1b3c73',
          800: '#163269', // Aditya Blue
          900: '#142a55',
          950: '#0c1a36',
        },
        orange: {
          50: '#fef7f3',
          100: '#fdede1',
          200: '#fad6be',
          300: '#f7ba93',
          400: '#f3955d',
          500: '#f26522', // Aditya Orange
          600: '#e34e12',
          700: '#be3a0f',
          800: '#972e12',
          900: '#7a2712',
          950: '#421107',
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      }
    },
  },
  plugins: [],
}