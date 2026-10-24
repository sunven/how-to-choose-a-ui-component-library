import { useMemo, useState } from 'react'
import {
  Button,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  message,
  theme,
} from 'antd'
import type { ColumnType, ColumnsType, TableProps } from 'antd/es/table'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import {
  SHOWCASE_FILTERS,
  SHOWCASE_FILTER_OPTIONS,
  USER_FORM_FIELDS,
  USER_TABLE_COLUMNS,
  type UserFieldSpec,
} from '@/domain/showcaseSpec'
import {
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

function fieldRules(field: UserFieldSpec) {
  const rules: { required?: boolean; type?: 'email'; message: string }[] = []
  if (field.rules.required) {
    rules.push({ required: true, message: field.rules.required })
  }
  if (field.rules.email) {
    rules.push({ type: 'email', message: field.rules.email })
  }
  return rules
}

function FormField({ field }: { field: UserFieldSpec }) {
  const rules = fieldRules(field)

  if (field.key === 'status') {
    return (
      <Form.Item
        label={field.label}
        name={field.key}
        rules={rules}
        valuePropName="checked"
        getValueFromEvent={(checked: boolean) =>
          checked ? 'active' : 'disabled'
        }
        getValueProps={(value: UserStatus) => ({ checked: value === 'active' })}
      >
        <Switch
          checkedChildren={STATUS_LABELS.active}
          unCheckedChildren={STATUS_LABELS.disabled}
        />
      </Form.Item>
    )
  }

  if (field.key === 'hireDate') {
    return (
      <Form.Item
        label={field.label}
        name={field.key}
        rules={rules}
        getValueFromEvent={(value: dayjs.Dayjs | null) =>
          value ? value.format('YYYY-MM-DD') : ''
        }
        getValueProps={(value: string) => ({
          value: value ? dayjs(value) : null,
        })}
      >
        <DatePicker className="w-full" placeholder={field.placeholder} />
      </Form.Item>
    )
  }

  return (
    <Form.Item label={field.label} name={field.key} rules={rules}>
      {field.control === 'select' ? (
        <Select
          placeholder={field.placeholder}
          options={field.options?.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
        />
      ) : field.control === 'textarea' ? (
        <Input.TextArea rows={3} placeholder={field.placeholder} />
      ) : (
        <Input
          type={field.control === 'email' ? 'email' : 'text'}
          placeholder={field.placeholder}
        />
      )}
    </Form.Item>
  )
}

export function AntDesignShowcase({ users }: ShowcaseProps) {
  const mode = useThemeMode()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form] = Form.useForm<UserInput>()

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue(emptyUserInput())
    setOpen(true)
  }

  const openEdit = (user: User) => {
    setEditing(user)
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      hireDate: user.hireDate,
      remark: user.remark,
    })
    setOpen(true)
  }

  const submit = async () => {
    let values: UserInput
    try {
      values = await form.validateFields()
    } catch {
      return
    }
    const input: UserInput = {
      name: values.name.trim(),
      email: values.email.trim(),
      role: values.role,
      status: values.status,
      hireDate: values.hireDate ? String(values.hireDate).slice(0, 10) : '',
      remark: (values.remark ?? '').trim(),
    }
    const result = editing
      ? users.updateUser(editing.id, input)
      : users.createUser(input)
    if (!result.ok) {
      message.error(Object.values(result.errors).find(Boolean) ?? '请检查表单')
      return
    }

    if (editing) {
      message.success('已更新用户')
    } else {
      message.success('已创建用户')
    }
    setOpen(false)
  }

  const columns: ColumnsType<User> = useMemo(
    () => [
      ...USER_TABLE_COLUMNS.map((field) => {
        const column: ColumnType<User> = {
          title: field.label,
          dataIndex: field.key,
          key: field.key,
        }

        if (field.key === 'role') {
          column.render = (role: UserRole) => ROLE_LABELS[role]
        } else if (field.key === 'status') {
          column.render = (status: UserStatus) => (
            <Tag color={status === 'active' ? 'success' : 'default'}>
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
                : null
        }

        return column
      }),
      {
        title: '操作',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Button type="link" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认删除该用户？"
              okText="删除"
              cancelText="取消"
              onConfirm={() => {
                users.deleteUser(record.id)
                message.success('已删除')
              }}
            >
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [users],
  )

  const onChange: TableProps<User>['onChange'] = (_p, _f, sorter) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter
    if (s?.columnKey === 'hireDate' || s?.field === 'hireDate') {
      if (s.order === 'ascend') users.setHireDateSort('asc')
      else if (s.order === 'descend') users.setHireDateSort('desc')
      else users.setHireDateSort('none')
    }
  }

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <div className="space-y-4">
        <Space wrap className="w-full justify-between">
          <Space wrap>
            <Input.Search
              allowClear
              placeholder={SHOWCASE_FILTERS.keywordPlaceholder}
              style={{ width: 220 }}
              value={users.filters.keyword}
              onChange={(e) => users.setKeyword(e.target.value)}
            />
            <Select
              style={{ width: 120 }}
              value={users.filters.role}
              onChange={users.setRoleFilter}
              options={SHOWCASE_FILTER_OPTIONS.role}
            />
            <Select
              style={{ width: 120 }}
              value={users.filters.status}
              onChange={users.setStatusFilter}
              options={SHOWCASE_FILTER_OPTIONS.status}
            />
          </Space>
          <Button type="primary" onClick={openCreate}>
            新建用户
          </Button>
        </Space>

        <Table<User>
          rowKey="id"
          size="middle"
          columns={columns}
          dataSource={users.users}
          onChange={onChange}
          rowSelection={{
            selectedRowKeys: users.selectedIds,
            onChange: (keys) => users.replacePageSelection(keys as string[]),
          }}
          pagination={{
            current: users.page,
            pageSize: users.pageSize,
            total: users.total,
            showSizeChanger: false,
            showTotal: (t) => `共 ${t} 条`,
            onChange: users.setPage,
          }}
        />

        <Modal
          title={editing ? '编辑用户' : '新建用户'}
          open={open}
          onCancel={() => setOpen(false)}
          onOk={submit}
          okText="提交"
          cancelText="取消"
          destroyOnClose
        >
          <Form form={form} layout="vertical" className="mt-2">
            {USER_FORM_FIELDS.map((field) => (
              <FormField key={field.key} field={field} />
            ))}
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  )
}
