# 样式隔离：运行时只挂载当前库 + 作用域约定

用户一次只看一个候选库，因此 Showcase 运行时只挂载当前库子树，样式按库分入口，并对 Tailwind/shadcn 等与外壳共享的部分加 root scope。不在 v1 使用全站 iframe 或微前端。接受少量全局样式残留风险；若单个库污染无法接受，再对该库升级隔离手段。

## L1 落地（2026-07-23）

调研结论见 `docs/research/2026-07-23-style-isolation-multi-ui-libraries.md`：继续 **L1**，不上微前端框架。

当前 L1 组合：

1. **单挂载**：`LibraryPage` 同一时刻只渲染一个 React Showcase 或 Vue Island（lazy）。
2. **分入口 CSS**：各库样式随 showcase / `mount.ts` 异步 chunk 引入，不进外壳公共包。
3. **切换时卸载全局 CSS**：`useLibraryStyleIsolation` 观察 `<head>` 中本库会话新增的静态 / Vite 样式表，离开时缓存并移除，返回时重放（ESM CSS 副作用只执行一次）。**不**拆除 Emotion / antd cssinjs / css-render 等运行时表，避免破坏 CSS-in-JS 缓存。
4. **共享 Tailwind 作用域**：shadcn / shadcn-vue 使用 `.showcase-shadcn*` root token。
5. **按库前缀（已有）**：Vuestic 工具类经 Vite + `postcss-prefix-selector` 挂到 `.vuestic-island`；**Vuetify** 同理挂到 `.vuetify-island`（其 `.bg-white { !important }` 等会与壳 Tailwind 冲突，暗色下顶栏被刷白）。

## 升级路径（仍属产品例外，非默认）

- 某库在 L1 卸载后仍污染 shell → 对该库做选择器前缀 / popup 容器（Phase 2）。
- 仍失败 → 仅该库 Showcase 级 iframe（Phase 3）。
- 明确不做：qiankun / single-spa 全量运行时、Module Federation 当隔离方案、默认全站 iframe / 全库 Shadow DOM。
