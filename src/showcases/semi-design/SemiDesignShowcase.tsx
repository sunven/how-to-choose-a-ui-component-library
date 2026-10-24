import { useMemo, useRef, useState } from 'react'
import {
  Button,
  Form,
  Input,
  LocaleProvider,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Toast,
  Typography,
} from '@douyinfe/semi-ui'
import type { FormApi } from '@douyinfe/semi-ui/lib/es/form'
import type { ColumnProps } from '@douyinfe/semi-ui/lib/es/table'
import zh_CN from '@douyinfe/semi-ui/lib/es/locale/source/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import '@douyinfe/semi-ui/dist/css/semi.min.css'
import {
  SHOWCASE_FILTERS,
  SHOWCASE_FILTER_OPTIONS,
  USER_FORM_FIELDS,
  USER_TABLE_COLUMNS,
} from '@/domain/showcaseSpec'
import {
  EMAIL_RE,
  ROLE_LABELS,
  STATUS_LABELS,
  emptyUserInput,
  type User,
  type UserInput,
  type UserRole,
  type UserStatus,
} from '@/domain/user'
import { useThemeMode } from '@/domain/useThemeMode'
import type { ShowcaseProps } from '../types'

dayjs.locale('zh-cn')

export function SemiDesignShowcase({ users }: ShowcaseProps) {
  // body[theme-mode] is applied by themeModeStore (Semi official dark)
  useThemeMode()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [statusActive, setStatusActive] = useState(true)
  const formApiRef = useRef<FormApi<UserInput> | null>(null)

  const openCreate = () => {
    const initial = emptyUserInput()
    setEditing(null)
    setStatusActive(initial.status === 'active')
    setOpen(true)
    queueMicrotask(() => formApiRef.current?.setValues(initial, { isOverride: true }))
  }

  const openEdit = (user: User) => {
    setEditing(user)
    setStatusActive(user.status === 'active')
    setOpen(true)
    queueMicrotask(() =>
      formApiRef.current?.setValues(
        {
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          hireDate: user.hireDate,
          remark: user.remark,
        },
        { isOverride: true },
      ),
    )
  }

  const submit = async () => {
    try {
      const values = await formApiRef.current?.validate()
      if (!values) return
      const input: UserInput = {
        name: String(values.name ?? '').trim(),
        email: String(values.email ?? '').trim(),
        role: values.role as UserRole,
        status: values.status as UserStatus,
        hireDate: values.hireDate
          ? dayjs(values.hireDate as string | Date).format('YYYY-MM-DD')
          : '',
        remark: String(values.remark ?? '').trim(),
      }
      const result = editing
        ? users.updateUser(editing.id, input)
        : users.createUser(input)
      if (!result.ok) {
        Toast.error(Object.values(result.errors).find(Boolean) ?? '请检查表单')
        return
      }

      if (editing) {
        Toast.success('已更新用户')
      } else {
        Toast.success('已创建用户')
      }
      setOpen(false)
    } catch {
      /* validation failed */
    }
  }

  const columns: ColumnProps<User>[] = useMemo(
    () => [
      ...USER_TABLE_COLUMNS.map((field) => {
        const column: ColumnProps<User> = {
          title: field.label,
          dataIndex: field.key,
        }

        if (field.key === 'role') {
          column.render = (role: UserRole) => ROLE_LABELS[role]
        } else if (field.key === 'status') {
          column.render = (status: UserStatus) => (
            <Tag color={status === 'active' ? 'green' : 'grey'}>
              {STATUS_LABELS[status]}
            </Tag>
          )
        } else if (field.sortable) {
          column.sorter = true
          column.sortOrder =
            users.hireDateSort === 'asc'
              ? 'ascend'
              : users.hireDateSort === 'desc'
                ? 'descend'
                : false
        }

        return column
      }),
      {
        title: '操作',
        dataIndex: 'id',
        render: (_id: string, record: User) => (
          <Space>
            <Button theme="borderless" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认删除该用户？"
              okText="删除"
              cancelText="取消"
              onConfirm={() => {
                users.deleteUser(record.id)
                Toast.success('已删除')
              }}
            >
              <Button theme="borderless" type="danger" size="small">
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [users],
  )

  return (
    <LocaleProvider locale={zh_CN}>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <Space wrap>
            <Input
              showClear
              placeholder={SHOWCASE_FILTERS.keywordPlaceholder}
              style={{ width: 220 }}
              value={users.filters.keyword}
              onChange={users.setKeyword}
            />
            <Select
              style={{ width: 120 }}
              value={users.filters.role}
              onChange={(v) => users.setRoleFilter(v as typeof users.filters.role)}
              optionList={SHOWCASE_FILTER_OPTIONS.role}
            />
            <Select
              style={{ width: 120 }}
              value={users.filters.status}
              onChange={(v) => users.setStatusFilter(v as typeof users.filters.status)}
              optionList={SHOWCASE_FILTER_OPTIONS.status}
            />
          </Space>
          <Button theme="solid" type="primary" onClick={openCreate}>
            新建用户
          </Button>
        </div>

        <Table<User>
          rowKey="id"
          size="middle"
          columns={columns}
          dataSource={users.users}
          onChange={(changeInfo) => {
            const sorter = changeInfo.sorter
            if (!sorter || sorter.dataIndex !== 'hireDate') return
            if (sorter.sortOrder === 'ascend') users.setHireDateSort('asc')
            else if (sorter.sortOrder === 'descend') users.setHireDateSort('desc')
            else users.setHireDateSort('none')
          }}
          rowSelection={{
            selectedRowKeys: users.selectedIds,
            onChange: (keys) => users.replacePageSelection((keys as string[]) ?? []),
          }}
          pagination={{
            currentPage: users.page,
            pageSize: users.pageSize,
            total: users.total,
            showSizeChanger: false,
            formatPageText: (p) =>
              p ? `第 ${p.currentStart}-${p.currentEnd} 条，共 ${p.total} 条` : '',
            onPageChange: users.setPage,
          }}
        />

        <Modal
          title={editing ? '编辑用户' : '新建用户'}
          visible={open}
          onCancel={() => setOpen(false)}
          onOk={submit}
          okText="提交"
          cancelText="取消"
          closeOnEsc
        >
          <Form<UserInput>
            getFormApi={(api) => {
              formApiRef.current = api
            }}
            labelPosition="top"
            initValues={emptyUserInput()}
          >
            {USER_FORM_FIELDS.map((field) => {
              if (field.key === 'role') {
                return (
                  <Form.Select
                    key={field.key}
                    field={field.key}
                    label={field.label}
                    style={{ width: '100%' }}
                    rules={
                      field.rules.required
                        ? [{ required: true, message: field.rules.required }]
                        : []
                    }
                    optionList={field.options?.map((option) => ({
                      value: option.value,
                      label: option.label,
                    }))}
                  />
                )
              }

              if (field.key === 'status') {
                return (
                  <Form.Slot
                    key={field.key}
                    label={`${field.label}${field.rules.required ? ' *' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={statusActive}
                        onChange={(checked) => {
                          setStatusActive(checked)
                          formApiRef.current?.setValue(
                            'status',
                            checked ? 'active' : 'disabled',
                          )
                        }}
                      />
                      <Typography.Text>
                        {statusActive ? STATUS_LABELS.active : STATUS_LABELS.disabled}
                      </Typography.Text>
                    </div>
                  </Form.Slot>
                )
              }

              if (field.key === 'hireDate') {
                return (
                  <Form.DatePicker
                    key={field.key}
                    field={field.key}
                    label={field.label}
                    style={{ width: '100%' }}
                    type="date"
                    format="yyyy-MM-dd"
                    placeholder={field.placeholder}
                  />
                )
              }

              if (field.key === 'remark') {
                return (
                  <Form.TextArea
                    key={field.key}
                    field={field.key}
                    label={field.label}
                    placeholder={field.placeholder}
                    rows={3}
                  />
                )
              }

              return (
                <Form.Input
                  key={field.key}
                  field={field.key}
                  label={field.label}
                  placeholder={field.placeholder}
                  rules={
                    field.rules.email
                      ? [
                          { required: true, message: field.rules.required },
                          {
                            validator: (_rule: unknown, value: unknown) =>
                              !value || EMAIL_RE.test(String(value)),
                            message: field.rules.email,
                          },
                        ]
                      : field.rules.required
                        ? [{ required: true, message: field.rules.required }]
                        : []
                  }
                />
              )
            })}
          </Form>
        </Modal>
      </div>
    </LocaleProvider>
  )
}
