# 第三 Framework 为 Vanilla，承载 CSS-only 库（非 headless）

在 React/Vue 之外增加 Supported Framework id=`vanilla`（Switcher 文案「Vanilla」，顺序 React → Vue → Vanilla），用于 **CSS-only Library**（运行时不绑 React/Vue 组件包、有默认可对比观感，如 daisyUI）。不把 Framework 命名为 headless：headless 是架构标签且多无默认观感，与本站「观感对比」主目标及「Framework=运行时轴」定义冲突。跨框架叙事靠 Vanilla 真机证明「无组件库绑定」+ Profile 可写可嵌入，不双挂 react/vue 两套 Candidate。Showcase 实现 V2（React 可作 DOM 打印机，禁第二套 UI 库/行为原语凑交互）。首批仅 `daisyui` 探路，默认库同之；样式隔离 S4（先同 Tailwind+scope，污染再独立 CSS，再 iframe）。Daisy UI 不进 Vue ui-libs 批次。站点默认仍 `/libs/react/ant-design`。
