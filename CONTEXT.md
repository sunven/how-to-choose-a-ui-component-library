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
典型中后台表单：分组布局、校验、常见控件（文本、数字、日期、选择、多选、文本域等）以及提交/重置。所有 Candidate Library（含 Vue/Element Plus）使用同一套业务字段与文案，仅替换组件实现。
_Avoid_: 极简 Hello World 表单；分步向导/动态增删行等重型表单；跨库缩水字段造成双标准

**Table Showcase** (表格展示):
典型中后台表格：排序、筛选/搜索、分页、行选择、操作列。所有 Candidate Library 使用同一套列定义、样例数据与交互语义，仅替换组件实现。
_Avoid_: 仅静态三列表格；虚拟滚动/可编辑单元格/树表等重型表格；Vue 侧半套交互

**Library Profile** (组件库档案):
组件库的选型辅助元信息。v1 实用集字段：名称、适用框架、GitHub stars、License、官网/文档链接、生态摘要、体积摘要、TypeScript 支持、样式方案（一句）、一句话定位。可变指标（如 stars）运行时向 GitHub 拉取；静态配置中保留带日期的快照值，拉取失败时回退快照并可重试。Profile 明确区分实时值与静态摘要，并提示体积/生态描述非本站实测或评级、应通过官方文档与 GitHub 核对。Showcase 不依赖 Profile 接口成功。
_Avoid_: 详情页, about；百科式长文档案（非 v1）；因 Profile 失败而阻断展示；把定性摘要包装成本站实测数据；显示无日期、无核对入口的快照

**Primary Goal** (主目标):
通过切换组件库查看同一表单与表格的观感差异，辅助选型；档案信息为辅助，不是百科全书。

**App Shell** (应用外壳):
站点导航、Framework/Library Switcher、**Theme Toggle**、Library Profile 与页面骨架使用中立实现，不采用任一候选组件库的组件。外壳样式使用 Tailwind CSS（含 `darkMode: 'class'` 下的中立 dark 皮）。外壳不得抢戏或暗示「推荐某一候选库」。
_Avoid_: 用 Ant Design/MUI/shadcn 组件搭外壳；切换库时连外壳一起换皮；用候选库组件做 Theme Toggle

**Style Isolation** (样式隔离):
同一时间只挂载当前候选库的 Showcase（React 子树、Vue Island 或 Vanilla Showcase 三选一）；各库样式按库分入口引入；离开当前库时卸载对应子树/应用，并由 `useLibraryStyleIsolation` 缓存并移除本会话注入的**静态 / Vite 全局样式表**（CSS-in-JS 运行时表不拆，避免缓存错乱）。shadcn 等与外壳共享 Tailwind 的区域需 root scope。不承诺零泄漏；不做全站 iframe 沙箱。默认 L1（懒加载 + 单挂载 + 全局 CSS 生命周期）；某库仍明显污染时再对该库做前缀 / popup 容器或 Showcase 级 iframe 例外，不先上微前端。
**与 Theme Mode**：换库**不**清除全站 Theme Mode，也**不**因卸库而移除 `html.dark`（仅 Mode 变为 light 时移除）。各库官方 dark 的 Provider / `data-theme` 等仍挂在该库 Showcase 根或入口上，由同一 Mode 驱动。
**工具类碰撞**：Vuetify / Vuestic 等带 `!important` 的全局 utility（如 `.bg-white`）必须经 Vite 前缀到各自 island 根（`.vuetify-island` / `.vuestic-island`），否则会覆盖壳 Tailwind（暗色 Mode 下顶栏被刷白、浅字不可读）。
**Vanilla / daisyUI（S4）**：落地顺序为先与壳同构建 Tailwind + daisy 插件并 root scope（近 S1）→ 污染明显再独立 CSS 入口（近 S3）→ 仍失败才对该库 Showcase iframe（近 S2）。验收红线：壳的导航/控件不得变成 daisy 皮；离开 Vanilla 后 daisy 主题/组件类不得残留影响 React/Vue Showcase；不得把 daisyUI 配成全站主题（全站 Mode 由壳与 `html` class 拥有，daisy 仅映射到其 Showcase 根 `data-theme`）。
**Vanilla / Bootstrap·Bulma（策略 B）**：各库独立 CSS 异步入口 + 离开时卸表 + 尽量 root scope / 容器限定；**不**默认 iframe。验收红线同 daisy：壳不变皮；离开后不得残留影响 React/Vue；红线不过再对该库单独升 iframe（例外，不改全站策略）。Bootstrap 官方 JS 须与样式同生命周期（挂载 init、卸载 dispose）。Bootstrap dark 用官方 `data-bs-theme` 映射全站 Mode。
_Avoid_: 多库同时挂载; 全站 iframe; 为隔离上完整微前端框架; 本批为新库默认上 iframe; 拆除 Emotion/antd cssinjs 节点; 首版就为 daisyUI 上 iframe; daisy 进全局 theme 污染壳; Bootstrap/Bulma 默认 iframe; 卸库时误清全站 Theme Mode / `html.dark`

**Delivery Stack** (交付技术栈):
单一 Vite 应用：React 外壳（React Router、TypeScript、pnpm）与 Vue Island 共存，构建启用 React + Vue 双插件。领域状态与注册表放在框架无关模块；各 Vue 候选 Showcase 源码与样式走各自异步入口，避免访问 React 库时下载 Vue 运行时与无关库样式。不改为 Next.js/SSR，不拆同域双主应用，不为 Vue 多库先上 workspace 多包。
_Avoid_: Next.js 作为主框架; 双 Vite 主应用/iframe 宿主; 仅为多 Vue 库就拆 monorepo 多包; 把全部 Vue 库打进首屏公共包

**Vue Island** (Vue 岛):
在 React App Shell 内、仅当当前 Candidate Library 属于 Vue 时，于 Showcase 区域挂载的独立 Vue 应用实例；切换走时 unmount。外壳、路由、Library Profile 仍由 React 负责。
_Avoid_: 把整个站点改成 Vue; 用 iframe 充当默认 Island; 微前端编排框架

**UI Language** (界面语言):
中文为主；技术专有名词保留英文（如 License、TypeScript、GitHub stars）。业务层文案（字段、列、按钮、校验、角色/状态标签）全部中文且跨库一致。候选库若有官方中文 locale（如 Element Plus `zh-cn`、Arco/Semi 中文包）则接入；无完整官方中文时（如 Mantine 部分内置串）允许保留库默认语言，不强制覆盖所有可见 chrome，也不做 a11y 全文案中文化。不做完整中英切换 i18n。
_Avoid_: 全站英文; 完整 i18n; Vue 侧默认英文 locale 导致观感对比失真; 为凑「全中文」把本批做成翻译工程; 业务层中英混用双标准

**Theme Mode** (主题模式):
全站唯一的亮/暗观看模式，取值仅 `light` | `dark`（无 `system`）。**产品目的是选型对比**：在同一 Form/Table Showcase 上对比各库**官方默认** light 与 dark 观感，不是给本站做阅读主题或设计 token 工厂。默认 `light`。外壳与当前 Showcase **同步跟随**同一 Mode；换 Framework / Candidate Library 时**继承**当前 Mode，不重置。持久化：`localStorage`；**不进 URL**（路由真源仍是库身份）。DOM：`dark` 时在 `document.documentElement` 上挂 `class="dark"`，`light` 时移除；`index.html` 内同步脚本在首屏前读 LS 写 class，减少 FOUC。各库必须用**该库官方文档推荐的** light/dark 方式映射同一 Mode（ConfigProvider / palette / `data-theme` / `data-bs-theme` / `darkModeSelector` 等）；禁止手写伪 dark 凑数。**全量 Candidate 官方映射就绪后才上线**开关；不做半支持、不做「当前库无 dark 则禁用开关」。
_Avoid_: 跟随系统; 每库或每框架一份 Mode; 仅壳或仅 Showcase 单侧切换; URL query/path 携带 theme; 手写覆盖色冒充官方 dark; 渐进半支持导致壳 dark、Showcase light 撕裂

**Theme Toggle** (主题切换控件):
App Shell 顶栏的 sun/moon 图标按钮，一键在 `light` ↔ `dark` 间切换。中立 Tailwind 实现，不用任一 Candidate 组件。`aria-label` / 提示文案中文（如「切换为暗色」/「切换为亮色」）。
_Avoid_: 放进 Library Profile; 仅快捷键无常驻 UI; 用分段文案强占主切换带; 候选库 Button/Switch 做外壳控件

**Theme Mode Expansion** (主题模式扩展):
在既有多框架对比台之上，新增全站 Theme Mode + Theme Toggle，并要求当前 Switcher 内全部 Candidate Library 完成官方 light/dark 映射后一并交付。不改变 Primary Goal、Showcase Scenario、Style Isolation 主策略与 Library Route 形态。
_Avoid_: 只接部分热门库就开开关; 把本站做成通用 dark-mode 演示站; 借扩展重做推荐引擎/并排对比

**Showcase Data** (展示数据):
用户管理的业务实体数据（User 列表）存在于浏览器内存、且跨 Framework / Candidate Library 共享同一份；React Showcase 与 Vue Island 读写同一领域状态。支持新建/编辑写回、删除移除；刷新后恢复初始种子数据。无后端、无登录、无权限。筛选关键字、页码、Modal 开闭等纯 UI 状态由各 Showcase 自持，切换库或框架时可不保留。
_Avoid_: 纯死展示按钮; localStorage/后端持久化; 每库或每框架各一份互不同步的业务数据; 把 UI 瞬态强行做成全局共享

**Library Route** (组件库路由):
当前 Framework 与 Candidate Library 同步到 URL path：`/libs/:framework/:libraryId`（如 `/libs/react/mui`、`/libs/vue/element-plus`、`/libs/vue/vuetify`、`/libs/vanilla/daisyui`、`/libs/vanilla/bootstrap`），可分享、刷新保持。站点默认 `/libs/react/ant-design`；`/libs/react`、`/libs/vue`、`/libs/vanilla` 回落到该框架默认库（React→ant-design，Vue→element-plus；Vanilla→daisyui）；无效组合回退到默认。v1 旧路径 `/libs/:libraryId` 按该 id 所属框架重定向到 `/libs/:framework/:libraryId`。扩展库 id 固定 kebab-case（如 `arco-design`、`naive-ui`、`ant-design-vue`、`vuetify`、`primevue`、`shadcn-vue`、`vuestic-ui`、`flowbite-vue`、`quasar`、`volt-ui`、`reka-ui`、`daisyui`、`bootstrap`、`bulma`）。跨框架切换时的「会话内上次库」是导航辅助，不写入 URL 以外的持久化。
_Avoid_: 仅内存 state 不进 URL; framework 只放 query; 扁平混排 id 却假装有框架维度; 强制先选手动空态; localStorage 持久化上次选择（非必要）; 用 npm scope 包名当 path; 为同一库维护多个别名 id

**User** (用户):
Showcase 中的领域实体。字段：姓名、邮箱、角色（管理员/编辑/访客）、状态（启用/禁用）、入职日期、备注。全部 Candidate Library 共用同一字段语义与校验规则。
_Avoid_: 头像上传、部门树、权限矩阵、导入导出

**V1 Scope** (第一版范围):
已交付：可切换的三库（React）用户管理观感对比台：中立外壳、Form/Table Showcase、内存 CRUD、Library Profile、URL 同步。v1 本身不做并排对比、推荐引擎、多框架真机、暗色、i18n、后端、全站 iframe/微前端、专业 a11y/bundle 实验室、专门移动端适配。（亮暗切换见后续 **Theme Mode Expansion**，不回溯改写 v1 已交付边界的历史表述以外的产品承诺。）

**Multi-framework Expansion** (多框架扩展范围):
已交付的基建：Framework-first 双级切换、Supported Framework 真机 React + Vue + Vanilla、React Shell + Vue Island、共享 Showcase Data、URL `/libs/:framework/:libraryId`。Vue / Vanilla 候选批次见对应 Expansion 词条。亮暗对比见 **Theme Mode Expansion**（决议中/落地中）。仍不做：并排对比、推荐引擎、完整 i18n、后端、iframe/微前端框架、a11y/bundle 实验室、外壳改 Vue、专门移动端适配、以 headless 原语库冒充 Vanilla。
_Avoid_: 把站点做成跨框架百科；Framework=`headless`；把 Radix/Reka 等真 headless 塞进 Vanilla

**Framework** (框架):
候选组件库所属的**运行时**维度，不是组件架构标签。Supported Framework 为 React、Vue 与 Vanilla。采用「先框架、再组件库」：Framework 是硬筛选，不与跨框架库扁平混排。用户通常在运行时已定的前提下选型组件库。
_Avoid_: 把 Framework 与 Library 同级平铺混选；用 headless/CSS-only/copy-source 等架构词充当 Framework id；暗示跨运行时库可凭观感直接对标选型

**Supported Framework** (支持的框架):
真机 Showcase 覆盖 React、Vue 与 Vanilla。档案仍可提及他框架事实，但不提供未列入 Supported Framework 的真机（如未决议的 Angular/Svelte）。
_Avoid_: 扁平跨框架对比台；未决议的 Angular/Svelte 等真机；用「headless」作为第四 Framework

**Vanilla** (Vanilla 框架):
第三 Supported Framework，id 固定为 `vanilla`（Switcher 展示名可用「Vanilla」或「HTML/CSS」）。表示 Showcase 业务 UI **不依赖** React/Vue **组件库绑定**：以 CSS class / 原生 HTML 等交付默认可对比观感。用于归类 **CSS-only Library**；路由形如 `/libs/vanilla/daisyui`。Profile 可写明「可嵌入 React/Vue 工程」，真机证明方式是「无组件框架绑定」，不是双挂 React+Vue 两套 Candidate。App Shell 仍为 React，不因此改成纯静态站。
_Avoid_: 命名为 headless；把 Vanilla 库再复制进 react/vue 候选集；用 Vanilla 承载无默认观感的 headless 原语库；声称外壳也与 React 无关

**CSS-only Library** (CSS 向组件库):
入会标准（H2）：UI 交付不依赖 React/Vue 组件包——典型为 Tailwind 插件/语义 class、经典 CSS 框架（如 Bootstrap）、纯 CSS 框架（如 Bulma）等；可选含 Web Components。与真 headless（无默认样式的行为原语）不同：本类**有默认可对比观感**。「CSS-only」在本站是入会篮名称，**允许同一 Candidate 自带的轻量 JS / data-api**（如 Bootstrap 官方 Modal），不要求零字节 JS。一律归属 Framework=`vanilla`，每库单独决议后进入 Candidate，不从 Vue ui-libs 排除名单自动导入。
_Avoid_: headless；与 shadcn（复制源码 + 框架原语）混称；未决议就进 Switcher；把「CSS-only」理解成禁止该库官方 JS；为 Bootstrap 另开 Framework 或子类名词

**Vanilla Showcase** (Vanilla 展示实现):
实现默认 **V2**：允许用 React 仅作「DOM 打印机」（JSX / `className` 输出该库语义 class），并读写共享 Showcase Data。禁止：该库的 React/Vue 封装层（若有）、其它 Candidate 的组件、用 Radix/Headless UI/Reka 等行为原语凑 Modal/Table/Form。交互优先该库官方模式：纯 CSS 库用 class + 原生 HTML/轻量 DOM；**带官方 JS 的库（如 Bootstrap）用该库自带 JS**，挂载 init、卸载 dispose。场景仍全对齐 Form/Table/Modal/User，不得缩水。验收语义对齐「业务 UI 无组件库绑定」，不要求 Showcase 源码零 React。本批不引入 Bootstrap Icons 等非必要图标包；操作与关闭用文案即可。
_Avoid_: V1 纯手写 DOM 作为强制标准；V3 未提供 WC 时硬上 Web Components；引入第二套 UI 框架补交互；Vue Island 承载 Vanilla（除非未来决议）；用原生 dialog 顶替 Bootstrap 官方 Modal 导致观感失真（已决议用官方 JS 时）

**Framework Switcher** (框架切换器):
外壳上用于选择当前 Framework 的控件，与 Library Switcher 分层展示（先框架、后组件库）。展示顺序固定：React → Vue → Vanilla；Vanilla 展示名与 id 一致为「Vanilla」（不用「HTML/CSS」或「headless」作 Switcher 文案）。切换框架时进入该框架下的目标库：优先恢复本会话内该框架上次选中的 libraryId，否则用框架默认库；以 URL 为刷新后的唯一真源。站点默认框架仍为 React，不因新增 Vanilla 而改变。
_Avoid_: 与库扁平混在一个无分组长列表；用框架切换暗示推荐某一组件库；Switcher 文案写 headless；把 Vanilla 排到默认首位以推广

**Library Switcher** (组件库切换器):
在当前 Framework 下，用户一次只选择一个候选组件库；页面渲染该库的 Showcase 与 Library Profile。与 Framework Switcher 组成两级控件；即便某框架仅一个候选库，仍保留库级展示（可仅一项），不把「框架」与「库」合成一层。不做并排双库对比。
_Avoid_: 并排对比, side-by-side, 双栏模式；跨框架扁平混排；单库时删掉库层导致框架=库


**Candidate Library** (候选组件库):
某一 Framework 下用于 Showcase 的组件库集合。React：`ant-design`、`mui`、`shadcn`、`arco-design`、`semi-design`、`mantine`。Vue（决议全集，串行注册到位前 Switcher 可能尚未全部出现）：`element-plus`、`naive-ui`、`ant-design-vue`、`arco-design-vue`、`vuetify`、`primevue`、`shadcn-vue`、`vuestic-ui`、`flowbite-vue`、`quasar`、`volt-ui`、`reka-ui`。Vanilla（决议全集，串行注册到位前 Switcher 可能尚未全部出现）：`daisyui`、`bootstrap`、`bulma`。Ant Design（React）与 Ant Design Vue 为两个 Candidate Library；React `shadcn` 与 Vue `shadcn-vue` 亦为两个；`primevue` 与 `volt-ui` 亦为两个，不合并。架构上按可扩展注册；每框架清单单独决议，不按「知名度」或外部目录无限扩容。
_Avoid_: 全量组件库目录；把不同 Framework 的库当成同一候选集；把 Ant Design 与 Ant Design Vue、shadcn 与 shadcn-vue、primevue 与 volt-ui 当成同一 Candidate Library；把 CSS-only 库挂进 react/vue；本批塞入未决议库

**React Candidate Expansion** (React 候选扩展):
在已有 React 三库之上，新增 Arco Design、Semi Design、Mantine 三个 React Candidate Library 的真机 Showcase 与 Library Profile。场景全对齐；React Switcher 顺序：Ant Design → MUI → shadcn/ui → Arco Design → Semi Design → Mantine；默认库仍为 Ant Design。
_Avoid_: 借扩展之名加新框架；用档案页代替真机 Showcase；把默认库换成新库以「推广」某候选

**Vue Candidate Expansion** (Vue 候选扩展):
在 Element Plus 之上，首批 Vue 扩展新增 Naive UI（`naive-ui`）、Ant Design Vue（`ant-design-vue`）、Arco Design Vue（`arco-design-vue`）。均以 Vue Island 挂载；Showcase Scenario / Form / Table / Form Chrome / Showcase Data / User **全对齐**；Vue 默认库仍为 Element Plus。后续批次见 **Vue ui-libs Candidate Expansion**。
_Avoid_: Vue 库缩水场景；把 Ant Design Vue 与 React Ant Design 合成一项；一次收尽所有 Vue 生态库

**Vue ui-libs Candidate Expansion** (Vue ui-libs 候选扩展):
以 [UI Lib Picker](https://ui-libs.vercel.app/) 为 **候选来源**（非产品形态对齐、非整表搬迁），在已有 Vue 四库之上串行新增五个真机 Candidate Library：`vuetify` → `primevue` → `shadcn-vue` → `vuestic-ui` → `flowbite-vue`。每库 Form/Table/Modal/Profile/共享 Showcase Data **全对齐** 后才注册进 Switcher/路由；Vue 默认库仍为 Element Plus；Switcher 在既有四库之后按上序追加。`shadcn-vue` 与 React `shadcn` 同口径：复制场景所需组件源码进仓库（非传统 npm 全家桶）。样式隔离默认 L1（污染再按库加强，不上默认 iframe）。界面语言 C1（业务中文 + 有则官方 locale）。各库官方默认观感所需最小 icon/font 按库引入（K1），不统一跨库图标。本批当时排除（ui-libs 差额内）：Reka UI、Ark UI、Daisy UI、Nuxt UI、Quasar、Volt UI——其中 Quasar / Volt / Reka 由 **Vue ui-libs Remainder Expansion** 纳入真机；Nuxt UI 仍排除（宿主 TW 栈）；Daisy 仍不进 Vue。已重叠的 Element Plus / Naive UI / Ant Design Vue 不重做。Daisy UI 等 CSS-only 见 **Vanilla Candidate Expansion**。
_Avoid_: 把本站改成特性/组件清单筛选站；整表搬迁 ui-libs；占位或缩水场景；半成品进 Switcher；默认 iframe；改默认库以推广新候选

**Vue ui-libs Remainder Expansion** (Vue ui-libs 差额扩展):
在 ui-libs 五库批（已交付）之后，按 ui-libs 相对本站 Vue 轴的**剩余差额**串行补齐真机 Candidate：`quasar` → `volt-ui` → `reka-ui`。Switcher 挂在既有 Vue 九库之后按该序追加；默认库仍 `element-plus`。门槛与现网一致：Form/Table/Modal + 共享 Showcase Data + Profile + **官方 light/dark 映射**全齐才注册；禁止半成品。Quasar：Vue Island 内官方插件/组件，非 CLI 整站、非默认 iframe。Volt：独立 Candidate，不与 `primevue` 合并；场景组件复制进仓。Reka：headless，Showcase 使用 **Documented Example Skin**；Profile 与页内短提示标明非 npm 默认主题。**Nuxt UI 不纳入本批交付**（`@nuxt/ui` v4 要求 Tailwind v4 与现网 TW3 管道冲突；不上 iframe、不升全站 TW4）。Daisy UI **不**纳入本扩展的 Vue 轴，维持 Vanilla。Primary Goal 全文不改；仅 Reka 作局部例外标注。
_Avoid_: 差额五库含 Daisy 双挂 Vue；Reka 自研皮或裸奔却声称默认主题；Nuxt/Quasar 默认 iframe；Volt 并入 primevue；整表搬迁 ui-libs；改 Primary Goal 为全局「演示观感」；改默认库推广新候选；为 Nuxt UI 强行升 Tailwind v4

**Documented Example Skin** (文档示例皮):
headless / unstyled 库在本站 Showcase 上采用的、复刻**该库官网文档示例**的样式层（非 npm 包自带的默认主题）。仅在决议明确允许时使用（本批：`reka-ui`）；必须在 Library Profile 与 Showcase 短提示中披露，避免被当成「官方默认观感」。
_Avoid_: 本站自研中立皮冒充库默认；文档皮却不披露；把 Documented Example Skin 推广为所有库的默认策略

**Vanilla Candidate Expansion** (Vanilla 候选扩展):
选型原则 **D**：热度初筛 + 范式差异 + 中后台 Form/Table/Modal 能落地；非热度百科。范式槽位：T0 Tailwind 语义 class（已有 `daisyui`）+ 本批 **T1 经典全家桶** + **T2 纯 CSS**；本批不做 T3 Web Components、T4 classless、T5 第二套 Tailwind 组件层。
- **探路批（已交付）**：`daisyui`；默认库 = `daisyui`；隔离 S4。
- **第二批（决议，串行落地）**：`bootstrap`（Bootstrap 5，T1，官方 JS）→ `bulma`（Bulma，T2，class + 原生逻辑）。每库 Form/Table/Modal/Profile/共享 Showcase Data **全对齐** 后才注册进 Switcher/路由。Switcher 顺序：`daisyui` → `bootstrap` → `bulma`。默认库仍 `daisyui`。Bootstrap/Bulma 隔离策略 B；不引入 Bootstrap Icons。
- **明确排除**：Flowbite/Preline 等 T5；Pico/Water.css 等 T4；Shoelace 等 T3；真 headless；AdminLTE/Tabler 等模板向；Foundation 等老化小众；Vanilla 轴不新增 `flowbite`（Vue 仅 `flowbite-vue`）；三库均不注册进 react/vue。
_Avoid_: 空 Vanilla 框架无库；半成品进 Switcher；用 headless 原语库充数；改站点默认框架或默认库以「推广」；本批塞 T3/T4/T5；Bootstrap/Bulma 默认 iframe；为热度堆第二套 Tailwind 皮

**Showcase Scenario** (展示场景):
唯一业务场景为「用户管理」：表格为主展示用户列表；通过 Modal 打开表单进行新建/编辑。全部 Candidate Library 共用同一字段、列、校验语义与文案；任一库不得降级场景。
_Avoid_: 多业务场景切换；页内常驻表单；Drawer 表单；Vue 专用缩水场景

**Form Chrome** (表单容器):
承载 Form Showcase 的容器固定为 Modal（弹窗）。列表提供「新建」；行操作提供「编辑」（回填）与删除类操作。
_Avoid_: Drawer, 页内嵌表单（非 v1）
