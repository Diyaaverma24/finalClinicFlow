/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "#09090b", // zinc-950
        surface: "#18181b", // zinc-900
        surfaceHover: "#27272a", // zinc-800
        border: "#27272a",
        foreground: "#fafafa",
        muted: "#a1a1aa", // zinc-400
        
        // Lilac / Lavender accent
        brand: {
          50: "#faf5ff",
          100: "#f3e8ff",
          500: "#a855f7",
          600: "#9333ea",
          900: "#581c87",
          DEFAULT: "#a855f7",
        },
        // Semantic
        success: {
          DEFAULT: "#14b8a6", // teal-500
          bg: "rgba(20, 184, 166, 0.1)",
          text: "#2dd4bf", // teal-400
        },
        error: {
          DEFAULT: "#f43f5e", // rose-500
          bg: "rgba(244, 63, 94, 0.1)",
          text: "#fb7185", // rose-400
        },
        warning: {
          DEFAULT: "#eab308", // yellow-500
          bg: "rgba(234, 179, 8, 0.1)",
          text: "#facc15", // yellow-400
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(168, 85, 247, 0.15)',
        'surface': '0 4px 20px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
};
