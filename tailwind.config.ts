import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./index.html",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "liquid-flow": {
          "0%, 100%": {
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
            transform: "translate(0, 0) rotate(0deg)",
          },
          "25%": {
            borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%",
            transform: "translate(10px, -10px) rotate(90deg)",
          },
          "50%": {
            borderRadius: "70% 30% 40% 60% / 40% 70% 60% 30%",
            transform: "translate(-10px, 10px) rotate(180deg)",
          },
          "75%": {
            borderRadius: "40% 70% 60% 30% / 70% 40% 50% 70%",
            transform: "translate(-10px, -10px) rotate(270deg)",
          },
        },
        "liquid-ripple": {
          "0%": {
            transform: "scale(0)",
            opacity: "1",
          },
          "100%": {
            transform: "scale(4)",
            opacity: "0",
          },
        },
        "liquid-blob": {
          "0%, 100%": {
            borderRadius: "63% 37% 54% 46% / 55% 48% 52% 45%",
            transform: "translate(0px, 0px) rotate(0deg)",
          },
          "14%": {
            borderRadius: "40% 60% 54% 46% / 49% 60% 40% 51%",
            transform: "translate(0px, 5px) rotate(50deg)",
          },
          "28%": {
            borderRadius: "54% 46% 38% 62% / 49% 70% 30% 51%",
            transform: "translate(5px, 0px) rotate(100deg)",
          },
          "42%": {
            borderRadius: "61% 39% 55% 45% / 61% 38% 62% 39%",
            transform: "translate(0px, -3px) rotate(150deg)",
          },
          "56%": {
            borderRadius: "61% 39% 67% 33% / 70% 50% 50% 30%",
            transform: "translate(-5px, 0px) rotate(200deg)",
          },
          "70%": {
            borderRadius: "50% 50% 33% 67% / 55% 68% 32% 45%",
            transform: "translate(0px, 3px) rotate(250deg)",
          },
          "84%": {
            borderRadius: "46% 54% 50% 50% / 35% 61% 39% 65%",
            transform: "translate(0px, -2px) rotate(300deg)",
          },
        },
        "liquid-pour": {
          "0%": {
            transform: "translateY(-100%) scaleY(0)",
            opacity: "0",
          },
          "20%": {
            transform: "translateY(-50%) scaleY(0.3)",
            opacity: "0.7",
          },
          "50%": {
            transform: "translateY(0%) scaleY(1)",
            opacity: "1",
          },
          "100%": {
            transform: "translateY(0%) scaleY(1)",
            opacity: "1",
          },
        },
        "liquid-gradient": {
          "0%, 100%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "liquid-flow": "liquid-flow 8s ease-in-out infinite",
        "liquid-ripple": "liquid-ripple 0.6s ease-out",
        "liquid-blob": "liquid-blob 12s ease-in-out infinite",
        "liquid-pour": "liquid-pour 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "liquid-gradient": "liquid-gradient 8s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
