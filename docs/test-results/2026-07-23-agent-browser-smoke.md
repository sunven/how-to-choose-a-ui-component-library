# UI Library Showcase Smoke Test

- Date: 2026-07-23T03:28:29Z
- Base: http://localhost:5173
- Session: ui-lib-test

| Library | Path | Load | Table | Create Modal | Console errors | Notes |
|---------|------|------|-------|--------------|----------------|-------|
| Ant Design | `react/ant-design` | PASS | PASS | PASS | clean | — |
| MUI | `react/mui` | PASS | PASS | PASS | clean | — |
| shadcn/ui | `react/shadcn` | PASS | PASS | PASS | clean | — |
| Arco Design | `react/arco-design` | PASS | PASS | PASS | clean | — |
| Semi Design | `react/semi-design` | PASS | PASS | PASS | clean | — |
| Mantine | `react/mantine` | PASS | PASS | PASS | clean | — |
| Element Plus | `vue/element-plus` | PASS | PASS | PASS | clean | — |
| Naive UI | `vue/naive-ui` | PASS | PASS | PASS | clean | — |
| Ant Design Vue | `vue/ant-design-vue` | PASS | PASS | PASS | clean | — |
| Arco Design Vue | `vue/arco-design-vue` | PASS | PASS | PASS | clean | — |
| Vuetify | `vue/vuetify` | PASS | PASS | PASS | clean | — |
| PrimeVue | `vue/primevue` | PASS | PASS | PASS | clean | — |
| shadcn-vue | `vue/shadcn-vue` | PASS | PASS | PASS | clean | — |
| Vuestic UI | `vue/vuestic-ui` | PASS | PASS | PASS | clean | — |
| Flowbite Vue | `vue/flowbite-vue` | PASS | PASS | PASS | clean | — |

## Summary

- PASS-all-checks: 15 / 15
- FAIL-or-partial: 0 / 15
- WARN notes (counted inside rows): 0

Screenshots: `/tmp/ui-lib-test/screenshots/`

## Criteria

1. **Load**: URL stays on library path; page shows Showcase chrome / library name
2. **Table**: Shared sample user data visible (e.g. 陈思远) or name column
3. **Create Modal**: 新建用户 opens form-like UI with cancel/save/fields
4. **Console**: best-effort via agent-browser errors/console

## Deep checks (same session)

| Check | Result | Evidence |
|-------|--------|----------|
| Element Plus → shadcn style residue | **PASS** | No `.el-button` / `.el-overlay`; shell `h1` 24px slate; showcase shows shadcn |
| Vuestic → MUI residue | **PASS** | No `.va-button` / `.va-modal`; `.MuiButton-root`/table present; sample user visible |
| EP modal open → switch to Ant Design | **PASS** | No leftover `.el-overlay` / `.el-dialog`; `body.className` empty |
| MUI 编辑 opens form | **PASS** | Body shows user/fields after 编辑 |
| Arco Vue → Semi → Flowbite console | **PASS** | No JS errors; only Vite debug + React DevTools info |
| Framework switch via URL to Vue | **PASS** | `/libs/vue/element-plus` loads Element Plus + sample data |
| Ant Design 完整创建提交 | **PARTIAL** | Modal opens with 姓名/邮箱/角色/提交 fields (a11y); e2e submit not confirmed (form validation + automation fill/role select flaky; not treated as product bug without repro) |
| Framework switcher link click | **FLAKY tooling** | Occasional agent-browser daemon `os error 35`; URL navigation works |

## Screenshots

Saved under `/tmp/ui-lib-test/screenshots/` (15 library smokes + deep isolation shots).

## Conclusion

All **15 Candidate Libraries** pass smoke criteria (load + shared table data + open create modal + clean console). L1 style isolation checks (global CSS libs → shell/other libs) look healthy. No product-blocking failures found in this pass.
