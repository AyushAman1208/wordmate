import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        'fade-out': 'fadeOut 3s ease-in-out forwards', // Name of animation
      },
      keyframes: {
        fadeOut: {
          '0%': { opacity: '1' },       // Fully visible at the start
          '80%': { opacity: '1' },      // Remain visible until 80% of the duration
          '100%': { opacity: '0' },     // Fully transparent at the end
        },
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  
  plugins: [],
} satisfies Config;
