export type FrameworkId = 'react' | 'vue' | 'vanilla'

export type LibraryId =
  | 'ant-design'
  | 'mui'
  | 'shadcn'
  | 'arco-design'
  | 'semi-design'
  | 'mantine'
  | 'element-plus'
  | 'naive-ui'
  | 'ant-design-vue'
  | 'arco-design-vue'
  | 'vuetify'
  | 'primevue'
  | 'shadcn-vue'
  | 'vuestic-ui'
  | 'flowbite-vue'
  | 'quasar'
  | 'volt-ui'
  | 'reka-ui'
  | 'daisyui'
  | 'bootstrap'
  | 'bulma'

export type VueLibraryId =
  | 'element-plus'
  | 'naive-ui'
  | 'ant-design-vue'
  | 'arco-design-vue'
  | 'vuetify'
  | 'primevue'
  | 'shadcn-vue'
  | 'vuestic-ui'
  | 'flowbite-vue'
  | 'quasar'
  | 'volt-ui'
  | 'reka-ui'

export type VanillaLibraryId = 'daisyui' | 'bootstrap' | 'bulma'

export type ReactLibraryId = Exclude<LibraryId, VueLibraryId | VanillaLibraryId>

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
  { id: 'vanilla', name: 'Vanilla', defaultLibraryId: 'daisyui' },
]

export const DEFAULT_FRAMEWORK_ID: FrameworkId = 'react'
export const DEFAULT_LIBRARY_ID: LibraryId = 'ant-design'
export const LIBRARY_PROFILE_SNAPSHOT_DATE = '2026-07-25'

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
    id: 'arco-design',
    framework: 'react',
    name: 'Arco Design',
    frameworks: 'React（另有 Vue 实现）',
    starsSnapshot: 5400,
    license: 'MIT',
    homepage: 'https://arco.design',
    docs: 'https://arco.design/react/docs/start',
    githubRepo: 'arco-design/arco-design',
    activity: '字节跳动开源中后台体系，组件面完整、中文文档友好',
    bundleSize: '全量偏大，可按需引入',
    typescript: '一等支持',
    styling: 'Less / CSS 变量（可主题定制）',
    tagline: '国产企业中后台另一套完整默认观感，常与 Ant Design 对照选型。',
  },
  {
    id: 'semi-design',
    framework: 'react',
    name: 'Semi Design',
    frameworks: 'React',
    starsSnapshot: 9200,
    license: 'MIT',
    homepage: 'https://semi.design',
    docs: 'https://semi.design/zh-CN/start/getting-started',
    githubRepo: 'DouyinFE/semi-design',
    activity: '抖音前端开源设计系统，中后台与设计 token 体系完整',
    bundleSize: '全量偏大，可按需引入',
    typescript: '一等支持',
    styling: 'CSS 变量 + 设计 token（可主题）',
    tagline: '设计系统感更强的中后台组件库，默认观感完整。',
  },
  {
    id: 'mantine',
    framework: 'react',
    name: 'Mantine',
    frameworks: 'React',
    starsSnapshot: 29000,
    license: 'MIT',
    homepage: 'https://mantine.dev',
    docs: 'https://mantine.dev/getting-started/',
    githubRepo: 'mantinedev/mantine',
    activity: '现代 React hooks 生态活跃，表单/日期/hooks 配套齐全',
    bundleSize: '按包拆分（@mantine/core 等），按需引入可控',
    typescript: '一等支持',
    styling: 'CSS modules / PostCSS（Mantine 样式包）',
    tagline: '现代 hooks 与 DX 路线，组件完整度高、国际项目常见。',
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
  {
    id: 'naive-ui',
    framework: 'vue',
    name: 'Naive UI',
    frameworks: 'Vue 3',
    starsSnapshot: 17000,
    license: 'MIT',
    homepage: 'https://www.naiveui.com',
    docs: 'https://www.naiveui.com/zh-CN/os-theme/docs/introduction',
    githubRepo: 'tusen-ai/naive-ui',
    activity: 'Vue 3 + TypeScript 现代组件库，API 一致性高、主题定制灵活',
    bundleSize: '按需引入友好，全量中等',
    typescript: '一等支持（源码级 TS）',
    styling: 'CSS 变量 / 主题覆盖（无预处理器强制）',
    tagline: '现代 Vue 3 DX 路线，类型友好、组件面完整。',
  },
  {
    id: 'ant-design-vue',
    framework: 'vue',
    name: 'Ant Design Vue',
    frameworks: 'Vue 3',
    starsSnapshot: 21000,
    license: 'MIT',
    homepage: 'https://antdv.com',
    docs: 'https://antdv.com/components/overview-cn',
    githubRepo: 'vueComponent/ant-design-vue',
    activity: 'Ant Design 官方 Vue 实现，企业中后台常用',
    bundleSize: '全量偏大，可按需引入',
    typescript: '一等支持',
    styling: 'CSS-in-JS / less 主题（随 antdv 版本）',
    tagline: '与 Ant Design 设计语言对齐的 Vue 企业中后台方案。',
  },
  {
    id: 'arco-design-vue',
    framework: 'vue',
    name: 'Arco Design Vue',
    frameworks: 'Vue 3',
    starsSnapshot: 3100,
    license: 'MIT',
    homepage: 'https://arco.design/vue',
    docs: 'https://arco.design/vue/docs/start',
    githubRepo: 'arco-design/arco-design-vue',
    activity: '字节跳动 Arco 的 Vue 实现，中后台组件面完整',
    bundleSize: '全量偏大，可按需引入',
    typescript: '一等支持',
    styling: 'Less / CSS 变量（可主题定制）',
    tagline: '国产中后台另一套完整默认观感的 Vue 实现。',
  },
  {
    id: 'vuetify',
    framework: 'vue',
    name: 'Vuetify',
    frameworks: 'Vue 3',
    starsSnapshot: 41000,
    license: 'MIT',
    homepage: 'https://vuetifyjs.com',
    docs: 'https://vuetifyjs.com/en/getting-started/installation/',
    githubRepo: 'vuetifyjs/vuetify',
    activity: 'Vue 生态 Material Design 长期维护方案，组件与布局体系完整',
    bundleSize: '全量偏大，可按需/树摇引入',
    typescript: '一等支持',
    styling: 'SASS / CSS 变量 + Material 主题',
    tagline: 'Material Design 风格的 Vue 组件库，国际与中后台项目常见。',
  },
  {
    id: 'primevue',
    framework: 'vue',
    name: 'PrimeVue',
    frameworks: 'Vue 3',
    starsSnapshot: 14500,
    license: 'MIT',
    homepage: 'https://primevue.org',
    docs: 'https://primevue.org/installation/',
    githubRepo: 'primefaces/primevue',
    activity: 'PrimeTek Vue 组件库，组件面宽、主题体系完整',
    bundleSize: '按组件引入可控，全量偏大',
    typescript: '一等支持',
    styling: '主题预设（Aura 等）/ 可 unstyled',
    tagline: '组件面完整的 Vue 企业级方案，默认主题观感鲜明。',
  },
  {
    id: 'shadcn-vue',
    framework: 'vue',
    name: 'shadcn-vue',
    frameworks: 'Vue 3',
    starsSnapshot: 8000,
    license: 'MIT',
    homepage: 'https://www.shadcn-vue.com',
    docs: 'https://www.shadcn-vue.com/docs/introduction',
    githubRepo: 'unovue/shadcn-vue',
    activity: '基于 Reka UI 的复制源码组件集，社区增长快',
    bundleSize: '取决于你复制了哪些组件（无统一 runtime 包体积）',
    typescript: '一等支持',
    styling: 'Tailwind CSS + Reka UI 原语',
    tagline: 'Vue 侧 shadcn 路线：可拥有、可改的组件源码，非传统 npm 全家桶。',
  },
  {
    id: 'vuestic-ui',
    framework: 'vue',
    name: 'Vuestic UI',
    frameworks: 'Vue 3',
    starsSnapshot: 3700,
    license: 'MIT',
    homepage: 'https://ui.vuestic.dev',
    docs: 'https://ui.vuestic.dev/getting-started/installation',
    githubRepo: 'epicmaxco/vuestic-ui',
    activity: 'Epicmax 维护的 Vue 组件库，中后台场景组件面完整',
    bundleSize: '全量中等偏大，可按需引入',
    typescript: '一等支持',
    styling: 'CSS 变量主题系统',
    tagline: '现代 Vue 中后台组件库，默认观感完整、文档友好。',
  },
  {
    id: 'flowbite-vue',
    framework: 'vue',
    name: 'Flowbite Vue',
    frameworks: 'Vue 3',
    starsSnapshot: 950,
    license: 'MIT',
    homepage: 'https://flowbite-vue.com',
    docs: 'https://flowbite-vue.com/pages/getting-started',
    githubRepo: 'themesberg/flowbite-vue',
    activity: 'Flowbite 的 Vue 实现，Tailwind 组件风格',
    bundleSize: '按组件引入，依赖 Tailwind 工具类',
    typescript: '一等支持',
    styling: 'Tailwind CSS（Flowbite 主题）',
    tagline: 'Tailwind 路线的 Vue 组件库，默认观感偏产品站/后台通用。',
  },
  {
    id: 'quasar',
    framework: 'vue',
    name: 'Quasar',
    frameworks: 'Vue 3（亦可配合 Quasar CLI / 多端）',
    starsSnapshot: 27000,
    license: 'MIT',
    homepage: 'https://quasar.dev',
    docs: 'https://quasar.dev/start/vite-plugin',
    githubRepo: 'quasarframework/quasar',
    activity: 'Vue 生态重型 UI + 构建体系，组件与布局完整、长期维护',
    bundleSize: '全量偏大；可按组件与插件引入',
    typescript: '一等支持',
    styling: 'Sass / CSS 变量 + Material 风格主题（含官方 Dark）',
    tagline: '框架级完整度的 Vue 组件库，默认观感偏 Material 中后台。',
  },
  {
    id: 'volt-ui',
    framework: 'vue',
    name: 'Volt UI',
    frameworks: 'Vue 3（基于 PrimeVue unstyled + 复制源码）',
    starsSnapshot: 14500,
    license: 'MIT',
    homepage: 'https://volt.primevue.org',
    docs: 'https://volt.primevue.org',
    githubRepo: 'primefaces/primevue',
    activity: 'PrimeTek 官方 Tailwind 粘贴层，与 PrimeVue 同仓维护',
    bundleSize: '取决于复制的组件；底层依赖 PrimeVue unstyled',
    typescript: '一等支持',
    styling: 'Tailwind CSS + PrimeVue PassThrough（复制进仓库）',
    tagline: 'PrimeVue 的 shadcn 式粘贴层：Tailwind 默认示例观感，与 styled PrimeVue 分列对比。',
  },
  {
    id: 'reka-ui',
    framework: 'vue',
    name: 'Reka UI',
    frameworks: 'Vue 3（unstyled 原语）',
    starsSnapshot: 6000,
    license: 'MIT',
    homepage: 'https://reka-ui.com',
    docs: 'https://reka-ui.com/docs/overview/introduction',
    githubRepo: 'unovue/reka-ui',
    activity: 'Radix Vue 后继；无默认主题的无障碍原语库，文档示例活跃',
    bundleSize: '按原语引入，无统一默认样式体积',
    typescript: '一等支持',
    styling: 'Unstyled；本站 Showcase 使用 Documented Example Skin（非 npm 默认主题）',
    tagline: 'Headless 原语：本站用文档示例皮展示可交互形态，勿当作官方默认观感。',
  },
  {
    id: 'daisyui',
    framework: 'vanilla',
    name: 'daisyUI',
    frameworks: 'HTML/CSS（可嵌入 React / Vue / 任意框架）',
    starsSnapshot: 37000,
    license: 'MIT',
    homepage: 'https://daisyui.com',
    docs: 'https://daisyui.com/docs/install/',
    githubRepo: 'saadeghi/daisyui',
    activity: 'Tailwind 语义化 class 组件层，社区活跃、主题丰富',
    bundleSize: '随 Tailwind 构建；无独立 React/Vue 运行时包',
    typescript: '不适用（CSS class 体系；TS 由宿主项目决定）',
    styling: 'Tailwind CSS 插件 + 语义组件 class（btn / table / modal 等）',
    tagline: '与框架无关的 CSS 向组件库：有默认观感，不绑 React/Vue 组件包。',
  },
  {
    id: 'bootstrap',
    framework: 'vanilla',
    name: 'Bootstrap',
    frameworks: 'HTML/CSS + 官方 JS（可嵌入任意框架）',
    starsSnapshot: 172000,
    license: 'MIT',
    homepage: 'https://getbootstrap.com',
    docs: 'https://getbootstrap.com/docs/5.3/getting-started/introduction/',
    githubRepo: 'twbs/bootstrap',
    activity: '经典 CSS 框架事实标准，组件面与文档极完整、长期维护',
    bundleSize: '全量 CSS+JS 中等；可按需拆 grid/reboot 或 tree-shake ESM',
    typescript: '官方类型（@types/bootstrap）；TS 由宿主项目决定',
    styling: '全局 CSS 工具/组件 class + 可选官方 JS（Modal 等）',
    tagline: '经典全家桶：默认可对比观感完整，不绑 React/Vue 组件包。',
  },
  {
    id: 'bulma',
    framework: 'vanilla',
    name: 'Bulma',
    frameworks: 'HTML/CSS（可嵌入任意框架）',
    starsSnapshot: 49000,
    license: 'MIT',
    homepage: 'https://bulma.io',
    docs: 'https://bulma.io/documentation/',
    githubRepo: 'jgthms/bulma',
    activity: '纯 CSS Flexbox 框架，无官方 JS，社区长期维护',
    bundleSize: '单 CSS 包中等；无 JS 运行时',
    typescript: '不适用（CSS class 体系；TS 由宿主项目决定）',
    styling: '纯 CSS 组件 class（button / table / modal 等），无预处理器强制',
    tagline: '纯 CSS 向组件层：有默认观感，交互用原生 HTML/轻量逻辑补齐。',
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
  return LIBRARIES.filter((lib) => lib.framework === framework).sort((a, b) =>
    a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }),
  )
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
