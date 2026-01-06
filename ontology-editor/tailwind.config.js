/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Salesforce-inspired colors
        'sf-blue': {
          50: '#e8f4fc',
          100: '#c5e4f7',
          200: '#9ed3f2',
          300: '#77c1ed',
          400: '#59b3e9',
          500: '#0176d3',
          600: '#0164b8',
          700: '#01519a',
          800: '#013d7c',
          900: '#002a5e',
        },
        'sf-navy': {
          50: '#e6eef5',
          100: '#b3c9de',
          200: '#80a4c7',
          300: '#4d7fb0',
          400: '#1a5a99',
          500: '#032d60',
          600: '#022652',
          700: '#021f44',
          800: '#011836',
          900: '#011128',
        },
        // Palantir-inspired neutrals
        'ontology': {
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
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['SF Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
