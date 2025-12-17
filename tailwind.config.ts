import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
      },
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
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a4b9fc',
          400: '#8193f8',
          500: '#6366f1', // Indigo-500 (Brand Primary)
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7', // Purple-500 (Brand Secondary)
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          50: '#fef3f2',
          100: '#fee4e2',
          200: '#fecdca',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e', // Rose-500 (Brand Accent)
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
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
        // Extended brand colors for direct use
        brand: {
          indigo: '#6366f1',
          purple: '#a855f7',
          rose: '#f43f5e',
          ocean: '#1e1b4b',
        },
        // Success/Warning/Error semantic colors
        success: {
          DEFAULT: '#22c55e',
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          DEFAULT: '#eab308',
          50: '#fefce8',
          100: '#fef9c3',
          500: '#eab308',
          600: '#ca8a04',
        },
        error: {
          DEFAULT: '#ef4444',
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      boxShadow: {
        'brand': '0 4px 14px rgba(99, 102, 241, 0.25), 0 2px 8px rgba(168, 85, 247, 0.15)',
        'brand-lg': '0 10px 30px rgba(99, 102, 241, 0.3), 0 4px 12px rgba(168, 85, 247, 0.2)',
        'brand-xl': '0 20px 50px rgba(99, 102, 241, 0.35), 0 8px 20px rgba(168, 85, 247, 0.25)',
        'glow': '0 0 15px rgba(99, 102, 241, 0.3)',
        'glow-md': '0 0 20px rgba(99, 102, 241, 0.4), 0 0 40px rgba(168, 85, 247, 0.2)',
        'glow-lg': '0 0 25px rgba(99, 102, 241, 0.4), 0 0 50px rgba(168, 85, 247, 0.2)',
        'glow-rose': '0 0 20px rgba(244, 63, 94, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(99, 102, 241, 0.15)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #f43f5e 100%)',
        'brand-gradient-soft': 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.1) 50%, rgba(244,63,94,0.1) 100%)',
        'brand-gradient-horizontal': 'linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #f43f5e 100%)',
        'ocean-gradient': 'linear-gradient(180deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
        'mesh-gradient': 'radial-gradient(at 40% 20%, hsla(240, 100%, 70%, 0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(270, 100%, 70%, 0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(340, 100%, 70%, 0.1) 0px, transparent 50%)',
        'hero-pattern': 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "gradient-flow": {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        "glow-pulse": {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' },
        },
        "shimmer": {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        "float": {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        "fade-in": {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        "fade-in-up": {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        "scale-in": {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        "slide-in-right": {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        "marquee": {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(calc(-100% - var(--gap)))' },
        },
        "marquee-vertical": {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(calc(-100% - var(--gap)))' },
        },
        "border-beam": {
          '0%': { offsetDistance: '0%' },
          '100%': { offsetDistance: '100%' },
        },
        "pulse-glow": {
          '0%, 100%': { boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(99, 102, 241, 0.6), 0 0 60px rgba(168, 85, 247, 0.3)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gradient-flow": "gradient-flow 5s ease infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "float": "float 3s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-in-up": "fade-in-up 0.5s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "marquee": "marquee var(--duration) infinite linear",
        "marquee-vertical": "marquee-vertical var(--duration) linear infinite",
        "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
