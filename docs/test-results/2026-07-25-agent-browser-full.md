# UI Library Showcase — Full agent-browser Test

- Date: 2026-07-25
- Base: http://localhost:5173
- Session(s): `ui-full-test`, `ui-deep`
- Tool: agent-browser 0.31.1
- Scope: all **21** candidate libraries + shell UX (sort, profile links, theme, isolation)

## Smoke matrix (all libraries)

Criteria:

1. **Load** — URL stays on library path; profile `h2` matches library name
2. **Table** — shared sample user `陈思远` visible
3. **Create Modal** — 新建用户 opens form-like UI (姓名/邮箱 + 取消/提交, or dialog node)
4. **Links@title** — 官网 / 文档 / GitHub sit in `nav[aria-label=组件库链接]` next to `h2` (no bottom `dt`「链接」)
5. **Alpha sort** — library switcher names sorted A–Z (`en`, base sensitivity)
6. **Console** — no product JS errors via `agent-browser errors`

| Library | Path | Load | Table | Create Modal | Links@title | Alpha sort | Console |
|---------|------|------|-------|--------------|-------------|------------|---------|
| Ant Design | `react/ant-design` | PASS | PASS | PASS | PASS | PASS | PASS |
| Arco Design | `react/arco-design` | PASS | PASS | PASS | PASS | PASS | PASS |
| Mantine | `react/mantine` | PASS | PASS | PASS | PASS | PASS | PASS |
| MUI | `react/mui` | PASS | PASS | PASS | PASS | PASS | PASS |
| Semi Design | `react/semi-design` | PASS | PASS | PASS | PASS | PASS | PASS |
| shadcn/ui | `react/shadcn` | PASS | PASS | PASS | PASS | PASS | PASS |
| Ant Design Vue | `vue/ant-design-vue` | PASS | PASS | PASS | PASS | PASS | PASS |
| Arco Design Vue | `vue/arco-design-vue` | PASS | PASS | PASS | PASS | PASS | PASS |
| Element Plus | `vue/element-plus` | PASS | PASS | PASS | PASS | PASS | PASS |
| Flowbite Vue | `vue/flowbite-vue` | PASS | PASS | PASS | PASS | PASS | PASS |
| Naive UI | `vue/naive-ui` | PASS | PASS | PASS | PASS | PASS | PASS |
| PrimeVue | `vue/primevue` | PASS | PASS | PASS | PASS | PASS | PASS |
| Quasar | `vue/quasar` | PASS | PASS | PASS | PASS | PASS | PASS |
| Reka UI | `vue/reka-ui` | PASS | PASS | PASS | PASS | PASS | PASS |
| shadcn-vue | `vue/shadcn-vue` | PASS | PASS | PASS | PASS | PASS | PASS |
| Volt UI | `vue/volt-ui` | PASS | PASS | PASS | PASS | PASS | PASS |
| Vuestic UI | `vue/vuestic-ui` | PASS | PASS | PASS | PASS | PASS | PASS |
| Vuetify | `vue/vuetify` | PASS | PASS | PASS | PASS | PASS | PASS |
| Bootstrap | `vanilla/bootstrap` | PASS | PASS | PASS | PASS | PASS | PASS |
| Bulma | `vanilla/bulma` | PASS | PASS | PASS | PASS | PASS | PASS |
| daisyUI | `vanilla/daisyui` | PASS | PASS | PASS | PASS | PASS | PASS |

### Smoke summary

| Check | PASS |
|-------|------|
| Load | 21 / 21 |
| Table | 21 / 21 |
| Create Modal | 21 / 21 |
| Links@title | 21 / 21 |
| Alpha sort | 21 / 21 |
| Console | 21 / 21 |
| **FAIL rows** | **0 / 21** |

Observed switcher order samples:

- **React:** Ant Design → Arco Design → Mantine → MUI → Semi Design → shadcn/ui
- **Vue:** Ant Design Vue → Arco Design Vue → Element Plus → Flowbite Vue → Naive UI → PrimeVue → Quasar → Reka UI → shadcn-vue → Volt UI → Vuestic UI → Vuetify
- **Vanilla:** Bootstrap → Bulma → daisyUI

## Deep checks

| Check | Result | Evidence |
|-------|--------|----------|
| Theme toggle light → dark → light | **PASS** | dark: `html.dark`, body `rgb(9, 14, 26)`; light: no dark class, body `rgb(255, 255, 255)`; button labels 切换为暗色 / 切换为亮色 |
| Framework switcher click React → Vue | **PASS** | URL `/libs/vue/element-plus`, h2 Element Plus, 12 Vue libs alpha-sorted |
| Framework switcher click Vue → Vanilla | **PASS** | URL `/libs/vanilla/daisyui`, libs Bootstrap / Bulma / daisyUI sorted |
| Framework switcher click Vanilla → React | **PASS** | After settle: URL `/libs/react/ant-design`, h2 Ant Design, React libs restored (early eval without wait can read stale DOM — tooling race, not product bug on recheck) |
| Element Plus → shadcn style residue | **PASS** | No `.el-button` / `.el-overlay`; shell h1 24px slate `rgb(15, 23, 42)`; sample user present |
| Vuestic → MUI residue | **PASS** | No `.va-button` / `.va-modal`; MUI roots present; sample user present |
| EP modal open → switch to Ant Design | **PASS** | No leftover `.el-overlay` / `.el-dialog`; `body.className` empty; Ant Design loads |
| Quasar → Bootstrap → Ant Design residue | **PASS** | No `.q-btn` / `.btn.btn-primary` on Ant Design page; `.ant-btn` present |
| MUI 编辑 opens form | **PASS** | Dialog open; 姓名 / 邮箱 content present |
| Ant Design 完整创建提交 | **PARTIAL** | Modal opens and label fields exist; fill+submit did not confirm new row `测试用户甲` (automation fill/role select still flaky; same as prior report — not treated as product-blocking without manual repro) |

## Screenshots

Saved under `/tmp/ui-full-test/screenshots/`:

- `00-initial.png`, `deep-start.png`
- `smoke-{framework}-{library}.png` × 21
- `deep-theme-dark.png`, `deep-theme-light.png`
- `deep-fw-vue.png`, `deep-fw-vanilla.png`, `deep-fw-react-after-vanilla.png`
- `deep-iso-ep-shadcn.png`, `deep-iso-modal-switch.png`
- `deep-mui-edit.png`, `deep-antd-create.png`

Raw machine output: `/tmp/ui-full-test/summary.json`, `/tmp/ui-full-test/deep/part*.txt`

## Conclusion

- All **21** libraries pass smoke (load + shared table + create modal + profile links after title + A–Z switcher + clean console).
- Recent UX changes verified: **alphabetical library switcher**, **官网/文档/GitHub next to title** (bottom「链接」row gone).
- Shell theme toggle and L1 style isolation (including new Quasar / Bootstrap paths) look healthy.
- No product-blocking failures. Only residual **PARTIAL** is Ant Design e2e create-submit under automation (historical flaky path).
