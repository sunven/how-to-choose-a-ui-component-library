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
import { useThemeMode } from '@/domain/useThemeMode'
import type { ShowcaseProps } from '../types'

dayjs.locale('zh-cn')

function renderCell(user: User, key: UserFieldKey) {
  switch (key) {
    case 'role':
      return ROLE_LABELS[user.role]
    case 'status':
      return (
        <Badge
          color={user.status === 'active' ? 'green' : 'gray'}
          variant="light"
        >
          {STATUS_LABELS[user.status]}
        </Badge>
      )
    case 'email':
      return (
        <Text size="sm" c="dimmed">
          {user.email}
        </Text>
      )
    default:
      return user[key]
  }
}

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
                placeholder={SHOWCASE_FILTERS.keywordPlaceholder}
                value={users.filters.keyword}
                onChange={(e) => users.setKeyword(e.currentTarget.value)}
                w={220}
              />
              <Select
                label={USER_FIELD_BY_KEY.role.label}
                w={140}
                value={users.filters.role}
                onChange={(v) => users.setRoleFilter((v ?? 'all') as typeof users.filters.role)}
                data={SHOWCASE_FILTER_OPTIONS.role}
              />
              <Select
                label={USER_FIELD_BY_KEY.status.label}
                w={140}
                value={users.filters.status}
                onChange={(v) =>
                  users.setStatusFilter((v ?? 'all') as typeof users.filters.status)
                }
                data={SHOWCASE_FILTER_OPTIONS.status}
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
                  {USER_TABLE_COLUMNS.map((field) => (
                    <Table.Th key={field.key}>{field.label}</Table.Th>
                  ))}
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
                    {USER_TABLE_COLUMNS.map((field) => (
                      <Table.Td key={field.key}>
                        {renderCell(row, field.key)}
                      </Table.Td>
                    ))}
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
                    <Table.Td colSpan={USER_TABLE_COLUMNS.length + 2}>
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
              {USER_FORM_FIELDS.map((field) => {
                if (field.key === 'role') {
                  return (
                    <Select
                      key={field.key}
                      label={field.label}
                      required={Boolean(field.rules.required)}
                      value={form.role}
                      error={errors.role}
                      onChange={(value) =>
                        setForm((current) =>
                          withUserFieldValue(current, 'role', value ?? 'viewer'),
                        )
                      }
                      data={field.options?.map((option) => ({
                        value: option.value,
                        label: option.label,
                      }))}
                    />
                  )
                }

                if (field.key === 'status') {
                  return (
                    <div key={field.key}>
                      <Switch
                        label={`${field.label}${field.rules.required ? ' *' : ''}：${STATUS_LABELS[form.status]}`}
                        checked={form.status === 'active'}
                        onChange={(e) =>
                          setForm((current) =>
                            withUserFieldValue(
                              current,
                              'status',
                              e.currentTarget.checked ? 'active' : 'disabled',
                            ),
                          )
                        }
                      />
                      {errors.status && (
                        <Text size="xs" c="red">
                          {errors.status}
                        </Text>
                      )}
                    </div>
                  )
                }

                if (field.key === 'hireDate') {
                  return (
                    <DateInput
                      key={field.key}
                      label={field.label}
                      valueFormat="YYYY-MM-DD"
                      placeholder={field.placeholder}
                      value={form.hireDate ? dayjs(form.hireDate).toDate() : null}
                      onChange={(value) =>
                        setForm((current) =>
                          withUserFieldValue(
                            current,
                            'hireDate',
                            value ? dayjs(value).format('YYYY-MM-DD') : '',
                          ),
                        )
                      }
                    />
                  )
                }

                if (field.key === 'remark') {
                  return (
                    <Textarea
                      key={field.key}
                      label={field.label}
                      minRows={3}
                      placeholder={field.placeholder}
                      value={form.remark}
                      error={errors.remark}
                      onChange={(e) =>
                        setForm((current) =>
                          withUserFieldValue(
                            current,
                            'remark',
                            e.currentTarget.value,
                          ),
                        )
                      }
                    />
                  )
                }

                return (
                  <TextInput
                    key={field.key}
                    label={field.label}
                    required={Boolean(field.rules.required)}
                    type={field.control === 'email' ? 'email' : 'text'}
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    error={errors[field.key]}
                    onChange={(e) =>
                      setForm((current) =>
                        withUserFieldValue(
                          current,
                          field.key,
                          e.currentTarget.value,
                        ),
                      )
                    }
                  />
                )
              })}
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
