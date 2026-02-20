/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        persian: ['Vazirmatn', 'system-ui', 'sans-serif'],
      },
      colors: {
        /* Persian monochromatic: warm terracotta/clay from cream to deep earth */
        mono: {
          50: '#faf8f6',
          100: '#f3efe9',
          200: '#e6dfd5',
          300: '#d2c4b5',
          400: '#b8a088',
          500: '#9a7b5c',
          600: '#7d6249',
          700: '#5c4a38',
          800: '#3d3228',
          900: '#2a221c',
        },
        /* Keep primary for branding/CTAs – same hue, used sparingly */
        primary: {
          50: '#faf8f6',
          100: '#f3efe9',
          200: '#e6dfd5',
          300: '#d2c4b5',
          400: '#b8a088',
          500: '#9a7b5c',
          600: '#7d6249',
          700: '#5c4a38',
          800: '#3d3228',
          900: '#2a221c',
        },
        secondary: {
          500: '#7d6249',
          600: '#5c4a38',
        },
        persian: {
          gold: '#9a7b5c',
          saffron: '#b8a088',
          turquoise: '#7d6249',
          teal: '#5c4a38',
          terracotta: '#9a7b5c',
          navy: '#2a221c',
        },
      },
      boxShadow: {
        'soft': '0 2px 20px -4px rgba(42, 34, 28, 0.08)',
        'soft-lg': '0 8px 32px -8px rgba(42, 34, 28, 0.12)',
      },
    },
  },
  plugins: [],
}