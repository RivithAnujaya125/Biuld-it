/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  safelist: [
    // Figma Make homepage uses v4-style dash tokens; keep them when
    // Tailwind v3 purges so the homepage never renders unstyled.
    { pattern: /^(bg|text|border)-(background|foreground|surface|surface-muted|accent|text-dim|text-faint|border)$/ },
    { pattern: /^bg-accent\/(10|25)$/ },
    { pattern: /^border-accent\/(10|25|50)$/ },
    { pattern: /^text-textFaint\/30$/ },
    { pattern: /^bg-background\/(60|95)$/ },
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
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
        // shadcn tokens mapped to existing palette
        background: '#09090b',
        foreground: '#fafafa',
        // Figma Make dash-token aliases (same values as camelCase above)
        // so classes like bg-surface-muted / text-text-dim resolve in v3.
        'surface-muted': '#141417',
        'text-dim': '#a1a1aa',
        'text-faint': '#717680',
        card: '#18181b',
        'card-foreground': '#fafafa',
        popover: '#18181b',
        'popover-foreground': '#fafafa',
        primary: '#00f0ff',
        'primary-foreground': '#09090b',
        secondary: '#27272a',
        'secondary-foreground': '#fafafa',
        muted: '#141417',
        'muted-foreground': '#a1a1aa',
        destructive: '#ef4444',
        'destructive-foreground': '#fafafa',
        input: '#27272a',
        ring: '#00f0ff',
        chart: {
          1: '#00f0ff',
          2: '#a1a1aa',
          3: '#717680',
          4: '#fafafa',
          5: '#27272a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        lg: '0.625rem',
        md: '0.5rem',
        sm: '0.375rem',
        xl: '0.75rem',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
