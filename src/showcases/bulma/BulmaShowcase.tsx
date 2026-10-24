import { useLayoutEffect, useState } from 'react'
// @scope-wrapped official CSS (?raw skips Vite PostCSS/Tailwind which hung builds).
// Scoped under .showcase-bulma so utilities do not rewrite App Shell layout.
// daisyUI uses dy- prefix so class names no longer collide with Bulma.
import bulmaCss from './bulma.scoped.css?raw'
import {
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

const surface = librarySurfaces.bulma

function renderCell(user: User, key: UserFieldKey) {
  switch (key) {
    case 'role':
      return ROLE_LABELS[user.role]
    case 'status':
      return (
        <span
          className={
            user.status === 'active' ? 'tag is-success is-light' : 'tag is-light'
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
 * Vanilla Showcase (V2): React prints DOM with Bulma classes.
 * Pure CSS library — Modal via class + native toggle (no official JS).
 */
export function BulmaShowcase({ users }: ShowcaseProps) {
  const mode = useThemeMode()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState<UserInput>(emptyUserInput())
  const [errors, setErrors] = useState<UserFormErrors>({})

  useLayoutEffect(() => injectLibraryStyle('bulma', bulmaCss), [])

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
      <div className="level is-mobile mb-4" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <div className="level-left" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
          <div className="level-item">
            <div className="field mb-0">
              <div className="control">
                <input
                  type="search"
                  className="input is-small"
                  style={{ width: 220 }}
                  placeholder={SHOWCASE_FILTERS.keywordPlaceholder}
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
                {SHOWCASE_FILTER_OPTIONS.role.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
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
                {SHOWCASE_FILTER_OPTIONS.status.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
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
              {USER_TABLE_COLUMNS.map((field) => (
                <th key={field.key}>{field.label}</th>
              ))}
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
                {USER_TABLE_COLUMNS.map((field) => (
                  <td
                    key={field.key}
                    className={field.key === 'email' ? 'has-text-grey' : undefined}
                  >
                    {renderCell(row, field.key)}
                  </td>
                ))}
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
                <td
                  colSpan={USER_TABLE_COLUMNS.length + 2}
                  className="has-text-centered has-text-grey py-5"
                >
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
            {USER_FORM_FIELDS.map((field) =>
              field.key === 'status' ? (
                <div key={field.key} className="field">
                  <div
                    className="is-flex is-align-items-center is-justify-content-space-between px-3 py-2"
                    style={{ border: '1px solid #dbdbdb', borderRadius: 6 }}
                  >
                    <span className="label is-small mb-0">
                      {field.label}
                      {field.rules.required ? ' *' : ''}
                    </span>
                    <label className="checkbox">
                      <input
                        type="checkbox"
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
                    </label>
                  </div>
                  {errors.status && (
                    <p className="help is-danger">{errors.status}</p>
                  )}
                </div>
              ) : (
                <div
                  key={field.key}
                  className={field.key === 'remark' ? 'field mb-0' : 'field'}
                >
                  <label className="label is-small" htmlFor={`bulma-${field.key}`}>
                    {field.label}
                    {field.rules.required ? ' *' : ''}
                  </label>
                  <div className="control">
                    {field.control === 'select' ? (
                      <div
                        className={`select is-small is-fullwidth${errors[field.key] ? ' is-danger' : ''}`}
                      >
                        <select
                          id={`bulma-${field.key}`}
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
                      </div>
                    ) : field.control === 'textarea' ? (
                      <textarea
                        id={`bulma-${field.key}`}
                        className={`textarea is-small${errors[field.key] ? ' is-danger' : ''}`}
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
                        id={`bulma-${field.key}`}
                        type={
                          field.control === 'email'
                            ? 'email'
                            : field.control === 'date'
                              ? 'date'
                              : 'text'
                        }
                        className={`input is-small${errors[field.key] ? ' is-danger' : ''}`}
                        placeholder={field.placeholder}
                        value={form[field.key]}
                        onChange={(e) =>
                          setForm((current) =>
                            withUserFieldValue(current, field.key, e.target.value),
                          )
                        }
                      />
                    )}
                  </div>
                  {errors[field.key] && (
                    <p className="help is-danger">{errors[field.key]}</p>
                  )}
                </div>
              ),
            )}
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
