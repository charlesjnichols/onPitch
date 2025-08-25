/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Enhanced dark theme colors
        surface: {
          100: '#0a0a0a',
          200: '#171717', 
          300: '#262626',
          400: '#404040',
        },
        text: {
          primary: '#f5f5f5',
          secondary: '#a3a3a3',
          tertiary: '#737373',
        },
        field: {
          dark: '#064e3b',
          light: '#065f46',
          lines: '#10b981',
        },
        // Semantic colors
        success: '#22c55e',
        warning: '#f59e0b', 
        error: '#ef4444',
        info: '#3b82f6',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 1s infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-lg': '0 0 30px rgba(16, 185, 129, 0.4)',
      },
    },
  },
  plugins: [],
}
