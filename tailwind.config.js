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
        primary: '#3B82F6',
        secondary: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        text: '#1F2937',
        background: '#F9FAFB',
      },
    },
  },
  plugins: [],
};
