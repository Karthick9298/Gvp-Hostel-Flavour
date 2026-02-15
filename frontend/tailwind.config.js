/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark Navy Blue Theme
        navy: {
          50: '#e8eaf6',
          100: '#c3cde0',
          200: '#9dacc9',
          300: '#778bb2',
          400: '#5170a0',
          500: '#2b558f',
          600: '#1e3a5f',
          700: '#162d4a',
          800: '#0f2036',
          900: '#0a1628',
          950: '#050b14',
        },
        primary: {
          50: '#e8f4ff',
          100: '#c7e2ff',
          200: '#90c9ff',
          300: '#5aabff',
          400: '#3d8eff',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e3a8a',
          800: '#1e2f5f',
          900: '#172554',
        },
        accent: {
          50: '#fef3e2',
          100: '#fde2b5',
          200: '#fcd085',
          300: '#fbbf54',
          400: '#fab12f',
          500: '#f59e0b',
          600: '#e88c0a',
          700: '#d47508',
          800: '#c05f07',
          900: '#9f3c04',
        },
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-fast': 'bounceFast 0.6s infinite', // faster speed
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animationDelay: {
        '200': '200ms',
        '400': '400ms',
      },
      keyframes: {
        bounceFast: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-18px)', // increase vertical height
          },
        },
      },
    },
  },
  plugins: [],
}
