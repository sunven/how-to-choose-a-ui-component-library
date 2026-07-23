# Deep checks

- Ant Design create: FAIL or unconfirmed (user not in body)
  body sample: HOW TO CHOOSE A UI COMPONENT LIBRARY  同一业务形态，切换组件库看表单与表格  先选框架（React / Vue），再切换该框架下的组件库。以「用户管理」为场景：表�
- After EP->shadcn computed: "{\"h1fs\":\"24px\",\"h1ff\":\"ui-sans-serif, system-ui, -apple-system,\",\"h1color\":\"rgb(15, 23, 42)\",\"h2fs\":\"16px\",\"bodyBg\":\"rgb(255, 255, 255)\",\"hasElButton\":false,\"hasElOverlay\":false,\"showcaseText\":true}"
- After Vuestic->MUI: "{\"hasVaButton\":false,\"hasVaModal\":false,\"hasMuiRoot\":true,\"sampleUser\":true,\"dataShowcaseLibs\":[]}"
- Modal open then switch EP->antd: "{\"elOverlay\":false,\"antModal\":false,\"bodyClass\":\"\"}"
- Framework switch to Vue: FAIL (http://localhost:5173/libs/react/ant-design)
- MUI edit opens: PASS
- Chain errors:  
- Chain console: [debug] [vite] connecting... [info] %cDownload the React DevTools for a better development experience: https://reactjs.org/link/react-devtools font-weight:bold [debug] [vite] connected. [debug] [vite]
