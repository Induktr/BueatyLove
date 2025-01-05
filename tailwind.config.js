/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "./src/styles/**/*.css",
    "./index.html",
  ],
  darkMode: 'class', // Ensures dark mode is controlled by the 'dark' class
  theme: {
    extend: {
      colors: {
        primary: {
          lightBrown: '#D4B8A0',
          mediumBrown: '#B69B85',
          darkBrown: '#8C715F',
        },
        background: {
          light: '#FFFFFF',
          dark: '#1A1A1A',
          cream: '#F8F5F2',
        },
        text: {
          onLight: '#2D2D2D',
          onDark: '#F5F5F5',
          muted: '#6B6B6B',
        },
        border: {
          light: 'rgba(229, 231, 235, 0.5)',
          dark: 'rgba(75, 85, 99, 0.5)',
        },
        overlay: {
          light: 'rgba(255, 255, 255, 0.1)',
          dark: 'rgba(0, 0, 0, 0.1)',
        },
      },
      fontFamily: {
        'primary': ['Montserrat', 'sans-serif'],
        'secondary': ['Playfair Display', 'serif'],
      },
      container: {
        center: true,
        padding: '1rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
