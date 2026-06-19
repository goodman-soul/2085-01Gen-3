/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        navy: {
          900: '#0F2B4A',
          800: '#1E3A5F',
          700: '#2D4A75',
        },
        primary: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
        },
        warning: {
          DEFAULT: '#F59E0B',
          bg: '#FEF3C7',
        },
        danger: {
          DEFAULT: '#EF4444',
          bg: '#FEE2E2',
        },
        success: {
          DEFAULT: '#10B981',
          bg: '#D1FAE5',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fadeIn': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'card-dark': '0 4px 20px rgba(15, 43, 74, 0.15)',
        'warning-pulse': '0 0 0 4px rgba(245, 158, 11, 0.2)',
      },
    },
  },
  plugins: [],
};
