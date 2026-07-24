import flowbite from 'flowbite/plugin'
import daisyui from 'daisyui'
import plugin from 'tailwindcss/plugin'

/**
 * PrimeVue / Volt `data-p` state variants (port of tailwindcss-primeui v4 variants.css
 * for Tailwind v3). Selectors match compound `data-p="… checked …"` tokens.
 */
const primeDataPVariants = plugin(({ addVariant, addUtilities }) => {
  const token = (name) => `&[data-p~="${name}"]`
  const variants = {
    'p-invalid': token('invalid'),
    'p-small': token('small'),
    'p-large': token('large'),
    'p-xlarge': token('xlarge'),
    'p-fluid': token('fluid'),
    'p-filled': token('filled'),
    'p-horizontal': token('horizontal'),
    'p-vertical': token('vertical'),
    'p-stacked': token('stacked'),
    'p-checked': [`${token('checked')}`, '&[data-p-checked="true"]'],
    'p-disabled': [`${token('disabled')}`, '&[data-p-disabled="true"]'],
    'p-enabled': '&:not([data-p~="disabled"]):not([data-p-disabled="true"])',
    'p-selected': [`${token('selected')}`, '&[data-p-selected="true"]'],
    'p-selectable': [
      `${token('selectable')}`,
      '&[data-p-selectable="true"]',
      '&[data-p-selectable-row="true"]',
    ],
    'p-left': [`${token('left')}`, '&[data-p-left="true"]'],
    'p-right': [`${token('right')}`, '&[data-p-right="true"]'],
    'p-top': [`${token('top')}`, '&[data-p-top="true"]'],
    'p-bottom': [`${token('bottom')}`, '&[data-p-bottom="true"]'],
    'p-active': [`${token('active')}`, '&[data-p-active="true"]'],
    'p-focus': [`${token('focus')}`, '&[data-p-focused="true"]'],
    'p-icon-only': token('icon-only'),
    'p-rounded': token('rounded'),
    'p-raised': token('raised'),
    'p-outlined': token('outlined'),
    'p-text': token('text'),
    'p-link': token('link'),
    'p-secondary': token('secondary'),
    'p-success': token('success'),
    'p-info': token('info'),
    'p-warn': token('warn'),
    'p-danger': token('danger'),
    'p-loading': token('loading'),
    'p-today': token('today'),
    'p-other-month': token('other-month'),
    'p-sortable': [
      `${token('sortable')}`,
      '&[data-p-sortable-column="true"]',
      '&[data-p-sortable="true"]',
    ],
    'p-sorted': [`${token('sorted')}`, '&[data-p-sorted="true"]'],
    'p-highlight': token('highlight'),
    'p-indeterminate': [
      `${token('indeterminate')}`,
      '&[data-p-indeterminate="true"]',
    ],
  }
  for (const [name, sel] of Object.entries(variants)) {
    addVariant(name, sel)
  }

  addUtilities({
    '.border-surface': { 'border-color': 'var(--p-content-border-color)' },
    '.bg-emphasis': {
      background: 'var(--p-content-hover-background)',
      color: 'var(--p-content-hover-color)',
    },
    '.bg-highlight': {
      background: 'var(--p-highlight-background)',
      color: 'var(--p-highlight-color)',
    },
    '.bg-highlight-emphasis': {
      background: 'var(--p-highlight-focus-background)',
      color: 'var(--p-highlight-focus-color)',
    },
    '.rounded-border': { 'border-radius': 'var(--p-content-border-radius)' },
    '.text-color': { color: 'var(--p-text-color)' },
    '.text-color-emphasis': { color: 'var(--p-text-hover-color)' },
    '.text-muted-color': { color: 'var(--p-text-muted-color)' },
    '.text-muted-color-emphasis': { color: 'var(--p-text-hover-muted-color)' },
  })
})

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
          // Volt / Prime token scale (see voltTokens.css)
          emphasis: 'var(--p-primary-hover-color)',
          'emphasis-alt': 'var(--p-primary-active-color)',
          contrast: 'var(--p-primary-contrast-color)',
          50: 'var(--p-primary-50)',
          100: 'var(--p-primary-100)',
          200: 'var(--p-primary-200)',
          300: 'var(--p-primary-300)',
          400: 'var(--p-primary-400)',
          500: 'var(--p-primary-500)',
          600: 'var(--p-primary-600)',
          700: 'var(--p-primary-700)',
          800: 'var(--p-primary-800)',
          900: 'var(--p-primary-900)',
          950: 'var(--p-primary-950)',
        },
        surface: {
          0: 'var(--p-surface-0)',
          50: 'var(--p-surface-50)',
          100: 'var(--p-surface-100)',
          200: 'var(--p-surface-200)',
          300: 'var(--p-surface-300)',
          400: 'var(--p-surface-400)',
          500: 'var(--p-surface-500)',
          600: 'var(--p-surface-600)',
          700: 'var(--p-surface-700)',
          800: 'var(--p-surface-800)',
          900: 'var(--p-surface-900)',
          950: 'var(--p-surface-950)',
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
  plugins: [flowbite, daisyui, primeDataPVariants],
  // Avoid nuking Ant Design / MUI baselines more than necessary on body.
  // Shell + shadcn still get utilities; preflight is kept for a clean shell.
  corePlugins: {
    preflight: true,
  },
  // S4/S1: daisyUI in shared Tailwind pipeline; base:false reduces body-level
  // pollution so the neutral shell is less likely to pick up daisy chrome.
  // prefix is required: daisyUI's .btn/.input/.select/.table/.modal collide with
  // Bootstrap & Bulma on the same global sheet and corrupt Vanilla showcases.
  daisyui: {
    prefix: 'dy-',
    // Official light + dark presets; Showcase sets data-theme from Theme Mode.
    themes: ['light', 'dark'],
    darkTheme: 'dark',
    base: false,
    styled: true,
    utils: true,
    logs: false,
  },
}
