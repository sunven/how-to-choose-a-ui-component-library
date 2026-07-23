# 多 UI 组件库共存下的样式隔离：技术调研与落地建议

- **日期**: 2026-07-23
- **仓库**: how-to-choose-a-ui-component-library
- **类型**: 一手资料调研（MDN / CSS 规范向文档 / 官方库文档 / 官方微前端文档）+ 本仓现状对照

## 1. 研究问题

本站是 **UI 组件库选型台**：中立 React App Shell + 多候选库（React Showcase / Vue Island）渲染同一 Form/Table 场景。当前隔离策略为 **L1 单挂载**（同时只挂一个库；CSS 按 showcase 入口引入；shadcn root scope；Vuestic 用 PostCSS 前缀）。产品明确暂不采用微前端编排框架与全站 iframe。

用户追问：**微前端是否能解决样式隔离？** 若不能自动解决，可选方案与对本产品的分阶段推荐是什么？

本调研覆盖：

1. 多库同页或可切换时的 **样式隔离技术**（cascade、CSS Modules、prefix、@layer、Shadow DOM、iframe、Constructable Stylesheets、库原生 prefix/ConfigProvider）。
2. **微前端**（qiankun、single-spa、Module Federation、iframe 系）对 CSS 隔离的 **官方表述**；澄清「微前端 ≠ 自动 CSS 隔离」。
3. 隔离下的 **Portal / Teleport** 问题（antd、Element Plus、MUI、Vue）。
4. 对本产品（对比台，非多团队交付）的 **取舍**。
5. 尊重现有 ADR 的 **分阶段推荐方案**。

---

## 2. Executive Summary（结论先行）

1. **微前端框架不会 magically 隔离 CSS。**  
   - **single-spa** 明确把 scoped CSS / unmount CSS / prefix 等交给应用侧实现，并单独写了 Ecosystem CSS 文档。  
   - **qiankun** 把「Style Isolation」列为特性，但 **默认并不等于强隔离**；需要显式打开 `sandbox.strictStyleIsolation`（Shadow DOM）或 `experimentalStyleIsolation`（选择器加前缀），且后者对 `@keyframes` / `@font-face` 等 **不重写**。  
   - **Webpack Module Federation** 解决的是 **跨构建的模块共享与运行时加载**，官方概念页 **不提供 CSS 沙箱承诺**。  
   - **iframe** 才是浏览器级 **文档隔离**（独立 Document / CSSOM），与是否叫「微前端」无关。

2. **对本产品，L1 单挂载仍然是正确默认档。**  
   产品语义是「一次只看一个库」；与 qiankun 的 `singular` 默认、以及 single-spa 的「lazy load + 可选 unmount CSS」方向一致，但 **不需要** 引入 HTML Entry、JS 沙箱、独立部署链路。现有 ADR 0004 / CONTEXT Style Isolation 与一手资料 **不冲突**。

3. **真正会「脏」的路径是：全局 CSS 常驻 + 弹层挂到 `document.body`。**  
   切换库时 Vite 注入的库 CSS 通常 **不会自动卸载**；Modal/Select 等默认 portal 到 body，会逃出任何「只在 mount 根上加 class」的 scope。这是对比台的主风险，不是「缺 qiankun」。

4. **推荐路线（摘要）**：  
   - **Phase 0**：维持 L1；建立污染回归清单。  
   - **Phase 1**：按库 **卸载 CSS / 清理 body 上残留 portal**（CONTEXT 已写「污染再加强」）。  
   - **Phase 2**：对顽固全局工具类库继续 **选择性 `postcss-prefix-selector` / 库原生 prefix**（Vuestic 已示范）。  
   - **Phase 3**：仅对 **无法接受的污染库** 做 **Showcase 级 iframe**（非全站、非默认）。  
   - **明确不做**：全站微前端框架、全库默认 Shadow DOM、默认全站 iframe、为隔离重做 monorepo 多应用。

---

## 3. 本仓当前状态（本地上下文）

> 以下来自仓库实现与 ADR，**不是** Web 主张。

| 项 | 现状 |
| --- | --- |
| 产品语义 | 用户一次只看一个 Candidate Library；无并排双库 |
| 挂载 | `LibraryPage` lazy + `Suspense`；Vue 侧 Island `createApp` / `unmount` |
| CSS 入口 | 各 showcase `mount.ts` / Showcase 文件内 `import '...css'`（如 Element Plus、Arco、Semi、Mantine、Vuestic、Vuetify…） |
| Shell | 中立 Tailwind（ADR 0003）；与候选库组件隔离 |
| shadcn | `src/styles/index.css` 中 `.showcase-shadcn` / `.showcase-shadcn-vue` token scope |
| Vuestic | `vite.config.ts` 中 `scopeVuesticCss`：用 `postcss-prefix-selector` 将易与 Tailwind 冲突的选择器挂到 `.vuestic-island`；纯 `.va-*` 保留以便 teleport/modal |
| 明确非目标 | 全站 iframe、完整微前端框架（ADR 0004、CONTEXT Style Isolation、多份 expansion ADR） |
| 已知缺口 | 切换库后 **不主动移除** 已注入的 `<style>` / link；多数库 **未配置** `getPopupContainer` / `append-to` 到 showcase 容器；L1 接受少量全局残留 |

相关本地文件：

- `docs/adr/0004-style-isolation-single-mount.md`
- `CONTEXT.md` → **Style Isolation**
- `vite.config.ts` → `scopeVuesticCss`
- `src/shell/LibraryPage.tsx` → lazy 单挂载

---

## 4. 隔离技术矩阵

强度为相对等级（同文档内比较），**非** 可量化安全评分。

| 技术 | 机制（一手要点） | 隔离强度 | Portal / Teleport 风险 | 对本站成本 | 适用场景 |
| --- | --- | --- | --- | --- | --- |
| **CSS 级联 / 特异性** | Cascade 按 origin → layer → 特异性 → 出现顺序决定胜负；不提供命名空间 | 弱 | 弹层进 body 后与 shell/他库全局规则互抢 | 低（现状） | 只靠「不同时挂载」降低冲突概率 |
| **CSS Modules** | 本地 class 默认编译为唯一哈希；组合导出；**不** 自动改造第三方全局 CSS | 中（自写样式）/ 弱（库 CSS） | 第三方 popup class 仍是全局 | 中（改业务 CSS；难改 node_modules 全量） | 自有 shell / 自有组件；不适合「整库 CSS」 |
| **postcss-prefix-selector** | 给选择器加容器前缀；`:root`/`body`/`html` 常被 **替换** 为 prefix（可配置 transform） | 中–强（全局表） | **高**：popup 若挂 body 且前缀只在 island 上，样式丢失；Vuestic 策略是 component 选择器不前缀 | 中（已有先例） | 工具类/重置类污染 shell（本仓 Vuestic） |
| **CSS Cascade Layers (`@layer`)** | 层间优先级由声明顺序决定；**未分层** 的普通声明高于分层声明；**不** 阻止选择器匹配全局 | 弱–中（控优先级） | 不解决 portal 逃逸 | 低–中 | 管理 shell vs 库的优先级，**不是** 隔离沙箱 |
| **Shadow DOM** | Shadow tree 内外 CSS 默认互不渗透；可用 constructable / `adoptedStyleSheets` 注入树内样式 | 强（边界清晰） | **极高**：默认 portal 到 light DOM `body` 会逃出 shadow；需 `getPopupContainer` 指向 shadow 内节点，或库支持 ShadowRoot（antd 类型已允许返回 `ShadowRoot`） | 高 | 单组件封装；qiankun `strictStyleIsolation` |
| **iframe（独立 Document）** | 子文档独立 CSSOM；sandbox 可限制能力 | 最强 | 弹层自然留在子文档；与父页通信靠 postMessage / 同源 API | 高（数据共享、高度、焦点、a11y） | 单库「污染不可接受」时的手术刀 |
| **Constructable Stylesheets + `adoptedStyleSheets`** | 程序化 `CSSStyleSheet`，可挂到 Document 或 ShadowRoot；**共享同一 sheet 会同步变更** | 本身不隔离；是 **加载/共享** 手段 | 取决于 sheet 挂到哪里 | 中–高 | 与 Shadow DOM 配合；或运行时增删样式 |
| **库原生 prefix / ConfigProvider** | 如 antd `prefixCls` / `iconPrefixCls`；Element Plus `namespace`（配合 `$namespace` SCSS） | 中（class 命名空间） | **仍依赖** popup 容器 API；改 prefix 往往还要改编译主题 | 中–高（每库不同、CSS-in-JS vs 静态 CSS） | 多版本 antd 同页等经典场景；本站「不同库」收益有限 |
| **运行时只挂载 + 卸载 CSS** | 单实例语义 + 移除失效 `<style>`/`link` | 中（时间维隔离） | 卸载时必须关掉 portal / unmount app | 低–中 | **对比台最优性价比档**（与 L1 同向） |

### 4.1 机制补充（一手要点）

**Shadow DOM（MDN）**  
Shadow DOM 把隐藏 DOM 树挂到 host 上；**页内 CSS 默认不影响 shadow 内部，shadow 内样式也不影响页其余部分**。可用树内 `<style>` 或 **Constructable Stylesheets** 注入。这是真正的边界封装，不是「提高特异性」。

**`@layer`（MDN）**  
用于声明 cascade layer 与层优先级。**未放入 layer 的样式，优先于 named/anonymous layer 中的普通声明。** 层解决的是「谁覆盖谁」的可控性，**不会** 让 `.el-button` 只在某子树生效。

**iframe（MDN）**  
嵌入独立浏览上下文；`sandbox` 可收紧脚本/同源等。样式隔离来自 **另一 Document**，不是选择器技巧。

**`Document.adoptedStyleSheets`（MDN）**  
挂载构造样式表；可与 `ShadowRoot.adoptedStyleSheets` 共享；变更会影响所有 adopter。用于可控注入/共享，**不等于** 自动 scope。

**postcss-prefix-selector（项目 README）**  
`.a` → `.prefix .a`；全局选择器默认被替换为 prefix；可用 `transform` 定制（本仓 Vuestic 插件即此模式）。

**CSS Modules（官方 README 概念）**  
默认 local 作用域与 composition；global 需显式。对 **第三方已编译全局 CSS** 无银弹。

---

## 5. 微前端：它们解决什么、不解决什么

### 5.1 总论

| 方案 | 核心解决的问题 | 对 CSS 的官方立场 | 是否「装上就隔离」 |
| --- | --- | --- | --- |
| **single-spa** | 多应用生命周期（load/mount/unmount）编排 | **应用必须自行 scope CSS**；推荐 CSS Modules / 容器选择器前缀 / PostCSS prefix / 框架 scoped；并讨论 **Unmounting CSS** | **否** |
| **qiankun** | 在 single-spa 思路上增强 HTML Entry、JS 沙箱，并提供可选样式隔离 | README 列 **Style Isolation**；API：`strictStyleIsolation` → Shadow DOM；`experimentalStyleIsolation` → 选择器加 `div[data-qiankun-appName]` 前缀；**@keyframes 等不重写** | **否**（需显式配置；且有限制） |
| **Module Federation** | 运行时从 remote 加载模块、共享 dependency | Webpack 概念文档描述 container/`get`/`init`/shared；**不** 描述 CSS 沙箱 | **否** |
| **iframe 微前端** | 用文档边界做集成 | 浏览器文档隔离（见 MDN iframe） | **样式上接近是**；集成成本转移到通信与 UX |

**结论句（可直接对产品对话使用）：**  
「微前端」首先是 **组织边界 / 独立部署 / 运行时集成** 的架构标签；**CSS 隔离要么是可选项（qiankun），要么是约定与工具（single-spa），要么干脆不在范围内（Module Federation）。** 只有 **iframe（或等价独立 Document）** 与 **Shadow DOM** 属于平台级样式边界。

### 5.2 qiankun（官方 API / README）

来源：qiankun README 特性列表；`start` / `loadMicroApp` 的 `sandbox` 选项（文档 v2.10.x 源）。

- 特性宣传包含 **Style Isolation** 与 **JS Sandbox**。
- `sandbox: { strictStyleIsolation: true }`：把子应用容器转为 **Shadow DOM**，「确保应用样式不泄漏到全局」。
- `sandbox: { experimentalStyleIsolation: true }`：通过 **增加选择器约束** 限制影响范围，例如：

  ```css
  /* 子应用名 react16 时 */
  .app-main { font-size: 14px; }
  /* 改写为 */
  div[data-qiankun-react16] .app-main { font-size: 14px; }
  ```

- **明确限制**：`@keyframes`、`@font-face`、`@import`、`@page` **不会被重写**。
- 默认 `start()` 的 `singular` 为 **true**（同时只渲染一个微应用）——与本站「单挂载」产品语义同向，但 **singular ≠ CSS 隔离**。
- **Portal 隐患**：Shadow 强隔离下，子应用若仍把 Modal 挂到 **外层 light DOM 的 body**，会出现「结构在外、样式进不去 / 或样式泄漏」类问题；官方 API 把隔离做在 **容器 DOM**，不自动改写 antd/Element 的 popup 容器策略。

对本站：**引入 qiankun 的收益（独立部署、HTML Entry、JS 沙箱）不是选型台痛点；样式能力要么重复本仓已有的 prefix/shadow 思路，要么带来 portal 新债。**

### 5.3 single-spa（官方 Ecosystem CSS）

来源：https://single-spa.js.org/docs/ecosystem-css/

文档要点：

1. **共享 CSS** 与 **微前端私有 CSS** 都要管理；共享设计系统应只保留一份。
2. **Scoped CSS** 推荐手段：哈希后缀（CSS Modules）、`localIdentName` 加应用前缀、data 属性、**容器 `#single-spa-application:...` 选择器前缀**、框架自带 scoped（Vue/Angular/Svelte）。
3. **PostCSS Prefix Selector** 被官方点名为 microfrontend 作用域手段（与本仓 Vuestic 插件同类）。
4. **Shadow DOM**：可行，但 **全局共享 CSS 难以下渗**；事件 retarget 等副作用需注意。
5. **Lazy Loading CSS**：随应用 load/mount 再注入。
6. **Unmounting CSS**：大型系统应在导航时 **移除不再使用的 `<style>` / `<link>`**；默认多数工具链 **只加载不卸载**。

对本站：single-spa 文档几乎是在描述 **「L1 + 可选卸载 + 可选 prefix」** 的加强版手册，而不是要求上 microfrontend 运行时。

### 5.4 Module Federation（Webpack）

来源：https://webpack.js.org/concepts/module-federation/

- 定义 remote container、`get` / `init`、shared modules 等。
- **未** 将 CSS 隔离列为 federation 职责；样式冲突仍取决于打包进页面的 CSS 如何注入与是否卸载。
- Rspack / module-federation.io 等实现同样是 **模块图与运行时加载** 层能力，不替代 Document 边界。

对本站：已是 **单 Vite 双插件** 应用；federation 解决不了 Element Plus vs Tailwind 的全局类冲突，只会增加构建复杂度。

### 5.5 iframe 系微前端

- 隔离来源：子 frame 的 Document / CSSOM（MDN）。
- 与「是否 single-spa 包一层」无关：**文档边界本身** 完成样式隔离。
- 代价：共享 `userStore`、URL 同步、焦点陷阱、resize、SEO/复制链接体验、双 React/Vue 运行时加载策略都要重新设计。

---

## 6. Portal / Teleport：隔离方案的「破口」

| 库 / 机制 | 官方行为 | 隔离含义 |
| --- | --- | --- |
| **Vue `<Teleport>`** | 可将模板片段渲染到组件 DOM 层级外；常见 `to="body"` 做全屏 Modal | 任何「只 scope 挂载根」的 CSS 前缀，**默认管不到** teleport 目标，除非目标仍在前缀容器内，或组件 class 全局可匹配 |
| **Ant Design `ConfigProvider.getPopupContainer`** | 设置 popup 容器；**默认** `() => document.body`；类型允许返回 `HTMLElement \| ShadowRoot` | 改挂到 showcase 根可保住 prefix/shadow；不改则 popup 吃全局 / 逃出 shadow |
| **Ant Design `prefixCls` / `iconPrefixCls`** | 默认 `ant` / `anticon` | 改 class 前缀防冲突；**不** 自动处理挂载点 |
| **Ant Design Modal `getContainer`** | 控制 Modal 挂载容器（组件级） | 与 ConfigProvider 策略需一致 |
| **Element Plus Dialog** | `append-to-body`（默认 false）；`append-to`（≥2.4.3，默认 `body`，会覆盖 append-to-body）；文档注明 Dialog 用 Teleport，**根节点样式建议写全局**；嵌套 Dialog 需 append-to-body | 前缀隔离与「建议全局样式」张力大；污染与逃逸双向风险 |
| **Element Plus `ConfigProvider.namespace`** | 默认 `el`，需配合 SCSS `$namespace` | 类名前缀方案，成本高 |
| **MUI Portal / Modal** | Portal 基于 `createPortal`；`container` 指定挂载点；`disablePortal` 可关闭 portal | SSR 场景文档要求 disablePortal；隔离场景应用 `container={() => showcaseRoot}` |

**实操规则（跨库）：**

1. 若使用 **选择器前缀 / Shadow**：popup 容器必须落在 **带前缀的 host / shadow 内**，或保留 **未前缀的组件级全局 class**（本仓 Vuestic 对 `.va-*` 的处理）。  
2. 若仅用 **时间维隔离（单挂载 + 卸 CSS）**：卸载前必须 **unmount 应用 / 关闭 Modal**，避免 body 残留节点 + 残留样式。  
3. **iframe** 几乎消解该问题（弹层在子文档）。  
4. 库的 **prefixCls/namespace** 不能替代 getPopupContainer/append-to。

---

## 7. 本产品可选方案（A/B/C/D…）

产品约束回顾：对比台、单用户会话、共享 Showcase Data、统一 URL、中立 shell、**非** 多团队独立发版。

### 方案 A — 维持 L1 单挂载（现状基线）

- **做法**：继续 lazy 单库；按入口 import CSS；Island unmount；shadcn root scope。  
- **优点**：实现简单；与 ADR 一致；符合「一次一个库」。  
- **缺点**：CSS 可能常驻；body portal 残留；全局工具类（历史 Vuestic）会伤 shell。  
- **适合**：默认主路径。

### 方案 B — L1 + 运行时卸载样式 / 清理副作用（时间维加强）

- **做法**：  
  - 记录每个库注入的 style 节点（Vite CSS module 的 `link`/`style`，或约定 `data-lib-styles="arco"`）。  
  - 路由切换时：先 unmount Island/React 树 → 移除该库 style → 再挂新库。  
  - 可选：切换时 `document.querySelectorAll('.ant-modal-root, .el-overlay, ...')` 防御性清理（脆弱，作兜底）。  
- **优点**：对准 single-spa「Unmounting CSS」建议；成本可控；不改架构。  
- **缺点**：CSS-in-JS 运行时缓存（emotion/antd 5）卸 DOM 不等于卸 JS 缓存；需按库验证。  
- **适合**：**Phase 1 主推**。

### 方案 C — 选择性选择器前缀 / 库原生 prefix（空间维加强）

- **做法**：仅对 **证实污染** 的库做 `postcss-prefix-selector` 或官方 namespace；popup 策略配套。  
- **优点**：本仓已有 Vuestic 成功路径；不必 iframe。  
- **缺点**：每库定制；teleport 与 `@keyframes`/字体易漏；与 experimentalStyleIsolation 同类限制。  
- **适合**：工具类泄漏、reset 污染 shell（Phase 2）。

### 方案 D — Showcase 级 iframe（文档隔离手术刀）

- **做法**：App Shell 仍同页；仅 Showcase 区域 `<iframe src="/embed/vue/element-plus">` 或 srcDoc + 同源子路由；通过 `postMessage` 同步 user CRUD。  
- **优点**：样式隔离最干净；portal 自然解决。  
- **缺点**：共享状态、高度自适应、加载水合、调试成本上升；违背「默认不上 iframe」需 **按库例外** 审批。  
- **适合**：Phase 3，**单库** 在 B/C 失败后。

### 方案 E — 全站 Shadow DOM 包裹 Showcase

- **做法**：showcase host `attachShadow`；样式 adopted 进 shadow。  
- **优点**：强边界。  
- **缺点**：几乎所有 UI 库默认 portal 到 body；要逐库改 container；全局字体/icon 字体路径、焦点、a11y 复杂；qiankun 都把 strict 当可选项而非默认银弹。  
- **适合**：不推荐作为默认；仅实验。

### 方案 F — qiankun / single-spa / Module Federation 全量微前端

- **做法**：shell + 每库独立应用 entry。  
- **优点**：独立部署（本产品不需要）。  
- **缺点**：隔离仍要 B/C/D/E 之一；构建/路由/共享数据全面重做；与 ADR 0004/0007/0012 冲突。  
- **适合**：**拒绝**（见第 8 节）。

### 方案 G — `@layer` 管理 shell vs 库优先级

- **做法**：shell 与库 CSS 分 layer，固定顺序。  
- **优点**：减轻「库 CSS 压过 shell」的特异性战争。  
- **缺点**：不阻止类名碰撞；不卸样式；不挡 portal。  
- **适合**：Phase 1 的 **辅助** 手段，非主方案。

### 方案对照（产品视角）

| 方案 | 隔离效果 | 工程成本 | 与 ADR 一致性 | 推荐优先级 |
| --- | --- | --- | --- | --- |
| A L1 | 中 | 已付 | 高 | 默认保持 |
| B 卸 CSS + 清 portal | 中→中高 | 低–中 | 高（CONTEXT 已预留） | **P1** |
| C 按库 prefix | 中高 | 中（每库） | 高（Vuestic 先例） | **P2 按需** |
| D Showcase iframe | 高 | 高 | 中（允许单库升级） | **P3 例外** |
| E 全站 Shadow | 高但易碎 | 很高 | 低 | 不推荐默认 |
| F 微前端框架 | 不确定/重复造轮 | 很高 | 低 | **拒绝** |
| G @layer | 低–中 | 低 | 可 | 辅助 |

---

## 8. 推荐计划（分阶段、可实施）

**默认立场**：一手资料 **不** 证明 L1 错误；反而 single-spa / qiankun singular 等强化了「时间维单实例」合理性。微前端框架 **不是** 本产品的样式答案。

### Phase 0 — 基线冻结与观测（0.5–1 天）

1. 保持 ADR 0004：单挂载 + 分入口 CSS + shadcn scope + Vuestic prefix。  
2. 建立 **样式污染检查清单**（手工或轻量 e2e）：  
   - 从「全局 CSS 重」的库（Vuestic / Vuetify / Element Plus / Arco / Semi）切到 shadcn / shell-only 路由，检查 shell 字号、按钮、间距是否被改。  
   - 打开 Modal/Select 后切换路由，检查 body 是否残留 overlay。  
3. 文档化每库：**CSS 形态**（全局 CSS / CSS-in-JS / Tailwind 拷贝组件）与 **popup 默认挂载点**。

**验收**：清单进 `docs/` 或 issue 模板；不改架构。

### Phase 1 — 副作用与样式生命周期（主推，1–3 天）

1. **卸载顺序标准化**（所有 Vue Island + React Showcase）：  
   `close UI state` → `app.unmount()` / React unmount → **移除本库 style 节点** → 挂新库。  
2. **CSS 卸载策略**（择一或组合）：  
   - Vite：为库 CSS 约定 `?lib=element-plus` 或包装 import，挂 `data-showcase-lib` 属性便于移除；  
   - 或切换时移除 `style[data-vite-dev-id*="element-plus"]` 等（需区分 dev/prod）。  
3. **Portal 兜底（不强制改视觉）**：  
   - 优先依赖 unmount 清掉 React/Vue 管理的 portal；  
   - 对静态方法（antd `Modal.confirm` / `message`）避免在 Showcase 使用，或确保卸载时 destroy。  
4. **可选**：将 shell 关键 utility 放入较低/较高 `@layer`，降低被库全局规则误伤概率（辅助）。

**验收**：清单中「切库后 shell 仍像 shell」；body 无跨库 overlay；无全站 iframe。

### Phase 2 — 按库空间隔离（仅污染库，每库 0.5–2 天）

触发条件：Phase 1 后仍可复现的 **shell 或下一家库** 被污染。

1. 复用 `scopeVuesticCss` 模式：  
   - 工具类/reset → 前缀到 `.${lib}-island`；  
   - **组件 class**（`.el-*` / `.arco-*`）评估：若 popup 依赖全局，则 **不要** 前缀组件选择器，或同步改 `append-to` / `getPopupContainer`。  
2. 库原生能力优先评估：  
   - antd / antdv：`getPopupContainer={() => rootEl}`；  
   - Element Plus：`append-to={rootEl}`（注意文档对全局样式的建议）；  
   - MUI：`Modal/Popper container` 或 `disablePortal`（注意 overflow/z-index）。  
3. **不要** 一上来改全库 `prefixCls`/`namespace`（成本高、收益对本站「多库不同产品」有限）。

**验收**：该库不再污染 shell；Modal 视觉与交互不回退。

### Phase 3 — Showcase 级 iframe 例外通道（仅单库，2–5 天/库）

触发条件：Phase 2 仍失败，或库同时依赖 **全局 CSS + 强制 body portal + 动态注入样式** 且无法改容器。

1. 仅包裹 Showcase 区域；Profile / Switcher 仍在父页。  
2. 同源 embed 路由，复用同一 Vite 应用子路径优先于第二部署单元。  
3. `postMessage` 同步 Showcase Data（或 embed 读 `BroadcastChannel`）；明确高度协议（`ResizeObserver` → parent）。  
4. ADR 补记：**默认仍 L1**；iframe 为 **named 例外**。

**验收**：该库与 shell 零 CSS 交叉；CRUD 仍跨库一致。

### Phase 4 — 明确不做（长期）

见第 8 节 reject list；若未来产品变成 **并排双库对比**，再重开调研（并排会推翻「时间维隔离」前提，iframe/Shadow 权重上升）。

### 实施顺序图（逻辑）

```text
[单挂载 L1] --污染?--> [卸 CSS + 清 portal] --仍污染?--> [按库 prefix / popup 容器]
                                              --仍失败?--> [该库 Showcase iframe]
         \--从未污染--> 保持 L1
禁止捷径: 一上来 qiankun / 全站 iframe / 全库 Shadow
```

---

## 9. 非目标 / 拒绝清单

| 拒绝项 | 理由 |
| --- | --- |
| 为样式隔离引入 **qiankun / single-spa 运行时 / 完整微前端框架** | 官方 CSS 能力 = prefix/shadow/约定，本仓可局部复用；框架解决独立部署与 JS 沙箱，非选型台需求 |
| **Module Federation** 作为隔离方案 | 不提供 CSS 沙箱；与单仓 Vite 模型叠床架屋 |
| **默认全站 iframe** | ADR 与 CONTEXT 明确避免；破坏统一路由与数据共享体验 |
| **默认全库 Shadow DOM** | Portal 生态不兼容成本过高 |
| **多库同时挂载 / 并排对比**（借隔离之名） | 产品非目标；会否定 L1 前提 |
| **零泄漏 SLA** | 与 ADR 0004「接受少量残留」一致；追求零泄漏应走 iframe 例外而非口号 |
| 用 `@layer` 或「提高特异性」冒充隔离 | 机制不符 |
| 为隔离拆 **多 Vite 主应用 monorepo** | ADR 0012 等已选单应用双插件 |

---

## 10. Sources（一手 / 官方）

1. MDN — Using shadow DOM: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM  
2. MDN — `@layer`: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@layer  
3. MDN — Introduction to the CSS cascade: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Cascade  
4. MDN — `<iframe>`: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe  
5. MDN — `Document.adoptedStyleSheets`: https://developer.mozilla.org/en-US/docs/Web/API/Document/adoptedStyleSheets  
6. MDN — `CSSStyleSheet()` constructor: https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet/CSSStyleSheet  
7. web.dev — Constructable Stylesheets（MDN adoptedStyleSheets 参见）: https://web.dev/articles/constructable-stylesheets  
8. CSS-Tricks — Cascade Layers Guide（机制解说，非规范正文）: https://css-tricks.com/css-cascade-layers/  
9. postcss-prefix-selector README: https://github.com/RadValentin/postcss-prefix-selector  
10. CSS Modules README: https://github.com/css-modules/css-modules  
11. single-spa — Ecosystem CSS: https://single-spa.js.org/docs/ecosystem-css/  
12. single-spa — Recommended setup: https://single-spa.js.org/docs/recommended-setup/  
13. qiankun README（含 Style Isolation 特性）: https://github.com/umijs/qiankun/blob/master/README.md  
14. qiankun API（`strictStyleIsolation` / `experimentalStyleIsolation` / `singular`）: https://cdn.jsdelivr.net/gh/umijs/qiankun@2.10.16/docs/api/README.md （站点 https://qiankun.umijs.org/ 调研时返回 DEPLOYMENT_DISABLED，故以发布标签文档源为准）  
15. Webpack — Module Federation concepts: https://webpack.js.org/concepts/module-federation/  
16. Ant Design — ConfigProvider（`prefixCls`、`getPopupContainer`）: https://ant.design/components/config-provider  
17. Ant Design — Modal: https://ant.design/components/modal  
18. Ant Design — Customize Theme（ConfigProvider / CSS-in-JS 主题）: https://ant.design/docs/react/customize-theme  
19. Element Plus — Config Provider（`namespace`、`zIndex`）: https://github.com/element-plus/element-plus/blob/dev/docs/en-US/component/config-provider.md  
20. Element Plus — Dialog（`append-to`、`append-to-body`、Teleport 说明）: https://github.com/element-plus/element-plus/blob/dev/docs/en-US/component/dialog.md  
21. Vue — Teleport: https://vuejs.org/guide/built-ins/teleport.html  
22. MUI — Portal: https://mui.com/material-ui/react-portal/  
23. MUI — Modal（`container`、`disablePortal`）: https://mui.com/material-ui/react-modal/  
24. Ant Design Vue — ConfigProvider（源码文档，`prefixCls` / `getPopupContainer`）: https://github.com/vueComponent/ant-design-vue （组件文档路径 components/config-provider）  

### 本地项目上下文（非 Web 主张）

25. `docs/adr/0004-style-isolation-single-mount.md`  
26. `CONTEXT.md` — Style Isolation / Vue Island / Delivery Stack  
27. `vite.config.ts` — `scopeVuesticCss`  
28. `src/shell/LibraryPage.tsx` — lazy 单挂载  
29. 各 `src/showcases/*/mount.ts` — 按库 CSS import 与 `createApp`  

---

## 附录 A — 给产品对话的短答

**Q: 微前端能解决样式隔离吗？**  
**A:** 不能自动解决。single-spa 要求你自己 scope/卸载 CSS；qiankun 的隔离是可选配置（Shadow 或实验性前缀）且有 CSS 规则漏洞；Module Federation 不管 CSS。真正强隔离是 **iframe 文档边界** 或 **Shadow DOM**，二者都有 portal 或集成成本。本站应用 **单挂载 + 按需卸样式 + 顽固库前缀/iframe 例外**，而不是上微前端框架。

## 附录 B — 开放问题（实现前需实证）

1. Vite 生产构建下各库 CSS 是独立 async chunk 还是被合并；卸 style 的 **稳定 DOM 钩子** 是什么。  
2. antd 5 / MUI emotion 在卸 `<style>` 后再次挂载是否重复注入或闪烁。  
3. Vuetify / PrimeVue 等对 `append-to` 的覆盖面是否足以配合 prefix。  
4. 若未来做并排对比，Phase 模型需整体重开（时间维失效）。
