import { Outlet } from 'react-router-dom'
import { LibrarySwitcher } from './LibrarySwitcher'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              How to choose a UI component library
            </p>
            <h1 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">
              同一业务形态，切换组件库看表单与表格
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-600">
              以「用户管理」为场景：表格列表 + Modal 表单。切换库只换实现，不换业务语义。右侧为
              Library Profile（含 GitHub stars 等辅助信息）。
            </p>
          </div>
          <LibrarySwitcher />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
