/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primaryPurple: '#7C3AED',
        darkPurple: '#5B21B6',
        accentCyan: '#06B6D4',
        lightCyan: '#0891B2',
        darkBg: '#F3F4F7',
        cardBg: '#FFFFFF',
        borderColor: '#D5D8E1',
        textPrimary: '#2E3038',
        textSecondary: '#666B76',
      },
    },
  },
  plugins: [],
}
