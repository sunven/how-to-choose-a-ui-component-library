# 外壳采用 Framework + Library 两级切换

App Shell 分开展示 Framework Switcher 与 Library Switcher，不采用分组长列表或单库时折叠掉库层。跨框架切换时优先恢复该框架在本会话中上次的 libraryId，否则回框架默认库；刷新后仍以 URL 为准。取舍：Vue 首批仅 Element Plus 时库级可能只有一项，但保留两层信息架构，避免「框架即库」并降低后续加库时的 UI 重构。
