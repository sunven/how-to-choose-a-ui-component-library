import { useState } from 'react'
import {
  ROLE_LABELS,
  ROLE_OPTIONS,
  STATUS_LABELS,
  emptyUserInput,
  validateUserInput,
  type User,
  type UserFormErrors,
  type UserInput,
} from '@/domain/user'
import { useThemeMode } from '@/domain/useThemeMode'
import type { ShowcaseProps } from '../types'

/**
 * Vanilla Showcase (V2): React only prints DOM with daisyUI semantic classes.
 * Classes use the `dy-` prefix (tailwind daisyui.prefix) so they do not collide
 * with Bootstrap/Bulma global class names.
 */
export function DaisyUiShowcase({ users }: ShowcaseProps) {
  const mode = useThemeMode()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState<UserInput>(emptyUserInput())
  const [errors, setErrors] = useState<UserFormErrors>({})

  const openCreate = () => {
    setEditing(null)
    setForm(emptyUserInput())
    setErrors({})
    setOpen(true)
  }

  const openEdit = (user: User) => {
    setEditing(user)
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      hireDate: user.hireDate,
      remark: user.remark,
    })
    setErrors({})
    setOpen(true)
  }

  const closeModal = () => setOpen(false)

  const submit = () => {
    const next = validateUserInput(form)
    setErrors(next)
    if (Object.keys(next).length) return
    const input: UserInput = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      remark: form.remark.trim(),
    }
    if (editing) users.updateUser(editing.id, input)
    else users.createUser(input)
    setOpen(false)
  }

  const allPageSelected =
    users.users.length > 0 && users.users.every((u) => users.selectedIds.includes(u.id))

  return (
    <div className="showcase-daisyui space-y-4" data-theme={mode}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <input
            type="search"
            className="dy-input dy-input-bordered dy-input-sm w-full sm:w-56"
            placeholder="搜索姓名 / 邮箱"
            value={users.filters.keyword}
            onChange={(e) => users.setKeyword(e.target.value)}
          />
          <select
            className="dy-select dy-select-bordered dy-select-sm w-full sm:w-[140px]"
            value={users.filters.role}
            onChange={(e) => users.setRoleFilter(e.target.value as typeof users.filters.role)}
            aria-label="角色筛选"
          >
            <option value="all">全部角色</option>
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            className="dy-select dy-select-bordered dy-select-sm w-full sm:w-[140px]"
            value={users.filters.status}
            onChange={(e) =>
              users.setStatusFilter(e.target.value as typeof users.filters.status)
            }
            aria-label="状态筛选"
          >
            <option value="all">全部状态</option>
            <option value="active">{STATUS_LABELS.active}</option>
            <option value="disabled">{STATUS_LABELS.disabled}</option>
          </select>
          <button type="button" className="dy-btn dy-btn-outline dy-btn-sm" onClick={users.cycleHireDateSort}>
            入职排序：
            {users.hireDateSort === 'none'
              ? '默认'
              : users.hireDateSort === 'asc'
                ? '升序'
                : '降序'}
          </button>
        </div>
        <button type="button" className="dy-btn dy-btn-primary dy-btn-sm" onClick={openCreate}>
          新建用户
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-base-300">
        <table className="dy-table dy-table-sm dy-table-zebra min-w-[720px]">
          <thead>
            <tr>
              <th className="w-10">
                <input
                  type="checkbox"
                  className="dy-checkbox dy-checkbox-sm"
                  checked={allPageSelected}
                  onChange={(e) => users.toggleSelectAllPage(e.target.checked)}
                  aria-label="全选本页"
                />
              </th>
              <th>姓名</th>
              <th>邮箱</th>
              <th>角色</th>
              <th>状态</th>
              <th>入职日期</th>
              <th className="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.users.map((row) => (
              <tr key={row.id}>
                <td>
                  <input
                    type="checkbox"
                    className="dy-checkbox dy-checkbox-sm"
                    checked={users.selectedIds.includes(row.id)}
                    onChange={(e) => users.toggleSelect(row.id, e.target.checked)}
                    aria-label={`选择 ${row.name}`}
                  />
                </td>
                <td>{row.name}</td>
                <td className="text-base-content/70">{row.email}</td>
                <td>{ROLE_LABELS[row.role]}</td>
                <td>
                  <span
                    className={
                      row.status === 'active'
                        ? 'dy-badge dy-badge-success dy-badge-sm'
                        : 'dy-badge dy-badge-ghost dy-badge-sm'
                    }
                  >
                    {STATUS_LABELS[row.status]}
                  </span>
                </td>
                <td>{row.hireDate}</td>
                <td className="text-right">
                  <button
                    type="button"
                    className="dy-btn dy-btn-ghost dy-btn-xs"
                    onClick={() => openEdit(row)}
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    className="dy-btn dy-btn-ghost dy-btn-xs text-error"
                    onClick={() => {
                      if (window.confirm('确认删除该用户？')) users.deleteUser(row.id)
                    }}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
            {users.users.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-base-content/60">
                  暂无数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-base-content/70">
        <span>
          共 {users.total} 条 · 第 {users.page} / {users.pageCount} 页
        </span>
        <div className="dy-join">
          <button
            type="button"
            className="dy-btn dy-btn-outline dy-btn-sm dy-join-item"
            disabled={users.page <= 1}
            onClick={() => users.setPage(users.page - 1)}
          >
            上一页
          </button>
          <button
            type="button"
            className="dy-btn dy-btn-outline dy-btn-sm dy-join-item"
            disabled={users.page >= users.pageCount}
            onClick={() => users.setPage(users.page + 1)}
          >
            下一页
          </button>
        </div>
      </div>

      <dialog className={`dy-modal ${open ? 'dy-modal-open' : ''}`} aria-labelledby="daisyui-modal-title">
        <div className="dy-modal-box max-w-lg">
          <h3 id="daisyui-modal-title" className="text-lg font-bold">
            {editing ? '编辑用户' : '新建用户'}
          </h3>
          <div className="mt-4 grid gap-3">
            <label className="dy-form-control w-full">
              <span className="dy-label-text mb-1">姓名</span>
              <input
                type="text"
                className={`dy-input dy-input-bordered dy-input-sm w-full ${errors.name ? 'dy-input-error' : ''}`}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              {errors.name && <span className="dy-label-text-alt text-error mt-1">{errors.name}</span>}
            </label>
            <label className="dy-form-control w-full">
              <span className="dy-label-text mb-1">邮箱</span>
              <input
                type="email"
                className={`dy-input dy-input-bordered dy-input-sm w-full ${errors.email ? 'dy-input-error' : ''}`}
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
              {errors.email && (
                <span className="dy-label-text-alt text-error mt-1">{errors.email}</span>
              )}
            </label>
            <label className="dy-form-control w-full">
              <span className="dy-label-text mb-1">角色</span>
              <select
                className="dy-select dy-select-bordered dy-select-sm w-full"
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role: e.target.value as UserInput['role'] }))
                }
              >
                {ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center justify-between rounded-lg border border-base-300 px-3 py-2">
              <span className="dy-label-text">状态（启用）</span>
              <input
                type="checkbox"
                className="dy-toggle dy-toggle-primary dy-toggle-sm"
                checked={form.status === 'active'}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.checked ? 'active' : 'disabled' }))
                }
                aria-label="状态启用"
              />
            </div>
            <label className="dy-form-control w-full">
              <span className="dy-label-text mb-1">入职日期</span>
              <input
                type="date"
                className="dy-input dy-input-bordered dy-input-sm w-full"
                value={form.hireDate}
                onChange={(e) => setForm((f) => ({ ...f, hireDate: e.target.value }))}
              />
            </label>
            <label className="dy-form-control w-full">
              <span className="dy-label-text mb-1">备注</span>
              <textarea
                className="dy-textarea dy-textarea-bordered dy-textarea-sm w-full"
                rows={3}
                value={form.remark}
                onChange={(e) => setForm((f) => ({ ...f, remark: e.target.value }))}
              />
            </label>
          </div>
          <div className="dy-modal-action">
            <button type="button" className="dy-btn dy-btn-ghost dy-btn-sm" onClick={closeModal}>
              取消
            </button>
            <button type="button" className="dy-btn dy-btn-primary dy-btn-sm" onClick={submit}>
              提交
            </button>
          </div>
        </div>
        <div className="dy-modal-backdrop">
          <button type="button" onClick={closeModal}>
            关闭
          </button>
        </div>
      </dialog>
    </div>
  )
}
