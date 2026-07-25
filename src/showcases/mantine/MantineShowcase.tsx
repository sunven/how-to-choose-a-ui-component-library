import { useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Checkbox,
  Group,
  MantineProvider,
  Modal,
  Pagination,
  Select,
  Stack,
  Switch,
  Table,
  TextInput,
  Textarea,
  Text,
} from '@mantine/core'
import { DateInput, DatesProvider } from '@mantine/dates'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
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

dayjs.locale('zh-cn')

export function MantineShowcase({ users }: ShowcaseProps) {
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
  const somePageSelected = users.users.some((u) => users.selectedIds.includes(u.id))

  const sortLabel = useMemo(() => {
    if (users.hireDateSort === 'asc') return '升序'
    if (users.hireDateSort === 'desc') return '降序'
    return '默认'
  }, [users.hireDateSort])

  return (
    <MantineProvider forceColorScheme={mode} defaultColorScheme={mode}>
      <DatesProvider settings={{ locale: 'zh-cn', firstDayOfWeek: 1 }}>
        <Stack gap="md">
          <Group justify="space-between" align="flex-end" wrap="wrap">
            <Group gap="sm" wrap="wrap" align="flex-end">
              <TextInput
                label="搜索"
                placeholder="搜索姓名 / 邮箱"
                value={users.filters.keyword}
                onChange={(e) => users.setKeyword(e.currentTarget.value)}
                w={220}
              />
              <Select
                label="角色"
                w={140}
                value={users.filters.role}
                onChange={(v) => users.setRoleFilter((v ?? 'all') as typeof users.filters.role)}
                data={[
                  { value: 'all', label: '全部角色' },
                  ...ROLE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
                ]}
              />
              <Select
                label="状态"
                w={140}
                value={users.filters.status}
                onChange={(v) =>
                  users.setStatusFilter((v ?? 'all') as typeof users.filters.status)
                }
                data={[
                  { value: 'all', label: '全部状态' },
                  { value: 'active', label: STATUS_LABELS.active },
                  { value: 'disabled', label: STATUS_LABELS.disabled },
                ]}
              />
              <Button variant="default" size="sm" onClick={users.cycleHireDateSort}>
                入职排序：{sortLabel}
              </Button>
            </Group>
            <Button onClick={openCreate}>新建用户</Button>
          </Group>

          <Table.ScrollContainer minWidth={720}>
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th w={40}>
                    <Checkbox
                      aria-label="全选本页"
                      checked={allPageSelected}
                      indeterminate={somePageSelected && !allPageSelected}
                      onChange={(e) => users.toggleSelectAllPage(e.currentTarget.checked)}
                    />
                  </Table.Th>
                  <Table.Th>姓名</Table.Th>
                  <Table.Th>邮箱</Table.Th>
                  <Table.Th>角色</Table.Th>
                  <Table.Th>状态</Table.Th>
                  <Table.Th>入职日期</Table.Th>
                  <Table.Th ta="right">操作</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {users.users.map((row) => (
                  <Table.Tr key={row.id}>
                    <Table.Td>
                      <Checkbox
                        aria-label={`选择 ${row.name}`}
                        checked={users.selectedIds.includes(row.id)}
                        onChange={(e) => users.toggleSelect(row.id, e.currentTarget.checked)}
                      />
                    </Table.Td>
                    <Table.Td>{row.name}</Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {row.email}
                      </Text>
                    </Table.Td>
                    <Table.Td>{ROLE_LABELS[row.role]}</Table.Td>
                    <Table.Td>
                      <Badge color={row.status === 'active' ? 'green' : 'gray'} variant="light">
                        {STATUS_LABELS[row.status]}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{row.hireDate}</Table.Td>
                    <Table.Td>
                      <Group gap={4} justify="flex-end">
                        <Button size="xs" variant="subtle" onClick={() => openEdit(row)}>
                          编辑
                        </Button>
                        <Button
                          size="xs"
                          variant="subtle"
                          color="red"
                          onClick={() => {
                            if (window.confirm('确认删除该用户？')) users.deleteUser(row.id)
                          }}
                        >
                          删除
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
                {users.users.length === 0 && (
                  <Table.Tr>
                    <Table.Td colSpan={7}>
                      <Text ta="center" c="dimmed" py="lg">
                        暂无数据
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              共 {users.total} 条 · 第 {users.page} / {users.pageCount} 页
            </Text>
            <Pagination
              value={users.page}
              onChange={users.setPage}
              total={users.pageCount}
              size="sm"
            />
          </Group>

          <Modal
            opened={open}
            onClose={() => setOpen(false)}
            title={editing ? '编辑用户' : '新建用户'}
            centered
          >
            <Stack gap="sm">
              <TextInput
                label="姓名"
                required
                value={form.name}
                error={errors.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.currentTarget.value }))}
              />
              <TextInput
                label="邮箱"
                required
                value={form.email}
                error={errors.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.currentTarget.value }))}
              />
              <Select
                label="角色"
                required
                value={form.role}
                onChange={(v) =>
                  setForm((f) => ({ ...f, role: (v ?? 'viewer') as UserInput['role'] }))
                }
                data={ROLE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              />
              <Switch
                label={form.status === 'active' ? '状态：启用' : '状态：禁用'}
                checked={form.status === 'active'}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.currentTarget.checked ? 'active' : 'disabled',
                  }))
                }
              />
              <DateInput
                label="入职日期"
                valueFormat="YYYY-MM-DD"
                value={form.hireDate ? dayjs(form.hireDate).toDate() : null}
                onChange={(d) =>
                  setForm((f) => ({
                    ...f,
                    hireDate: d ? dayjs(d).format('YYYY-MM-DD') : '',
                  }))
                }
              />
              <Textarea
                label="备注"
                minRows={3}
                value={form.remark}
                onChange={(e) => setForm((f) => ({ ...f, remark: e.currentTarget.value }))}
              />
              <Group justify="flex-end" mt="sm">
                <Button variant="default" onClick={() => setOpen(false)}>
                  取消
                </Button>
                <Button onClick={submit}>提交</Button>
              </Group>
            </Stack>
          </Modal>
        </Stack>
      </DatesProvider>
    </MantineProvider>
  )
}
