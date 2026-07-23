import flowbite from 'flowbite/plugin'
import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
  // Scan flowbite-vue source so utility classes on FwbButton etc. are generated
  // (primary button uses text-white bg-blue-700 — missing CSS made it look "empty").
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,vue}',
    './node_modules/flowbite-vue/**/*.{js,jsx,ts,tsx,vue}',
    './node_modules/flowbite/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [flowbite, daisyui],
  // Avoid nuking Ant Design / MUI baselines more than necessary on body.
  // Shell + shadcn still get utilities; preflight is kept for a clean shell.
  corePlugins: {
    preflight: true,
  },
  // S4/S1: daisyUI in shared Tailwind pipeline; base:false reduces body-level
  // pollution so the neutral shell is less likely to pick up daisy chrome.
  daisyui: {
    themes: ['light'],
    darkTheme: false,
    base: false,
    styled: true,
    utils: true,
    logs: false,
  },
}
