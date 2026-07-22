export type FrameworkId = 'react' | 'vue'

export type LibraryId = 'ant-design' | 'mui' | 'shadcn' | 'element-plus'

export interface FrameworkMeta {
  id: FrameworkId
  name: string
  defaultLibraryId: LibraryId
}

export interface LibraryProfile {
  id: LibraryId
  framework: FrameworkId
  name: string
  /** Display string for profile card */
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

export const FRAMEWORKS: FrameworkMeta[] = [
  { id: 'react', name: 'React', defaultLibraryId: 'ant-design' },
  { id: 'vue', name: 'Vue', defaultLibraryId: 'element-plus' },
]

export const DEFAULT_FRAMEWORK_ID: FrameworkId = 'react'
export const DEFAULT_LIBRARY_ID: LibraryId = 'ant-design'

export const LIBRARIES: LibraryProfile[] = [
  {
    id: 'ant-design',
    framework: 'react',
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
    framework: 'react',
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
    framework: 'react',
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
  {
    id: 'element-plus',
    framework: 'vue',
    name: 'Element Plus',
    frameworks: 'Vue 3',
    starsSnapshot: 26000,
    license: 'MIT',
    homepage: 'https://element-plus.org',
    docs: 'https://element-plus.org/zh-CN/component/overview.html',
    githubRepo: 'element-plus/element-plus',
    activity: 'Vue 3 中后台常用方案，Element UI 继任者，中文文档完善',
    bundleSize: '全量偏大，可按需引入',
    typescript: '一等支持',
    styling: 'CSS Variables + SCSS（默认主题可配置）',
    tagline: 'Vue 生态企业中后台组件库，默认观感完整、文档友好。',
  },
]

export function isFrameworkId(id: string | undefined): id is FrameworkId {
  return FRAMEWORKS.some((f) => f.id === id)
}

export function isLibraryId(id: string | undefined): id is LibraryId {
  return LIBRARIES.some((lib) => lib.id === id)
}

export function getFramework(id: FrameworkId): FrameworkMeta {
  return FRAMEWORKS.find((f) => f.id === id) ?? FRAMEWORKS[0]
}

export function getLibrary(id: string | undefined): LibraryProfile {
  return LIBRARIES.find((lib) => lib.id === id) ?? LIBRARIES[0]
}

export function getLibrariesForFramework(framework: FrameworkId): LibraryProfile[] {
  return LIBRARIES.filter((lib) => lib.framework === framework)
}

export function libraryPath(framework: FrameworkId, libraryId: LibraryId): string {
  return `/libs/${framework}/${libraryId}`
}

export function defaultPath(): string {
  return libraryPath(DEFAULT_FRAMEWORK_ID, DEFAULT_LIBRARY_ID)
}

/** Resolve a valid library for the given route segments; invalid combos fall back. */
export function resolveRouteLibrary(
  framework: string | undefined,
  libraryId: string | undefined,
): LibraryProfile {
  if (isFrameworkId(framework) && isLibraryId(libraryId)) {
    const lib = getLibrary(libraryId)
    if (lib.framework === framework) return lib
  }
  if (isFrameworkId(framework)) {
    return getLibrary(getFramework(framework).defaultLibraryId)
  }
  return getLibrary(DEFAULT_LIBRARY_ID)
}
