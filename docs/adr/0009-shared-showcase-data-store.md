# Showcase 业务数据跨框架共享

用户列表等业务实体放在框架无关的内存状态层，React Showcase 与 Vue Island 共同读写；切换 Framework 或 Candidate Library 不重置 CRUD 结果（整页刷新仍回种子数据）。筛选、分页、弹层开闭等 UI 瞬态不强制全局共享。取舍：多一层与 UI 框架解耦的 store，以避免「换库像换了一套假数据」干扰观感对比，并避免把领域状态锁死在 React Context 里导致 Island 只能打洞。
