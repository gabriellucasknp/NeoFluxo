/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Tipografia das refs: Urbanist nos títulos e números, Manrope no texto
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Urbanist', 'Manrope', 'system-ui', 'sans-serif'],
      },
      // Cores por papel (valores em src/styles/tokens.css, trocam no claro/escuro)
      colors: {
        'canvas': 'rgb(var(--canvas) / <alpha-value>)',
        'surface': 'rgb(var(--surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
        'surface-3': 'rgb(var(--surface-3) / <alpha-value>)',
        'raised': 'rgb(var(--raised) / <alpha-value>)',
        'fg': 'rgb(var(--fg) / <alpha-value>)',
        'fg-2': 'rgb(var(--fg-2) / <alpha-value>)',
        'muted': 'rgb(var(--muted) / <alpha-value>)',
        'subtle': 'rgb(var(--subtle) / <alpha-value>)',
        'line': 'rgb(var(--line) / <alpha-value>)',
        'line-strong': 'rgb(var(--line-strong) / <alpha-value>)',
        'on-primary': 'rgb(var(--on-primary) / <alpha-value>)',
        'on-accent': 'rgb(var(--on-accent) / <alpha-value>)',
        'focus': 'rgb(var(--focus) / <alpha-value>)',
        'panel': 'rgb(var(--panel) / <alpha-value>)',
        'on-panel': 'rgb(var(--on-panel) / <alpha-value>)',
        'highlight': 'rgb(var(--highlight) / <alpha-value>)',
        'on-highlight': 'rgb(var(--on-highlight) / <alpha-value>)',
        'nav': 'rgb(var(--nav) / <alpha-value>)',
        'on-nav': 'rgb(var(--on-nav) / <alpha-value>)',
        'chart-1': 'rgb(var(--chart-1) / <alpha-value>)',
        'chart-2': 'rgb(var(--chart-2) / <alpha-value>)',
        'chart-3': 'rgb(var(--chart-3) / <alpha-value>)',
        'chart-rest': 'rgb(var(--chart-rest) / <alpha-value>)',
        'chart-grid': 'rgb(var(--chart-grid) / <alpha-value>)',
        primary: { DEFAULT: 'rgb(var(--primary) / <alpha-value>)', hover: 'rgb(var(--primary-hover) / <alpha-value>)' },
        accent: { DEFAULT: 'rgb(var(--accent) / <alpha-value>)', soft: 'rgb(var(--accent-soft) / <alpha-value>)', fg: 'rgb(var(--accent-fg) / <alpha-value>)' },
        success: { DEFAULT: 'rgb(var(--success) / <alpha-value>)', soft: 'rgb(var(--success-soft) / <alpha-value>)', fg: 'rgb(var(--success-fg) / <alpha-value>)' },
        warning: { DEFAULT: 'rgb(var(--warning) / <alpha-value>)', soft: 'rgb(var(--warning-soft) / <alpha-value>)', fg: 'rgb(var(--warning-fg) / <alpha-value>)' },
        danger: { DEFAULT: 'rgb(var(--danger) / <alpha-value>)', soft: 'rgb(var(--danger-soft) / <alpha-value>)', fg: 'rgb(var(--danger-fg) / <alpha-value>)' },
        info: { DEFAULT: 'rgb(var(--info) / <alpha-value>)', soft: 'rgb(var(--info-soft) / <alpha-value>)', fg: 'rgb(var(--info-fg) / <alpha-value>)' },
      },
      borderRadius: {
        control: '14px', // input, tile interno (linha Apple das refs 1, 2, 11)
        tile: '20px', // bloco dentro de card, linha de tabela
        card: '28px', // card, painel, modal
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'card-hover': '0 4px 12px -2px rgb(0 0 0 / 0.08), 0 2px 6px -2px rgb(0 0 0 / 0.05)',
        // linha selecionada que salta da tabela (ref 13)
        glow: '0 14px 32px -10px rgb(var(--primary) / 0.55)',
        pop: '0 24px 60px -20px rgb(0 0 0 / 0.35)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(8px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in': 'slide-in 0.2s ease-out',
        'scale-in': 'scale-in 0.15s ease-out',
        'pulse-soft': 'pulse-soft 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
