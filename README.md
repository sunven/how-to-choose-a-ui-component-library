# 如何选择 UI 组件库

通过**同一业务形态**（用户管理：表格 + Modal 表单）切换不同 UI 组件库，对比默认观感与交互，并查看 Library Profile（框架、GitHub stars、License 等）。

先选 **Framework**（React / Vue），再在该框架下切换 **Candidate Library**。

## 候选库

**React**（默认 `/libs/react/ant-design`）

- [Ant Design](https://ant.design) — `ant-design`
- [MUI](https://mui.com) — `mui`
- [shadcn/ui](https://ui.shadcn.com) — `shadcn`
- [Arco Design](https://arco.design) — `arco-design`
- [Semi Design](https://semi.design) — `semi-design`
- [Mantine](https://mantine.dev) — `mantine`

**Vue**（默认 `/libs/vue/element-plus`）

- [Element Plus](https://element-plus.org) — `element-plus`
- [Naive UI](https://www.naiveui.com) — `naive-ui`
- [Ant Design Vue](https://antdv.com) — `ant-design-vue`
- [Arco Design Vue](https://arco.design/vue) — `arco-design-vue`
- [Vuetify](https://vuetifyjs.com) — `vuetify`
- [PrimeVue](https://primevue.org) — `primevue`
- [shadcn-vue](https://www.shadcn-vue.com) — `shadcn-vue`
- [Vuestic UI](https://ui.vuestic.dev) — `vuestic-ui`
- [Flowbite Vue](https://flowbite-vue.com) — `flowbite-vue`
- [Quasar](https://quasar.dev) — `quasar`
- [Volt UI](https://volt.primevue.org) — `volt-ui`（与 `primevue` 分列）
- [Reka UI](https://reka-ui.com) — `reka-ui`（Documented Example Skin，非默认主题）

**Vanilla**（默认 `/libs/vanilla/daisyui`）

- [daisyUI](https://daisyui.com) — `daisyui`
- [Bootstrap](https://getbootstrap.com) — `bootstrap`
- [Bulma](https://bulma.io) — `bulma`

路由形态：`/libs/:framework/:libraryId`（例：`/libs/react/mui`、`/libs/vue/naive-ui`、`/libs/vue/quasar`）。旧路径 `/libs/mui` 会重定向到带框架前缀的路径。

Ant Design（React）与 Ant Design Vue、PrimeVue 与 Volt UI、React `shadcn` 与 Vue `shadcn-vue` 均为独立候选，不合并。

## 本地运行

```bash
pnpm install
pnpm dev
```

构建：

```bash
pnpm build
pnpm preview
```

## 部署到 Cloudflare Pages

项目已按 **Vite SPA** 配置（构建产物 `dist/`，`public/_redirects` 处理前端路由）。

### 方式 A：连接 Git 仓库（推荐）

1. 把代码推到 GitHub / GitLab  
2. [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → 导入仓库  
3. 构建设置：

| 项 | 值 |
|----|-----|
| Framework preset | Vite（或 None） |
| Build command | `pnpm install && pnpm run build` |
| Build output directory | `dist` |
| Node version | `22`（或环境变量 `NODE_VERSION=22`；pnpm 11 需要 Node ≥22） |

4. **Save and Deploy**

之后每次 push 到默认分支会自动部署。生产地址形如：

`https://how-to-choose-a-ui-component-library.pages.dev`

### 方式 B：本地直接上传

需已登录 Cloudflare（`pnpm exec wrangler login`）：

```bash
pnpm install
pnpm deploy
```

`pnpm deploy` = 构建 + `wrangler pages deploy dist`。

## 领域说明

见 [`CONTEXT.md`](./CONTEXT.md) 与 [`docs/adr/`](./docs/adr/)（含 React / Vue 候选扩展 ADR-0014、ADR-0015）。
