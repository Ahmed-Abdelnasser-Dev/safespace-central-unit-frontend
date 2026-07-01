/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Theme-adaptive surfaces — values defined as CSS vars in index.css
        'safe-dark':       'rgb(var(--color-safe-dark) / <alpha-value>)',
        'safe-sidebar':    'rgb(var(--color-safe-sidebar) / <alpha-value>)',
        'safe-gray':       'rgb(var(--color-safe-gray) / <alpha-value>)',
        'safe-gray-light': 'rgb(var(--color-safe-gray-light) / <alpha-value>)',
        // Theme-adaptive text
        'safe-text-primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
        'safe-text-muted':   'rgb(var(--color-text-muted) / <alpha-value>)',

        'safe-blue': '#3b7cff',
        'safe-blue-light': '#5a96ff',
        'safe-blue-btn': '#2563eb',
        // Legacy tokens — now adaptive (backed by same CSS vars as primary tokens)
        'safe-bg':        'rgb(var(--color-safe-dark) / <alpha-value>)',
        'safe-white':     'rgb(var(--color-safe-sidebar) / <alpha-value>)',
        'safe-text-dark': 'rgb(var(--color-text-primary) / <alpha-value>)',
        'safe-text-gray': 'rgb(var(--color-text-muted) / <alpha-value>)',
        'safe-border':    'rgb(var(--color-safe-gray-light) / <alpha-value>)',

        'safe-accent': '#ff6b35',
        'safe-orange': '#fb923c',
        'safe-danger': '#ef4444',
        'safe-red-icon': '#dc2626',
        'safe-success': '#10b981',
        'safe-green': '#22c55e',
        'safe-info': '#0ea5e9',
        'safe-purple': '#8b5cf6',
        'safe-teal': '#14b8a6',
      },
      boxShadow: {
        'card': '0 8px 24px -2px rgba(0,0,0,0.08)',
        'sm': '0 1px 2px 0 rgba(0,0,0,0.05)',
        'lg': '0 12px 32px -4px rgba(0,0,0,0.12)',
        'xl': '0 16px 40px -4px rgba(0,0,0,0.15)',
      },
      borderRadius: {
        'xl': '1rem',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'Avenir', 'sans-serif'],
        display: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
