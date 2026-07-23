# Vanilla 第二批候选：Bootstrap + Bulma（T1/T2）

在 daisyUI 探路之上，按原则 D（热度 + 范式差 + 中后台可落地）扩展 Vanilla CSS-only 候选：只填 **T1 经典全家桶** 与 **T2 纯 CSS**，分别为 `bootstrap`（Bootstrap 5）与 `bulma`（Bulma）；不做 T3 WC / T4 classless / T5 第二套 Tailwind。Switcher 顺序 `daisyui` → `bootstrap` → `bulma`，默认库仍 `daisyui`；落地串行 bootstrap 全对齐后再 bulma。隔离对两库采用策略 B（独立 CSS 入口 + 卸表 + 容器限定，不默认 iframe）。Bootstrap 交互用**官方 JS**（同库交付物，挂载/卸载与样式同生命周期），Bulma 用 class + 原生逻辑；术语仍称 CSS-only，允许同一 Candidate 自带轻量 JS。不引入 Bootstrap Icons。明确排除 Flowbite-vanilla/Preline、Pico 系、Shoelace、headless、模板站与把三库挂进 react/vue。
