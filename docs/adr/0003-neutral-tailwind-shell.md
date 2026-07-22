# 应用外壳中立，使用 Tailwind，不采用候选组件库

为保证表单/表格观感对比公平，导航、切换器、档案区与页面骨架不用 Ant Design / MUI / shadcn 等候选库组件，而用中立外壳 + Tailwind。避免「壳是 Ant 范」带偏选型。代价是外壳 UI 需自建，且 shadcn Showcase 也依赖 Tailwind 时必须做好样式作用域隔离，避免外壳与展示区主题变量互相污染。
