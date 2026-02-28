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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
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
        email: {
          hover: "hsl(var(--email-hover))",
          selected: "hsl(var(--email-selected))",
        },
        badge: {
          proposal: {
            DEFAULT: "hsl(var(--badge-proposal))",
            bg: "hsl(var(--badge-proposal-bg))",
          },
          followup: {
            DEFAULT: "hsl(var(--badge-followup))",
            bg: "hsl(var(--badge-followup-bg))",
          },
          inquiry: {
            DEFAULT: "hsl(var(--badge-inquiry))",
            bg: "hsl(var(--badge-inquiry-bg))",
          },
          invoice: {
            DEFAULT: "hsl(var(--badge-invoice))",
            bg: "hsl(var(--badge-invoice-bg))",
          },
          personal: {
            DEFAULT: "hsl(var(--badge-personal))",
            bg: "hsl(var(--badge-personal-bg))",
          },
          newsletter: {
            DEFAULT: "hsl(var(--badge-newsletter))",
            bg: "hsl(var(--badge-newsletter-bg))",
          },
          notification: {
            DEFAULT: "hsl(var(--badge-notification))",
            bg: "hsl(var(--badge-notification-bg))",
          },
          amount: {
            DEFAULT: "hsl(var(--badge-amount))",
            bg: "hsl(var(--badge-amount-bg))",
          },
          deadline: {
            DEFAULT: "hsl(var(--badge-deadline))",
            bg: "hsl(var(--badge-deadline-bg))",
          },
          overdue: {
            DEFAULT: "hsl(var(--badge-overdue))",
            bg: "hsl(var(--badge-overdue-bg))",
          },
          urgent: {
            DEFAULT: "hsl(var(--badge-urgent))",
            bg: "hsl(var(--badge-urgent-bg))",
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
