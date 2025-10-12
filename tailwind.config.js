/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#4F46E5',
        'brand-secondary': '#7C3AED',
        'brand-light': '#A5B4FC',
        'neutral-900': '#111827',
        'neutral-800': '#1F2937',
        'neutral-700': '#374151',
        'neutral-200': '#E5E7EB',
        'neutral-100': '#F3F4F6',
      }
    }
  },
  plugins: [],
}
