import { useLayoutEffect, useState } from 'react'
// @scope-wrapped official CSS (?raw skips Vite PostCSS/Tailwind which hung builds).
// Scoped under .showcase-bulma so utilities do not rewrite App Shell layout.
// daisyUI uses dy- prefix so class names no longer collide with Bulma.
import bulmaCss from './bulma.scoped.css?raw'
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
import type { ShowcaseProps } from '../types'
import { injectScopedShowcaseCss } from '../vanillaCss'

/**
 * Vanilla Showcase (V2): React prints DOM with Bulma classes.
 * Pure CSS library — Modal via class + native toggle (no official JS).
 */
export function BulmaShowcase({ users }: ShowcaseProps) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState<UserInput>(emptyUserInput())
  const [errors, setErrors] = useState<UserFormErrors>({})

  useLayoutEffect(() => injectScopedShowcaseCss('bulma', bulmaCss), [])

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
    <div className="showcase-bulma">
      <div className="level is-mobile mb-4" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <div className="level-left" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
          <div className="level-item">
            <div className="field mb-0">
              <div className="control">
                <input
                  type="search"
                  className="input is-small"
                  style={{ width: 220 }}
                  placeholder="搜索姓名 / 邮箱"
                  value={users.filters.keyword}
                  onChange={(e) => users.setKeyword(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="level-item">
            <div className="select is-small">
              <select
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
            </div>
          </div>
          <div className="level-item">
            <div className="select is-small">
              <select
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
            </div>
          </div>
          <div className="level-item">
            <button
              type="button"
              className="button is-small"
              onClick={users.cycleHireDateSort}
            >
              入职排序：
              {users.hireDateSort === 'none'
                ? '默认'
                : users.hireDateSort === 'asc'
                  ? '升序'
                  : '降序'}
            </button>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <button type="button" className="button is-primary is-small" onClick={openCreate}>
              新建用户
            </button>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="table is-fullwidth is-striped is-hoverable is-narrow is-bordered" style={{ minWidth: 720 }}>
          <thead>
            <tr>
              <th style={{ width: 40 }}>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={(e) => users.toggleSelectAllPage(e.target.checked)}
                    aria-label="全选本页"
                  />
                </label>
              </th>
              <th>姓名</th>
              <th>邮箱</th>
              <th>角色</th>
              <th>状态</th>
              <th>入职日期</th>
              <th className="has-text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.users.map((row) => (
              <tr key={row.id}>
                <td>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={users.selectedIds.includes(row.id)}
                      onChange={(e) => users.toggleSelect(row.id, e.target.checked)}
                      aria-label={`选择 ${row.name}`}
                    />
                  </label>
                </td>
                <td>{row.name}</td>
                <td className="has-text-grey">{row.email}</td>
                <td>{ROLE_LABELS[row.role]}</td>
                <td>
                  <span
                    className={
                      row.status === 'active' ? 'tag is-success is-light' : 'tag is-light'
                    }
                  >
                    {STATUS_LABELS[row.status]}
                  </span>
                </td>
                <td>{row.hireDate}</td>
                <td className="has-text-right">
                  <div className="buttons are-small has-addons is-right mb-0">
                    <button type="button" className="button is-link is-light" onClick={() => openEdit(row)}>
                      编辑
                    </button>
                    <button
                      type="button"
                      className="button is-danger is-light"
                      onClick={() => {
                        if (window.confirm('确认删除该用户？')) users.deleteUser(row.id)
                      }}
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.users.length === 0 && (
              <tr>
                <td colSpan={7} className="has-text-centered has-text-grey py-5">
                  暂无数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="level is-mobile mt-3 mb-0">
        <div className="level-left">
          <div className="level-item">
            <p className="is-size-7 has-text-grey">
              共 {users.total} 条 · 第 {users.page} / {users.pageCount} 页
            </p>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <div className="buttons has-addons mb-0">
              <button
                type="button"
                className="button is-small"
                disabled={users.page <= 1}
                onClick={() => users.setPage(users.page - 1)}
              >
                上一页
              </button>
              <button
                type="button"
                className="button is-small"
                disabled={users.page >= users.pageCount}
                onClick={() => users.setPage(users.page + 1)}
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`modal${open ? ' is-active' : ''}`} aria-labelledby="bulma-modal-title">
        <div className="modal-background" onClick={closeModal} role="presentation" />
        <div className="modal-card" style={{ width: '100%', maxWidth: 32 * 16 }}>
          <header className="modal-card-head">
            <p className="modal-card-title" id="bulma-modal-title">
              {editing ? '编辑用户' : '新建用户'}
            </p>
            <button
              type="button"
              className="delete"
              aria-label="关闭"
              onClick={closeModal}
            />
          </header>
          <section className="modal-card-body">
            <div className="field">
              <label className="label is-small" htmlFor="bulma-name">
                姓名
              </label>
              <div className="control">
                <input
                  id="bulma-name"
                  type="text"
                  className={`input is-small${errors.name ? ' is-danger' : ''}`}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              {errors.name && <p className="help is-danger">{errors.name}</p>}
            </div>
            <div className="field">
              <label className="label is-small" htmlFor="bulma-email">
                邮箱
              </label>
              <div className="control">
                <input
                  id="bulma-email"
                  type="email"
                  className={`input is-small${errors.email ? ' is-danger' : ''}`}
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              {errors.email && <p className="help is-danger">{errors.email}</p>}
            </div>
            <div className="field">
              <label className="label is-small" htmlFor="bulma-role">
                角色
              </label>
              <div className="control">
                <div className="select is-small is-fullwidth">
                  <select
                    id="bulma-role"
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
                </div>
              </div>
            </div>
            <div className="field">
              <div
                className="is-flex is-align-items-center is-justify-content-space-between px-3 py-2"
                style={{ border: '1px solid #dbdbdb', borderRadius: 6 }}
              >
                <span className="label is-small mb-0">状态（启用）</span>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={form.status === 'active'}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        status: e.target.checked ? 'active' : 'disabled',
                      }))
                    }
                    aria-label="状态启用"
                  />
                </label>
              </div>
            </div>
            <div className="field">
              <label className="label is-small" htmlFor="bulma-hire">
                入职日期
              </label>
              <div className="control">
                <input
                  id="bulma-hire"
                  type="date"
                  className="input is-small"
                  value={form.hireDate}
                  onChange={(e) => setForm((f) => ({ ...f, hireDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="field mb-0">
              <label className="label is-small" htmlFor="bulma-remark">
                备注
              </label>
              <div className="control">
                <textarea
                  id="bulma-remark"
                  className="textarea is-small"
                  rows={3}
                  value={form.remark}
                  onChange={(e) => setForm((f) => ({ ...f, remark: e.target.value }))}
                />
              </div>
            </div>
          </section>
          <footer className="modal-card-foot is-justify-content-flex-end" style={{ gap: '0.5rem' }}>
            <button type="button" className="button is-small" onClick={closeModal}>
              取消
            </button>
            <button type="button" className="button is-primary is-small" onClick={submit}>
              提交
            </button>
          </footer>
        </div>
      </div>
    </div>
  )
}
