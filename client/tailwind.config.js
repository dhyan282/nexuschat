/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1',
        secondary: '#8B5CF6',
        bg: '#0B0F19',
        sidebar: '#111827',
        card: '#171F2E',
        muted: '#94A3B8',
      },
    },
  },
  plugins: [],
};
