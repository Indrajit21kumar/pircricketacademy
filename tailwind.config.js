/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html","./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { display: ["'Oswald'","sans-serif"], sans: ["'Inter'","sans-serif"] },
      colors: {
        primary: { DEFAULT: "#0f172a", foreground: "#f8fafc" },
        secondary: { DEFAULT: "#eab308", foreground: "#0f172a" },
        background: "#0a0f1e", foreground: "#f1f5f9",
        card: { DEFAULT: "#111827", foreground: "#f1f5f9" },
        border: "#1e293b", input: "#1e293b",
        muted: { DEFAULT: "#1e293b", foreground: "#94a3b8" },
        accent: { DEFAULT: "#1e293b", foreground: "#f1f5f9" },
        destructive: { DEFAULT: "#ef4444", foreground: "#fff" },
        ring: "#eab308",
      },
      borderRadius: { lg: "0.75rem", md: "0.5rem", sm: "0.375rem" },
      animation: { ticker: "ticker 35s linear infinite", "accordion-down": "accordion-down 0.2s ease-out", "accordion-up": "accordion-up 0.2s ease-out" },
      keyframes: {
        ticker: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
