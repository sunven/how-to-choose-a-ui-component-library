import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Modal } from 'bootstrap'
// @scope-wrapped official CSS (?raw skips Vite PostCSS/Tailwind which hung builds).
// Must stay scoped under .showcase-bootstrap: unscoped Bootstrap utilities
// (!important p-*/m-*/gap-*) rewrite the App Shell grid proportions.
import bootstrapCss from './bootstrap.scoped.css?raw'
import {
  HIRE_DATE_SORT_LABELS,
  SHOWCASE_FILTERS,
  SHOWCASE_FILTER_OPTIONS,
  USER_FORM_FIELDS,
  USER_TABLE_COLUMNS,
  withUserFieldValue,
  type UserFieldKey,
} from '@/domain/showcaseSpec'
import {
  ROLE_LABELS,
  STATUS_LABELS,
  emptyUserInput,
  type User,
  type UserFormErrors,
  type UserInput,
} from '@/domain/user'
import { useThemeMode } from '@/domain/useThemeMode'
import {
  librarySurfaces,
  surfaceThemeAttributes,
} from '@/showcases/librarySurfaces'
import { injectLibraryStyle } from '@/showcases/styleIsolation'
import type { ShowcaseProps } from '../types'

const surface = librarySurfaces.bootstrap

function renderCell(user: User, key: UserFieldKey) {
  switch (key) {
    case 'role':
      return ROLE_LABELS[user.role]
    case 'status':
      return (
        <span
          className={
            user.status === 'active'
              ? 'badge text-bg-success'
              : 'badge text-bg-secondary'
          }
        >
          {STATUS_LABELS[user.status]}
        </span>
      )
    default:
      return user[key]
  }
}

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

  useLayoutEffect(() => injectLibraryStyle('bootstrap', bootstrapCss), [])

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
    const input: UserInput = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      remark: form.remark.trim(),
    }
    const result = editing
      ? users.updateUser(editing.id, input)
      : users.createUser(input)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    setErrors({})
    setOpen(false)
  }

  const allPageSelected =
    users.users.length > 0 && users.users.every((u) => users.selectedIds.includes(u.id))

  return (
    <div
      className={surface.rootClassName}
      {...surfaceThemeAttributes(surface, mode)}
    >
      <div className="d-flex flex-column flex-sm-row gap-3 align-items-sm-end justify-content-between mb-3">
        <div className="d-flex flex-column flex-sm-row flex-wrap gap-2 flex-sm-grow-1">
          <input
            type="search"
            className="form-control form-control-sm"
            style={{ maxWidth: 220 }}
            placeholder={SHOWCASE_FILTERS.keywordPlaceholder}
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
            {SHOWCASE_FILTER_OPTIONS.role.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
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
            {SHOWCASE_FILTER_OPTIONS.status.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={users.cycleHireDateSort}
          >
            入职排序：{HIRE_DATE_SORT_LABELS[users.hireDateSort]}
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
              {USER_TABLE_COLUMNS.map((field) => (
                <th key={field.key} scope="col">
                  {field.label}
                </th>
              ))}
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
                {USER_TABLE_COLUMNS.map((field) => (
                  <td
                    key={field.key}
                    className={field.key === 'email' ? 'text-secondary' : undefined}
                  >
                    {renderCell(row, field.key)}
                  </td>
                ))}
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
                <td
                  colSpan={USER_TABLE_COLUMNS.length + 2}
                  className="text-center text-secondary py-4"
                >
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
              {USER_FORM_FIELDS.map((field) =>
                field.key === 'status' ? (
                  <div key={field.key} className="mb-3">
                    <div className="d-flex align-items-center justify-content-between border rounded px-3 py-2">
                      <span className="form-label mb-0">
                        {field.label}
                        {field.rules.required ? ' *' : ''}
                      </span>
                      <div className="form-check form-switch m-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id="bs-status"
                          checked={form.status === 'active'}
                          onChange={(e) =>
                            setForm((current) =>
                              withUserFieldValue(
                                current,
                                'status',
                                e.target.checked ? 'active' : 'disabled',
                              ),
                            )
                          }
                          aria-label={field.label}
                        />
                      </div>
                    </div>
                    {errors.status && (
                      <div className="invalid-feedback d-block">
                        {errors.status}
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    key={field.key}
                    className={field.key === 'remark' ? 'mb-0' : 'mb-3'}
                  >
                    <label className="form-label" htmlFor={`bs-${field.key}`}>
                      {field.label}
                      {field.rules.required ? ' *' : ''}
                    </label>
                    {field.control === 'select' ? (
                      <select
                        id={`bs-${field.key}`}
                        className={`form-select form-select-sm${errors[field.key] ? ' is-invalid' : ''}`}
                        value={form[field.key]}
                        onChange={(e) =>
                          setForm((current) =>
                            withUserFieldValue(current, field.key, e.target.value),
                          )
                        }
                      >
                        {field.options?.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : field.control === 'textarea' ? (
                      <textarea
                        id={`bs-${field.key}`}
                        className={`form-control form-control-sm${errors[field.key] ? ' is-invalid' : ''}`}
                        rows={3}
                        placeholder={field.placeholder}
                        value={form[field.key]}
                        onChange={(e) =>
                          setForm((current) =>
                            withUserFieldValue(current, field.key, e.target.value),
                          )
                        }
                      />
                    ) : (
                      <input
                        id={`bs-${field.key}`}
                        type={
                          field.control === 'email'
                            ? 'email'
                            : field.control === 'date'
                              ? 'date'
                              : 'text'
                        }
                        className={`form-control form-control-sm${errors[field.key] ? ' is-invalid' : ''}`}
                        placeholder={field.placeholder}
                        value={form[field.key]}
                        onChange={(e) =>
                          setForm((current) =>
                            withUserFieldValue(current, field.key, e.target.value),
                          )
                        }
                      />
                    )}
                    {errors[field.key] && (
                      <div className="invalid-feedback d-block">
                        {errors[field.key]}
                      </div>
                    )}
                  </div>
                ),
              )}
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
