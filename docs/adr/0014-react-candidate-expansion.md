# React 候选扩展：Arco / Semi / Mantine（串行、全对齐）

在已有 React 三库与多框架管道之上，本批只新增三个 React Candidate Library 的真机 Showcase 与 Library Profile：Arco Design（`arco-design`）、Semi Design（`semi-design`）、Mantine（`mantine`）。场景、共享 Showcase Data、Form Chrome（Modal）与现有库全对齐；串行进主线（Arco → Semi → Mantine），每库就绪后才注册进 Switcher/路由。默认库仍为 Ant Design；Switcher 顺序为 antd → MUI → shadcn → Arco → Semi → Mantine。样式隔离默认沿用单挂载 L1，污染明显再对该库加强；界面语言业务层中文、有官方 locale 则接入，不强制内置 chrome 全文案中文化。明确不做：新 Framework、更多 Vue 库、未决议的「知名」React 库（如 Chakra/PrimeReact/Fluent）、并排对比、推荐引擎、默认换库、本批 iframe 沙箱。目标是补齐中后台/现代 React 选型轴，而不是做成全量组件库目录。
