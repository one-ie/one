/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: ["class"],
  theme: {
    extend: {
      spacing: {
        '10': '2.5rem',
        // Add other common spacing values
        '0': '0',
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '2rem',
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
        '32': '8rem',
        '40': '10rem',
        '48': '12rem',
        '56': '14rem',
        '64': '16rem'
      },
      colors: {
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-in": {
          from: { opacity: 0, transform: "translateY(4px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "slide-in": {
          from: { opacity: 0, transform: "translateX(20px)" },
          to: { opacity: 1, transform: "translateX(0)" },
        },
        "typing": {
          "0%": { width: "0" },
          "30%": { width: "3em" },
          "60%": { width: "6em" },
          "100%": { width: "0" }
        },
        "blink": {
          "50%": { opacity: 0 }
        },
        "pulse-glow": {
          "0%, 100%": { 
            boxShadow: "0 0 0 0 hsla(var(--primary) / 0.2)"
          },
          "50%": { 
            boxShadow: "0 0 10px 3px hsla(var(--primary) / 0.4)"
          }
        },
        "subtle-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" }
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out forwards",
        "slide-in": "slide-in 0.3s ease-out forwards",
        "typing": "typing 3s steps(40) infinite, blink 1s step-end infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "subtle-bounce": "subtle-bounce 2s ease-in-out infinite",
        "bounce-subtle": "bounce-subtle 2s infinite"
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}