# UI Component Library Chooser

帮助开发者通过同一业务形态下的表单与表格观感对比，挑选合适的 UI 组件库。

## Language

**UI Component Library** (组件库):
一套可复用的界面组件集合（如 Ant Design、Element Plus），是本平台要展示与对比的对象。
_Avoid_: UI kit, design system（除非明确指设计系统本身）

**Showcase** (展示页):
某个组件库下，同一业务形态（表单、表格）的真实渲染结果，用于观感与交互对比。
_Avoid_: demo 站, playground（易与官方文档演示混淆）

**Form Showcase** (表单展示):
典型中后台表单：分组布局、校验、常见控件（文本、数字、日期、选择、多选、文本域等）以及提交/重置。三个候选库使用同一套业务字段与文案，仅替换组件实现。
_Avoid_: 极简 Hello World 表单；分步向导/动态增删行等重型表单（非 v1）

**Table Showcase** (表格展示):
典型中后台表格：排序、筛选/搜索、分页、行选择、操作列。三个候选库使用同一套列定义、样例数据与交互语义，仅替换组件实现。
_Avoid_: 仅静态三列表格；虚拟滚动/可编辑单元格/树表等重型表格（非 v1）

**Library Profile** (组件库档案):
组件库的选型辅助元信息。v1 实用集字段：名称、适用框架、GitHub stars、License、官网/文档链接、活跃度说明、包体积量级（或外链）、TypeScript 支持、样式方案（一句）、一句话定位。可变指标（如 stars）运行时向 GitHub 拉取；静态配置中保留快照值，拉取失败时回退快照并可重试。Showcase 不依赖 Profile 接口成功。
_Avoid_: 详情页, about；百科式长文档案（非 v1）；因 Profile 失败而阻断展示

**Primary Goal** (主目标):
通过切换组件库查看同一表单与表格的观感差异，辅助选型；档案信息为辅助，不是百科全书。

**App Shell** (应用外壳):
站点导航、Library Switcher、Library Profile 与页面骨架使用中立实现，不采用任一候选组件库的组件。v1 外壳样式使用 Tailwind CSS。外壳不得抢戏或暗示「推荐某一候选库」。
_Avoid_: 用 Ant Design/MUI/shadcn 组件搭外壳；切换库时连外壳一起换皮

**Style Isolation** (样式隔离):
同一时间只挂载当前候选库的 Showcase 子树；各库样式按库分入口引入；shadcn 等与外壳共享 Tailwind 的区域需 root scope，减少主题变量与 preflight 互相污染。不承诺零泄漏；不做全站 iframe/微前端子 v1。
_Avoid_: 三库同时挂载; 全站 iframe 沙箱; 微前端（非 v1）

**Delivery Stack** (交付技术栈):
v1 应用为 Vite + React + TypeScript SPA，路由使用 React Router；包管理默认 pnpm。不做 Next.js/SSR 作为 v1 基座。
_Avoid_: Next.js 作为 v1 主框架

**UI Language** (界面语言):
中文为主；技术专有名词保留英文（如 License、TypeScript、GitHub stars）。v1 不做中英切换 i18n。
_Avoid_: 全站英文; 完整 i18n（非 v1）

**Theme Mode** (主题模式):
v1 仅亮色（light）。各候选库使用其官方默认 light 主题；外壳亦为 light。不做亮暗切换。
_Avoid_: 暗色主题; 跟随系统; 每库文档默认主题不一致（非 v1）

**Showcase Data** (展示数据):
用户管理样例数据存在于浏览器内存：支持新建/编辑写回列表、删除移除、筛选与分页作用于同一份数据；刷新后恢复初始种子数据。无后端、无登录、无权限。
_Avoid_: 纯死展示按钮; localStorage/后端持久化（非 v1）

**Library Route** (组件库路由):
当前选中的候选库同步到 URL path（如 `/libs/ant-design`、`/libs/mui`、`/libs/shadcn`），可分享、刷新保持。默认库为 Ant Design；`/` 或无效 id 回退到 Ant Design。
_Avoid_: 仅内存 state 不进 URL; 用复杂多页为每库做独立站点; 强制先选手动空态

**User** (用户):
Showcase 中的领域实体。字段：姓名、邮箱、角色（管理员/编辑/访客）、状态（启用/禁用）、入职日期、备注。三库共用同一字段语义与校验规则。
_Avoid_: 头像上传、部门树、权限矩阵、导入导出（非 v1）

**V1 Scope** (第一版范围):
可切换的三库用户管理观感对比台：中立外壳、Form/Table Showcase、内存 CRUD、Library Profile、URL 同步。不做并排对比、推荐引擎、多框架、暗色、i18n、后端、全站 iframe/微前端、专业 a11y/bundle 实验室、专门移动端适配。

**Supported Framework** (支持的框架):
第一版 Showcase 与候选组件库仅覆盖 React 生态。档案可提及「另有 Vue 版」等事实，但不提供 Vue 真机展示。
_Avoid_: 跨框架对比平台（非当前范围）

**Library Switcher** (组件库切换器):
用户一次只选择一个当前组件库；页面渲染该库的 Showcase 与 Library Profile。不做并排双库对比。
_Avoid_: 并排对比, side-by-side, 双栏模式（非当前范围）

**Candidate Library** (候选组件库):
第一版固定 3 个 React 组件库，用于 Showcase：Ant Design、MUI、shadcn/ui。代表企业中后台、Material、可复制源码三条常见选型路线。架构上应按可扩展注册，但 v1 不承诺更多库。
_Avoid_: 全量组件库目录（非当前范围）

**Showcase Scenario** (展示场景):
第一版唯一业务场景为「用户管理」：表格为主展示用户列表；通过 Modal 打开表单进行新建/编辑。三库共用同一字段、列、样例数据与文案。
_Avoid_: 多业务场景切换（非 v1）；页内常驻表单；Drawer 表单（非 v1）

**Form Chrome** (表单容器):
承载 Form Showcase 的容器固定为 Modal（弹窗）。列表提供「新建」；行操作提供「编辑」（回填）与删除类操作。
_Avoid_: Drawer, 页内嵌表单（非 v1）
