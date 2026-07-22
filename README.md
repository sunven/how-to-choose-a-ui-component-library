# 如何选择 UI 组件库

通过**同一业务形态**（用户管理：表格 + Modal 表单）切换不同 React UI 组件库，对比默认观感与交互，并查看 Library Profile（框架、GitHub stars、License 等）。

## v1 候选库

- [Ant Design](https://ant.design)
- [MUI](https://mui.com)
- [shadcn/ui](https://ui.shadcn.com)

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

见 [`CONTEXT.md`](./CONTEXT.md) 与 [`docs/adr/`](./docs/adr/)。
