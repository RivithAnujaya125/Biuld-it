/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#09090b',
        surface: '#18181b',
        surfaceMuted: '#141417',
        border: '#27272a',
        accent: '#00f0ff',
        textPrimary: '#fafafa',
        textMuted: '#a1a1aa',
        textFaint: '#717680',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
