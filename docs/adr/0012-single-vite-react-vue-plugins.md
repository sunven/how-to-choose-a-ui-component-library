# 单 Vite 应用内 React + Vue 双插件

多框架扩展保留单一可部署应用：同时启用 `@vitejs/plugin-react` 与 `@vitejs/plugin-vue`，Element Plus Showcase 放在 `src/showcases/` 下并以路由/库级异步 chunk 加载（含其样式）。不为首个 Vue 库拆 pnpm 多包或独立构建产物。取舍：接受同一构建图里双 UI 运行时配置复杂度，换取共享 domain 类型、统一路由与最低基建成本；若日后多 Vue 库或构建互踩再考虑拆包。
