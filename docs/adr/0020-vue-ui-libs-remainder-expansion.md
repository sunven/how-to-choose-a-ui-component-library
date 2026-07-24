# Vue ui-libs 差额补齐：Quasar / Volt / Reka（Nuxt 退出；Daisy 仍仅 Vanilla）

以 [ui-libs.vercel.app](https://ui-libs.vercel.app/) 当前列表相对本站 Vue 轴的差额为线索，**决议并交付**三个 Vue Candidate 真机：`quasar` → `volt-ui` → `reka-ui`。每库须 Form/Table/Modal、共享 Showcase Data、Library Profile、官方 light/dark 映射与现网全对齐后才进 Switcher；挂在既有 Vue 九库之后按上序追加；默认库仍 `element-plus`。实现均走 React Shell + Vue Island（Vite），**默认不上 iframe**。Quasar 用 Island 内官方插件/组件，非 Quasar CLI 整站。Volt 与 `primevue` 分列（粘贴层 vs 默认主题皮），场景组件复制进仓（同 shadcn 口径）。Reka 为 headless：Showcase 复刻**官网文档示例皮**，Profile + 页内短提示标明「非 npm 默认主题」；不改全站 Primary Goal 措辞。

**Nuxt UI 落地结论：移出本批、不进 Switcher。** `@nuxt/ui` v4 官方 Vue 路径要求 Tailwind CSS v4（`@import "tailwindcss"` + `@nuxt/ui/vite`），与现网 Tailwind v3 + PostCSS 单管道冲突；强行双 TW 或整站升 v4 超出「Vue Island 补齐」范围；不上 iframe 子应用。Daisy UI **不**再挂 Vue，维持 Vanilla `daisyui`。

本 ADR **部分取代** ADR-0016 对 Quasar / Volt UI / Reka UI 的排除；Nuxt UI 维持排除（原因更新为宿主栈不兼容）；0016 对其余（含 Daisy 不进 Vue、非整表搬迁、禁止半成品）仍然有效。明确不做：ui-libs 百科化、Daisy 双挂、Reka 自研皮冒充默认主题、Volt 并入 `primevue`、改默认库以推广新候选、为 Nuxt UI 单独上 iframe 或升全站 Tailwind v4。

## Considered Options

- **差额五库全进 Vue（含 Daisy）**：放弃。Daisy 已是 CSS-only → Framework=`vanilla`；双挂破坏框架轴语义。
- **Reka 裸奔或本站自研皮**：放弃。前者几乎无观感对比；后者误导「默认皮」归属。
- **Nuxt / Quasar 默认 iframe 子应用**：放弃。打开隔离与 Theme 特案口子，与单壳切换主形态冲突。
- **Volt 并入 `primevue` 切换皮**：放弃。破坏「一库一 Candidate」模型。
- **放宽 Primary Goal 为「演示观感」全局定义**：放弃。仅 Reka 局部标注例外即可。
- **为 Nuxt UI 升全站 Tailwind v4 或双管道**：放弃。牵动全部 Candidate 与外壳，风险与本批范围不匹配。
