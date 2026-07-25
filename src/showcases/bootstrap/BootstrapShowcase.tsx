import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Modal } from 'bootstrap'
// @scope-wrapped official CSS (?raw skips Vite PostCSS/Tailwind which hung builds).
// Must stay scoped under .showcase-bootstrap: unscoped Bootstrap utilities
// (!important p-*/m-*/gap-*) rewrite the App Shell grid proportions.
import bootstrapCss from './bootstrap.scoped.css?raw'
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
import { injectScopedShowcaseCss } from '../vanillaCss'

/**
 * Vanilla Showcase (V2): React prints DOM with Bootstrap classes.
 * Modal uses official Bootstrap JS (init on mount, dispose on leave).
 */
export function BootstrapShowcase({ users }: ShowcaseProps) {
  const mode = useThemeMode()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState<UserInput>(emptyUserInput())
  const [errors, setErrors] = useState<UserFormErrors>({})

  const modalElRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<Modal | null>(null)

  useLayoutEffect(() => injectScopedShowcaseCss('bootstrap', bootstrapCss), [])

  useEffect(() => {
    const el = modalElRef.current
    if (!el) return

    const instance = Modal.getOrCreateInstance(el, { backdrop: true, keyboard: true })
    modalRef.current = instance

    const onHidden = () => setOpen(false)
    el.addEventListener('hidden.bs.modal', onHidden)

    return () => {
      el.removeEventListener('hidden.bs.modal', onHidden)
      instance.dispose()
      modalRef.current = null
      // Bootstrap may leave body chrome / orphaned backdrop after dispose mid-show
      document.querySelectorAll('.modal-backdrop').forEach((node) => node.remove())
      document.body.classList.remove('modal-open')
      document.body.style.removeProperty('overflow')
      document.body.style.removeProperty('padding-right')
    }
  }, [])

  useEffect(() => {
    const instance = modalRef.current
    if (!instance) return
    if (open) instance.show()
    else instance.hide()
  }, [open])

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
    <div className="showcase-bootstrap" data-bs-theme={mode}>
      <div className="d-flex flex-column flex-sm-row gap-3 align-items-sm-end justify-content-between mb-3">
        <div className="d-flex flex-column flex-sm-row flex-wrap gap-2 flex-sm-grow-1">
          <input
            type="search"
            className="form-control form-control-sm"
            style={{ maxWidth: 220 }}
            placeholder="搜索姓名 / 邮箱"
            value={users.filters.keyword}
            onChange={(e) => users.setKeyword(e.target.value)}
          />
          <select
            className="form-select form-select-sm"
            style={{ maxWidth: 140 }}
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
            className="form-select form-select-sm"
            style={{ maxWidth: 140 }}
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
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
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
        <button type="button" className="btn btn-primary btn-sm" onClick={openCreate}>
          新建用户
        </button>
      </div>

      <div className="table-responsive border rounded">
        <table className="table table-sm table-striped table-hover mb-0 w-100" style={{ minWidth: 720, width: '100%' }}>
          <thead>
            <tr>
              <th scope="col" style={{ width: 40 }}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={allPageSelected}
                  onChange={(e) => users.toggleSelectAllPage(e.target.checked)}
                  aria-label="全选本页"
                />
              </th>
              <th scope="col">姓名</th>
              <th scope="col">邮箱</th>
              <th scope="col">角色</th>
              <th scope="col">状态</th>
              <th scope="col">入职日期</th>
              <th scope="col" className="text-end">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {users.users.map((row) => (
              <tr key={row.id}>
                <td>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={users.selectedIds.includes(row.id)}
                    onChange={(e) => users.toggleSelect(row.id, e.target.checked)}
                    aria-label={`选择 ${row.name}`}
                  />
                </td>
                <td>{row.name}</td>
                <td className="text-secondary">{row.email}</td>
                <td>{ROLE_LABELS[row.role]}</td>
                <td>
                  <span
                    className={
                      row.status === 'active'
                        ? 'badge text-bg-success'
                        : 'badge text-bg-secondary'
                    }
                  >
                    {STATUS_LABELS[row.status]}
                  </span>
                </td>
                <td>{row.hireDate}</td>
                <td className="text-end">
                  <button
                    type="button"
                    className="btn btn-link btn-sm py-0"
                    onClick={() => openEdit(row)}
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    className="btn btn-link btn-sm py-0 text-danger"
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
                <td colSpan={7} className="text-center text-secondary py-4">
                  暂无数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex align-items-center justify-content-between mt-3 small text-secondary">
        <span>
          共 {users.total} 条 · 第 {users.page} / {users.pageCount} 页
        </span>
        <div className="btn-group">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            disabled={users.page <= 1}
            onClick={() => users.setPage(users.page - 1)}
          >
            上一页
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            disabled={users.page >= users.pageCount}
            onClick={() => users.setPage(users.page + 1)}
          >
            下一页
          </button>
        </div>
      </div>

      <div
        className="modal fade"
        id="bootstrap-user-modal"
        tabIndex={-1}
        aria-labelledby="bootstrap-modal-title"
        aria-hidden={!open}
        ref={modalElRef}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="bootstrap-modal-title">
                {editing ? '编辑用户' : '新建用户'}
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="关闭"
                onClick={closeModal}
              />
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label" htmlFor="bs-name">
                  姓名
                </label>
                <input
                  id="bs-name"
                  type="text"
                  className={`form-control form-control-sm${errors.name ? ' is-invalid' : ''}`}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
                {errors.name && <div className="invalid-feedback d-block">{errors.name}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="bs-email">
                  邮箱
                </label>
                <input
                  id="bs-email"
                  type="email"
                  className={`form-control form-control-sm${errors.email ? ' is-invalid' : ''}`}
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
                {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="bs-role">
                  角色
                </label>
                <select
                  id="bs-role"
                  className="form-select form-select-sm"
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
              <div className="mb-3 d-flex align-items-center justify-content-between border rounded px-3 py-2">
                <span className="form-label mb-0">状态（启用）</span>
                <div className="form-check form-switch m-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="bs-status"
                    checked={form.status === 'active'}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        status: e.target.checked ? 'active' : 'disabled',
                      }))
                    }
                    aria-label="状态启用"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="bs-hire">
                  入职日期
                </label>
                <input
                  id="bs-hire"
                  type="date"
                  className="form-control form-control-sm"
                  value={form.hireDate}
                  onChange={(e) => setForm((f) => ({ ...f, hireDate: e.target.value }))}
                />
              </div>
              <div className="mb-0">
                <label className="form-label" htmlFor="bs-remark">
                  备注
                </label>
                <textarea
                  id="bs-remark"
                  className="form-control form-control-sm"
                  rows={3}
                  value={form.remark}
                  onChange={(e) => setForm((f) => ({ ...f, remark: e.target.value }))}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={closeModal}>
                取消
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={submit}>
                提交
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
