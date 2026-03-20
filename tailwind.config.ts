import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        mono: ['"Roboto Mono"', "monospace"],
      },
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        email: {
          hover: "var(--email-hover)",
          selected: "var(--email-selected)",
        },
        badge: {
          proposal: {
            DEFAULT: "var(--badge-proposal)",
            bg: "var(--badge-proposal-bg)",
          },
          followup: {
            DEFAULT: "var(--badge-followup)",
            bg: "var(--badge-followup-bg)",
          },
          inquiry: {
            DEFAULT: "var(--badge-inquiry)",
            bg: "var(--badge-inquiry-bg)",
          },
          invoice: {
            DEFAULT: "var(--badge-invoice)",
            bg: "var(--badge-invoice-bg)",
          },
          personal: {
            DEFAULT: "var(--badge-personal)",
            bg: "var(--badge-personal-bg)",
          },
          newsletter: {
            DEFAULT: "var(--badge-newsletter)",
            bg: "var(--badge-newsletter-bg)",
          },
          notification: {
            DEFAULT: "var(--badge-notification)",
            bg: "var(--badge-notification-bg)",
          },
          amount: {
            DEFAULT: "var(--badge-amount)",
            bg: "var(--badge-amount-bg)",
          },
          deadline: {
            DEFAULT: "var(--badge-deadline)",
            bg: "var(--badge-deadline-bg)",
          },
          overdue: {
            DEFAULT: "var(--badge-overdue)",
            bg: "var(--badge-overdue-bg)",
          },
          urgent: {
            DEFAULT: "var(--badge-urgent)",
            bg: "var(--badge-urgent-bg)",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in-right": {
          from: { transform: "translateX(10px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "slide-up": {
          from: { transform: "translateY(4px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.2s ease-out",
        "slide-up": "slide-up 0.15s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
