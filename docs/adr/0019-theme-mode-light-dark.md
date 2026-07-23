# 全站 Theme Mode（light/dark）用于选型对比

在「同一业务形态对比各库默认观感」之上，增加官方亮/暗默认观感对比。采用**全站唯一** Theme Mode（仅 `light` | `dark`，默认 `light`，无 system）：外壳与当前 Showcase 同步跟随；换框架/换库继承 Mode；`localStorage` 持久化且**不进 URL**；`document.documentElement` 上 `class="dark"` 驱动壳 Tailwind（`darkMode: 'class'`）及依赖 `html.dark` 的库；`index.html` 同步脚本首屏前读 LS 写 class，减轻 FOUC。各 Candidate 必须用**该库官方** light/dark API 映射同一 Mode，禁止手写伪 dark；**全量候选映射就绪后才上线** Theme Toggle（壳顶栏 sun/moon 图标，中立实现）。换库不清除 Mode / 不因卸库移除 `html.dark`（与 Style Isolation 边界见 CONTEXT）。

## Considered Options

- **仅壳 dark / 仅 Showcase dark / 两套独立 Mode**：放弃。与选型对比目标冲突，或造成亮壳暗内容撕裂、状态双份。
- **`system` 或 per-library Mode**：放弃。对比不可复现，或打断「dark 下连着换库」路径。
- **URL 携带 theme**：放弃。库身份仍以 `/libs/:framework/:libraryId` 为真源；query 需全站导航保真，实现面大、收益次要。
- **渐进半支持（部分库无官方 dark 仍开开关）**：放弃。全站一份 Mode + 壳同步下无法干净降级。
