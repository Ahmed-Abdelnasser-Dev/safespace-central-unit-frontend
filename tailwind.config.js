/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'safe-dark': '#0a1119',
        'safe-sidebar': '#121820',
        'safe-blue': '#3b7cff',
        'safe-blue-light': '#5a96ff',
        'safe-blue-btn': '#2563eb',
        'safe-gray': '#1a1f2e',
        'safe-gray-light': '#2a3142',
        'safe-bg': '#f0f4f8',
        'safe-white': '#ffffff',
        'safe-text-dark': '#0f1419',
        'safe-text-gray': '#64748b',
        'safe-text-muted': '#8b99b5',
        'safe-accent': '#ff6b35',
        'safe-orange': '#fb923c',
        'safe-danger': '#ef4444',
        'safe-red-icon': '#dc2626',
        'safe-success': '#10b981',
        'safe-green': '#22c55e',
        'safe-info': '#0ea5e9',
        'safe-border': '#e2e8f0',
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
