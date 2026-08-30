import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0A2647",
          "navy-dark": "#061B30",
          "navy-light": "#144272",
          blue: "#205295",
          gold: "#C8A951",
          "gold-light": "#D4BC6A",
          "gold-dark": "#B8960E",
          sky: "#4DA8DA",
          "sky-light": "#7BC0F5",
          slate: "#1A2332",
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        background: "#ffffff",
        foreground: "#0f172a",
        muted: "#f1f5f9",
        "muted-foreground": "#64748b",
        border: "#e2e8f0",
        card: "#ffffff",
      },
      fontFamily: {
        sans: ["Satoshi", "system-ui", "-apple-system", "sans-serif"],
        mono: ["Satoshi", "sans-serif"],
      },
      borderRadius: {
        sm: "0.0625rem",
        DEFAULT: "0.125rem",
        md: "0.25rem",
        lg: "0.375rem",
        xl: "0.5rem",
        "2xl": "0.75rem",
        "3xl": "1rem",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #0A2647 0%, #144272 50%, #205295 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
        "gold-gradient": "linear-gradient(135deg, #C8A951 0%, #D4BC6A 100%)",
        "cta-gradient": "linear-gradient(135deg, #0A2647 0%, #205295 100%)",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(10, 38, 71, 0.37)",
        "glass-sm": "0 4px 16px 0 rgba(10, 38, 71, 0.2)",
        glow: "0 0 40px rgba(200, 169, 81, 0.3)",
        "glow-blue": "0 0 40px rgba(77, 168, 218, 0.3)",
      },
      animation: {
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "slide-down": "slideDown 0.3s ease-out",
        "scale-in": "scaleIn 0.5s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
