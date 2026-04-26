/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'safe-dark': '#0f172a',
        'safe-sidebar': '#1a2332',
        'safe-blue': '#3b82f6',
        'safe-blue-light': '#60a5fa',
        'safe-blue-btn': '#3b7fff',
        'safe-gray': '#1e293b',
        'safe-gray-light': '#334155',
        'safe-bg': '#f5f7fa',
        'safe-white': '#ffffff',
        'safe-text-dark': '#1f2937',
        'safe-text-gray': '#6b7280',
        'safe-accent': '#f59e0b',
        'safe-orange': '#f97316',
        'safe-danger': '#ef4444',
        'safe-red-icon': '#dc2626',
        'safe-success': '#10b981',
        'safe-green': '#22c55e',
        'safe-info': '#0ea5e9',
        'safe-border': '#e5e7eb',
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0,0,0,0.25)',
        'sm': '0 1px 3px 0 rgba(0,0,0,0.1)',
      },
      borderRadius: {
        'xl': '1rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
