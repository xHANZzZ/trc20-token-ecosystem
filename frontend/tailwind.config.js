/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0B0F19', // Deep Obsidian Base Background
        slateCard: '#161B26', // Dark Slate Surface/Card Fill
        tealAccent: '#00F5D4', // Electric Teal Primary/Accent
        crimsonRed: '#FF3B30', // Crimson Red Destructive
        pureWhite: '#FFFFFF',  // Pure White Text
        mutedGray: '#94A3B8',  // Muted Gray Text Secondary
        spaceBorder: 'rgba(255, 255, 255, 0.05)'
      },
      boxShadow: {
        'teal-glow': '0 0 20px rgba(0, 245, 212, 0.25)',
        'red-glow': '0 0 20px rgba(255, 59, 48, 0.25)'
      }
    }
  },
  plugins: []
}
