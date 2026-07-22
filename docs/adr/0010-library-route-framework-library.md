# 路由采用 /libs/:framework/:libraryId

多框架阶段用 path 同时表达 Framework 与 Candidate Library（例：`/libs/react/mui`、`/libs/vue/element-plus`），默认进入 `/libs/react/ant-design`。不采用扁平 `/libs/:id` 为主形态，也不把 framework 放在 query。旧 v1 路径 `/libs/:libraryId` 对 React 候选 id 做站内重定向。取舍：URL 稍长，但与「先框架再库」一致，且无效跨框架组合可显式回退。
