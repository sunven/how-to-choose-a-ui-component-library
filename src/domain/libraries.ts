export type LibraryId = 'ant-design' | 'mui' | 'shadcn'

export interface LibraryProfile {
  id: LibraryId
  name: string
  frameworks: string
  /** Snapshot used when GitHub fetch fails */
  starsSnapshot: number
  license: string
  homepage: string
  docs: string
  githubRepo: `${string}/${string}`
  activity: string
  bundleSize: string
  typescript: string
  styling: string
  tagline: string
}

export const DEFAULT_LIBRARY_ID: LibraryId = 'ant-design'

export const LIBRARIES: LibraryProfile[] = [
  {
    id: 'ant-design',
    name: 'Ant Design',
    frameworks: 'React（另有 Ant Design Vue / Angular 等生态）',
    starsSnapshot: 94000,
    license: 'MIT',
    homepage: 'https://ant.design',
    docs: 'https://ant.design/components/overview-cn',
    githubRepo: 'ant-design/ant-design',
    activity: '企业中后台事实标准之一，版本迭代稳定、中文文档完善',
    bundleSize: '按需引入后中等偏大（企业组件面全）',
    typescript: '一等支持',
    styling: 'CSS-in-JS（antd 5 Design Token）',
    tagline: '企业级中后台组件体系，默认观感完整、规范。',
  },
  {
    id: 'mui',
    name: 'MUI',
    frameworks: 'React',
    starsSnapshot: 95000,
    license: 'MIT',
    homepage: 'https://mui.com',
    docs: 'https://mui.com/material-ui/getting-started/',
    githubRepo: 'mui/material-ui',
    activity: 'Material Design 路线长期维护，生态含 X 系列高级组件',
    bundleSize: 'Material 全量偏大，可按组件引入',
    typescript: '一等支持',
    styling: 'Emotion / CSS 变量 / 可选 Pigment CSS',
    tagline: 'Material Design 风格，国际项目常见默认选项。',
  },
  {
    id: 'shadcn',
    name: 'shadcn/ui',
    frameworks: 'React',
    starsSnapshot: 88000,
    license: 'MIT',
    homepage: 'https://ui.shadcn.com',
    docs: 'https://ui.shadcn.com/docs',
    githubRepo: 'shadcn-ui/ui',
    activity: '组件以复制源码方式进入项目，社区组件与区块增长快',
    bundleSize: '取决于你复制了哪些组件（无统一 runtime 包体积）',
    typescript: '一等支持',
    styling: 'Tailwind CSS + Radix UI 原语',
    tagline: '不是传统 npm 组件库，而是可拥有、可改的组件代码集。',
  },
]

export function getLibrary(id: string | undefined): LibraryProfile {
  return LIBRARIES.find((lib) => lib.id === id) ?? LIBRARIES[0]
}

export function isLibraryId(id: string | undefined): id is LibraryId {
  return LIBRARIES.some((lib) => lib.id === id)
}
