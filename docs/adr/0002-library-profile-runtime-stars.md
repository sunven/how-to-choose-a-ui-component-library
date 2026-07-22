# Library Profile 的 star 等指标运行时拉取

Profile 采用实用字段集（框架、stars、协议、文档链接、TS、样式方案、体积量级、一句话定位等）。可变指标（尤其 GitHub stars）在浏览器运行时请求 GitHub API，以保持新鲜度；其余字段静态配置在仓库中。代价是 rate limit、网络失败与加载态必须在产品层处理，不能假设 stars 永远可得。
