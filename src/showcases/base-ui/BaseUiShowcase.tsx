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
  ROLE_LABELS,
  ROLE_OPTIONS,
  STATUS_LABELS,
  emptyUserInput,
  type User,
  type UserFormErrors,
  type UserInput,
  type UserRole,
  type UserStatus,
} from '@/domain/user'
import type { ShowcaseProps } from '../types'
import './base-ui.structural.css'

interface SelectOption<Value extends string> {
  value: Value
  label: string
}

const ROLE_FILTER_OPTIONS: SelectOption<'all' | UserRole>[] = [
  { value: 'all', label: '全部角色' },
  ...ROLE_OPTIONS,
]

const STATUS_FILTER_OPTIONS: SelectOption<'all' | UserStatus>[] = [
  { value: 'all', label: '全部状态' },
  { value: 'active', label: STATUS_LABELS.active },
  { value: 'disabled', label: STATUS_LABELS.disabled },
]

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
              placeholder="搜索姓名 / 邮箱"
              value={users.filters.keyword}
              onValueChange={users.setKeyword}
            />
          </Field.Root>
          <UnstyledSelectField
            label="角色"
            options={ROLE_FILTER_OPTIONS}
            value={users.filters.role}
            onValueChange={users.setRoleFilter}
          />
          <UnstyledSelectField
            label="状态"
            options={STATUS_FILTER_OPTIONS}
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
              <th>姓名</th>
              <th>邮箱</th>
              <th>角色</th>
              <th>状态</th>
              <th>入职日期</th>
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
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{ROLE_LABELS[user.role]}</td>
                <td>{STATUS_LABELS[user.status]}</td>
                <td>{user.hireDate}</td>
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
                <td colSpan={7}>暂无数据</td>
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
                  <Field.Root className="base-ui-field" name="name">
                    <Field.Label>姓名</Field.Label>
                    <Input
                      aria-required="true"
                      value={form.name}
                      onValueChange={(name) => setForm((current) => ({ ...current, name }))}
                    />
                    <Field.Error />
                  </Field.Root>

                  <Field.Root className="base-ui-field" name="email">
                    <Field.Label>邮箱</Field.Label>
                    <Input
                      aria-required="true"
                      inputMode="email"
                      value={form.email}
                      onValueChange={(email) => setForm((current) => ({ ...current, email }))}
                    />
                    <Field.Error />
                  </Field.Root>

                  <UnstyledSelectField
                    label="角色"
                    name="role"
                    options={ROLE_OPTIONS}
                    value={form.role}
                    onValueChange={(role) => setForm((current) => ({ ...current, role }))}
                  />

                  <Field.Root className="base-ui-field" name="status">
                    <Field.Label>状态</Field.Label>
                    <div className="base-ui-switch-row">
                      <Switch.Root
                        className="base-ui-switch"
                        aria-label={form.status === 'active' ? '状态：启用' : '状态：禁用'}
                        checked={form.status === 'active'}
                        onCheckedChange={(checked) =>
                          setForm((current) => ({
                            ...current,
                            status: checked ? 'active' : 'disabled',
                          }))
                        }
                      >
                        <Switch.Thumb className="base-ui-switch-thumb" />
                      </Switch.Root>
                      <span>{form.status === 'active' ? '启用' : '禁用'}</span>
                    </div>
                  </Field.Root>

                  <Field.Root className="base-ui-field" name="hireDate">
                    <Field.Label>入职日期</Field.Label>
                    <Field.Control
                      type="date"
                      value={form.hireDate}
                      onValueChange={(hireDate) =>
                        setForm((current) => ({ ...current, hireDate }))
                      }
                    />
                  </Field.Root>

                  <Field.Root className="base-ui-field base-ui-form-wide" name="remark">
                    <Field.Label>备注</Field.Label>
                    <Field.Control
                      render={<textarea rows={3} />}
                      value={form.remark}
                      onValueChange={(remark) => setForm((current) => ({ ...current, remark }))}
                    />
                  </Field.Root>
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
