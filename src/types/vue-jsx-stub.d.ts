/**
 * Stub for `vue/jsx`.
 *
 * Vuetify (and similar Vue libs) import `vue/jsx`, which registers a global JSX
 * namespace with VNodeRef. In this React shell + Vue island app that collides
 * with React's ForwardedRef / LegacyRef and breaks `tsc` on Radix/shadcn refs.
 *
 * Map `vue/jsx` → this empty module in tsconfig paths so typecheck keeps React
 * as the sole global JSX owner. Runtime Vue SFCs are unaffected.
 */
export {}
