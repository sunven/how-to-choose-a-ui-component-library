export default {
  plugins: {
    'postcss-preset-mantine': {},
    // silent: ignore non-Mantine $vars (e.g. Vuetify CSS) so they are not treated as simple-vars
    'postcss-simple-vars': {
      silent: true,
      variables: {
        'mantine-breakpoint-xs': '36em',
        'mantine-breakpoint-sm': '48em',
        'mantine-breakpoint-md': '62em',
        'mantine-breakpoint-lg': '75em',
        'mantine-breakpoint-xl': '88em',
      },
    },
    tailwindcss: {},
    autoprefixer: {},
  },
}
