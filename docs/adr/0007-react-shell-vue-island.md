# 多框架采用 React Shell + Vue Island

在保留 Vite + React 中立外壳与单站点部署的前提下，Vue 候选库（首批仅 Element Plus）的 Showcase 不以 iframe 或同域双主应用承载，而在当前库为 Vue 时于 Showcase 占位 DOM 上 `createApp` 挂载，离开则 unmount。取舍：接受同页双运行时与更严的样式/副作用清理，换取统一路由、档案与可分享 URL，并避免过早引入微前端或重写外壳。
