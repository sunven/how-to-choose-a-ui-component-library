# Vue ui-libs 候选扩展：五库串行真机（非整表搬迁）

> **Status:** accepted；对 Reka UI / Nuxt UI / Quasar / Volt UI 的排除由 [ADR-0020](./0020-vue-ui-libs-remainder-expansion.md) **部分取代**。Daisy UI 不进 Vue、非整表搬迁等其余边界仍有效。

以 [ui-libs.vercel.app](https://ui-libs.vercel.app/) 为 Vue 候选**来源**而非产品模板：本批只串行新增五个真机 Showcase + Profile——`vuetify` → `primevue` → `shadcn-vue` → `vuestic-ui` → `flowbite-vue`——场景与共享 Showcase Data、Modal 表单、C1 中文 locale、K1 最小官方 icon/font、L1 样式隔离（污染再按库加强）与现网全对齐；均走 React Shell + Vue Island；默认库仍 Element Plus；既有四库之后按上序追加。`shadcn-vue` 复制场景所需源码进仓库，与 React shadcn 同口径、不与 `shadcn` 合并。明确不做：整表搬迁或改成特性矩阵站；本批排除 Reka UI / Ark UI / Daisy UI / Nuxt UI / Quasar / Volt UI（其中四库排除见 ADR-0020）；占位缩水进 Switcher；默认 iframe；并排对比、推荐引擎、外壳 Vue 化。目标是补齐适合中后台观感对比的 Vue 轴，而不是对齐外部目录的百科或筛选器。
