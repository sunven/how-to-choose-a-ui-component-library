import { useState } from 'react'
import {
  ROLE_LABELS,
  ROLE_OPTIONS,
  STATUS_LABELS,
  emptyUserInput,
  type User,
  type UserFormErrors,
  type UserInput,
} from '@/domain/user'
import type { ShowcaseProps } from '../types'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Switch } from './ui/switch'
import { Textarea } from './ui/textarea'

export function ShadcnShowcase({ users }: ShowcaseProps) {
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
    <div className="showcase-shadcn space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Input
            className="sm:w-56"
            placeholder="搜索姓名 / 邮箱"
            value={users.filters.keyword}
            onChange={(e) => users.setKeyword(e.target.value)}
          />
          <Select
            value={users.filters.role}
            onValueChange={(v) => users.setRoleFilter(v as typeof users.filters.role)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="角色" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部角色</SelectItem>
              {ROLE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={users.filters.status}
            onValueChange={(v) => users.setStatusFilter(v as typeof users.filters.status)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="active">{STATUS_LABELS.active}</SelectItem>
              <SelectItem value="disabled">{STATUS_LABELS.disabled}</SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" onClick={users.cycleHireDateSort}>
            入职排序：
            {users.hireDateSort === 'none'
              ? '默认'
              : users.hireDateSort === 'asc'
                ? '升序'
                : '降序'}
          </Button>
        </div>
        <Button type="button" onClick={openCreate}>
          新建用户
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-muted/50">
            <tr className="border-b text-left">
              <th className="w-10 p-2">
                <Checkbox
                  checked={allPageSelected}
                  onCheckedChange={(c) => users.toggleSelectAllPage(c === true)}
                  aria-label="全选本页"
                />
              </th>
              <th className="p-2 font-medium">姓名</th>
              <th className="p-2 font-medium">邮箱</th>
              <th className="p-2 font-medium">角色</th>
              <th className="p-2 font-medium">状态</th>
              <th className="p-2 font-medium">入职日期</th>
              <th className="p-2 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.users.map((row) => (
              <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-2">
                  <Checkbox
                    checked={users.selectedIds.includes(row.id)}
                    onCheckedChange={(c) => users.toggleSelect(row.id, c === true)}
                    aria-label={`选择 ${row.name}`}
                  />
                </td>
                <td className="p-2">{row.name}</td>
                <td className="p-2 text-muted-foreground">{row.email}</td>
                <td className="p-2">{ROLE_LABELS[row.role]}</td>
                <td className="p-2">
                  <span
                    className={
                      row.status === 'active'
                        ? 'rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700'
                        : 'rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600'
                    }
                  >
                    {STATUS_LABELS[row.status]}
                  </span>
                </td>
                <td className="p-2">{row.hireDate}</td>
                <td className="p-2 text-right">
                  <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(row)}>
                    编辑
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => {
                      if (window.confirm('确认删除该用户？')) users.deleteUser(row.id)
                    }}
                  >
                    删除
                  </Button>
                </td>
              </tr>
            ))}
            {users.users.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  暂无数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          共 {users.total} 条 · 第 {users.page} / {users.pageCount} 页
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={users.page <= 1}
            onClick={() => users.setPage(users.page - 1)}
          >
            上一页
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={users.page >= users.pageCount}
            onClick={() => users.setPage(users.page + 1)}
          >
            下一页
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="showcase-shadcn sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? '编辑用户' : '新建用户'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="shadcn-name">姓名</Label>
              <Input
                id="shadcn-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="shadcn-email">邮箱</Label>
              <Input
                id="shadcn-email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label>角色</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm((f) => ({ ...f, role: v as UserInput['role'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <Label htmlFor="shadcn-status">状态（启用）</Label>
              <Switch
                id="shadcn-status"
                checked={form.status === 'active'}
                onCheckedChange={(c) =>
                  setForm((f) => ({ ...f, status: c ? 'active' : 'disabled' }))
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="shadcn-hire">入职日期</Label>
              <Input
                id="shadcn-hire"
                type="date"
                value={form.hireDate}
                onChange={(e) => setForm((f) => ({ ...f, hireDate: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="shadcn-remark">备注</Label>
              <Textarea
                id="shadcn-remark"
                value={form.remark}
                onChange={(e) => setForm((f) => ({ ...f, remark: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type="button" onClick={submit}>
              提交
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
