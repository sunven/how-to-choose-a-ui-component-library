import { useMemo, useState } from 'react'
import { AlertDialog } from '@base-ui/react/alert-dialog'
import { Button } from '@base-ui/react/button'
import { Checkbox } from '@base-ui/react/checkbox'
import { Dialog } from '@base-ui/react/dialog'
import { Field } from '@base-ui/react/field'
import { Form } from '@base-ui/react/form'
import { Input } from '@base-ui/react/input'
import { Select } from '@base-ui/react/select'
import { Switch } from '@base-ui/react/switch'
import {
  SHOWCASE_FILTERS,
  SHOWCASE_FILTER_OPTIONS,
  USER_FIELD_BY_KEY,
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
import type { ShowcaseProps } from '../types'
import './base-ui.structural.css'

interface SelectOption<Value extends string> {
  value: Value
  label: string
}

function renderCell(user: User, key: UserFieldKey) {
  switch (key) {
    case 'role':
      return ROLE_LABELS[user.role]
    case 'status':
      return STATUS_LABELS[user.status]
    default:
      return user[key]
  }
}

export function BaseUiShowcase({ users }: ShowcaseProps) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [deleting, setDeleting] = useState<User | null>(null)
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
    users.users.length > 0 && users.users.every((user) => users.selectedIds.includes(user.id))
  const somePageSelected = users.users.some((user) => users.selectedIds.includes(user.id))

  const sortLabel = useMemo(() => {
    if (users.hireDateSort === 'asc') return '升序'
    if (users.hireDateSort === 'desc') return '降序'
    return '默认'
  }, [users.hireDateSort])
  const baseUiFormErrors = useMemo(() => toBaseUiFormErrors(errors), [errors])

  return (
    <div className="base-ui-showcase">
      <div className="base-ui-toolbar">
        <div className="base-ui-toolbar-filters">
          <Field.Root className="base-ui-field base-ui-search-field">
            <Field.Label>搜索</Field.Label>
            <Input
              placeholder={SHOWCASE_FILTERS.keywordPlaceholder}
              value={users.filters.keyword}
              onValueChange={users.setKeyword}
            />
          </Field.Root>
          <UnstyledSelectField
            label={USER_FIELD_BY_KEY.role.label}
            options={SHOWCASE_FILTER_OPTIONS.role}
            value={users.filters.role}
            onValueChange={users.setRoleFilter}
          />
          <UnstyledSelectField
            label={USER_FIELD_BY_KEY.status.label}
            options={SHOWCASE_FILTER_OPTIONS.status}
            value={users.filters.status}
            onValueChange={users.setStatusFilter}
          />
          <Button type="button" onClick={users.cycleHireDateSort}>
            入职排序：{sortLabel}
          </Button>
        </div>
        <Button type="button" onClick={openCreate}>
          新建用户
        </Button>
      </div>

      <div className="base-ui-table-wrap">
        <table className="base-ui-table">
          <thead>
            <tr>
              <th>
                <Checkbox.Root
                  className="base-ui-checkbox"
                  aria-label="全选本页"
                  checked={allPageSelected}
                  indeterminate={somePageSelected && !allPageSelected}
                  onCheckedChange={users.toggleSelectAllPage}
                >
                  <Checkbox.Indicator>{somePageSelected && !allPageSelected ? '−' : '✓'}</Checkbox.Indicator>
                </Checkbox.Root>
              </th>
              {USER_TABLE_COLUMNS.map((field) => (
                <th key={field.key}>{field.label}</th>
              ))}
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.users.map((user) => (
              <tr key={user.id}>
                <td>
                  <Checkbox.Root
                    className="base-ui-checkbox"
                    aria-label={`选择 ${user.name}`}
                    checked={users.selectedIds.includes(user.id)}
                    onCheckedChange={(checked) => users.toggleSelect(user.id, checked)}
                  >
                    <Checkbox.Indicator>✓</Checkbox.Indicator>
                  </Checkbox.Root>
                </td>
                {USER_TABLE_COLUMNS.map((field) => (
                  <td key={field.key}>{renderCell(user, field.key)}</td>
                ))}
                <td>
                  <div className="base-ui-row-actions">
                    <Button type="button" onClick={() => openEdit(user)}>
                      编辑
                    </Button>
                    <Button type="button" onClick={() => setDeleting(user)}>
                      删除
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {users.users.length === 0 && (
              <tr>
                <td colSpan={USER_TABLE_COLUMNS.length + 2}>暂无数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="base-ui-pagination">
        <span>
          共 {users.total} 条 · 第 {users.page} / {users.pageCount} 页
        </span>
        <div className="base-ui-pagination-actions">
          <Button
            type="button"
            disabled={users.page <= 1}
            onClick={() => users.setPage(users.page - 1)}
          >
            上一页
          </Button>
          {Array.from({ length: users.pageCount }, (_, index) => index + 1).map((page) => (
            <Button
              key={page}
              type="button"
              aria-current={page === users.page ? 'page' : undefined}
              onClick={() => users.setPage(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            type="button"
            disabled={users.page >= users.pageCount}
            onClick={() => users.setPage(users.page + 1)}
          >
            下一页
          </Button>
        </div>
      </div>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="base-ui-dialog-backdrop" />
          <Dialog.Viewport className="base-ui-dialog-viewport">
            <Dialog.Popup className="base-ui-dialog-popup">
              <Dialog.Title>{editing ? '编辑用户' : '新建用户'}</Dialog.Title>
              <Form<UserInput>
                className="base-ui-dialog-form"
                errors={baseUiFormErrors}
                noValidate
                onSubmit={(event) => {
                  event.preventDefault()
                  submit()
                }}
              >
                <div className="base-ui-form-grid">
                  {USER_FORM_FIELDS.map((field) => {
                    const label = `${field.label}${field.rules.required ? ' *' : ''}`

                    if (field.key === 'role') {
                      return (
                        <UnstyledSelectField
                          key={field.key}
                          label={label}
                          name="role"
                          options={field.options ?? []}
                          value={form.role}
                          onValueChange={(role) =>
                            setForm((current) =>
                              withUserFieldValue(current, 'role', role),
                            )
                          }
                        />
                      )
                    }

                    if (field.key === 'status') {
                      return (
                        <Field.Root
                          key={field.key}
                          className="base-ui-field"
                          name="status"
                        >
                          <Field.Label>{label}</Field.Label>
                          <div className="base-ui-switch-row">
                            <Switch.Root
                              className="base-ui-switch"
                              aria-label={`${field.label}：${STATUS_LABELS[form.status]}`}
                              checked={form.status === 'active'}
                              onCheckedChange={(checked) =>
                                setForm((current) =>
                                  withUserFieldValue(
                                    current,
                                    'status',
                                    checked ? 'active' : 'disabled',
                                  ),
                                )
                              }
                            >
                              <Switch.Thumb className="base-ui-switch-thumb" />
                            </Switch.Root>
                            <span>{STATUS_LABELS[form.status]}</span>
                          </div>
                          <Field.Error />
                        </Field.Root>
                      )
                    }

                    if (field.key === 'hireDate') {
                      return (
                        <Field.Root
                          key={field.key}
                          className="base-ui-field"
                          name="hireDate"
                        >
                          <Field.Label>{label}</Field.Label>
                          <Field.Control
                            type="date"
                            placeholder={field.placeholder}
                            value={form.hireDate}
                            onValueChange={(hireDate) =>
                              setForm((current) =>
                                withUserFieldValue(
                                  current,
                                  'hireDate',
                                  hireDate,
                                ),
                              )
                            }
                          />
                          <Field.Error />
                        </Field.Root>
                      )
                    }

                    if (field.key === 'remark') {
                      return (
                        <Field.Root
                          key={field.key}
                          className="base-ui-field base-ui-form-wide"
                          name="remark"
                        >
                          <Field.Label>{label}</Field.Label>
                          <Field.Control
                            render={<textarea rows={3} />}
                            placeholder={field.placeholder}
                            value={form.remark}
                            onValueChange={(remark) =>
                              setForm((current) =>
                                withUserFieldValue(current, 'remark', remark),
                              )
                            }
                          />
                          <Field.Error />
                        </Field.Root>
                      )
                    }

                    return (
                      <Field.Root
                        key={field.key}
                        className="base-ui-field"
                        name={field.key}
                      >
                        <Field.Label>{label}</Field.Label>
                        <Input
                          aria-required={Boolean(field.rules.required)}
                          inputMode={
                            field.control === 'email' ? 'email' : undefined
                          }
                          placeholder={field.placeholder}
                          value={form[field.key]}
                          onValueChange={(value) =>
                            setForm((current) =>
                              withUserFieldValue(current, field.key, value),
                            )
                          }
                        />
                        <Field.Error />
                      </Field.Root>
                    )
                  })}
                </div>

                <div className="base-ui-dialog-actions">
                  <Dialog.Close>取消</Dialog.Close>
                  <Button type="submit">提交</Button>
                </div>
              </Form>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>

      <AlertDialog.Root
        open={deleting !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setDeleting(null)
        }}
      >
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="base-ui-dialog-backdrop" />
          <AlertDialog.Viewport className="base-ui-dialog-viewport">
            <AlertDialog.Popup className="base-ui-dialog-popup">
              <AlertDialog.Title>确认删除</AlertDialog.Title>
              <AlertDialog.Description>
                确认删除用户“{deleting?.name ?? ''}”？
              </AlertDialog.Description>
              <div className="base-ui-dialog-actions">
                <AlertDialog.Close>取消</AlertDialog.Close>
                <AlertDialog.Close
                  onClick={() => {
                    if (deleting) users.deleteUser(deleting.id)
                  }}
                >
                  确认删除
                </AlertDialog.Close>
              </div>
            </AlertDialog.Popup>
          </AlertDialog.Viewport>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  )
}

function toBaseUiFormErrors(errors: UserFormErrors): Record<string, string> {
  const mapped: Record<string, string> = {}
  for (const [name, message] of Object.entries(errors)) {
    if (message) mapped[name] = message
  }
  return mapped
}

function UnstyledSelectField<Value extends string>({
  label,
  name,
  options,
  value,
  onValueChange,
}: {
  label: string
  name?: string
  options: readonly SelectOption<Value>[]
  value: Value
  onValueChange: (value: Value) => void
}) {
  return (
    <Field.Root className="base-ui-field" name={name}>
      <Field.Label>{label}</Field.Label>
      <Select.Root
        items={options}
        name={name}
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue !== null) onValueChange(nextValue)
        }}
      >
        <Select.Trigger aria-label={label} className="base-ui-select-trigger">
          <Select.Value />
          <Select.Icon>⌄</Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner
            className="base-ui-select-positioner"
            sideOffset={2}
            alignItemWithTrigger={false}
          >
            <Select.Popup className="base-ui-select-popup">
              <Select.List className="base-ui-select-list">
                {options.map((option) => (
                  <Select.Item
                    className="base-ui-select-item"
                    key={option.value}
                    value={option.value}
                  >
                    <Select.ItemIndicator>✓</Select.ItemIndicator>
                    <Select.ItemText>{option.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
      <Field.Error />
    </Field.Root>
  )
}
