import { useMemo, useState } from 'react'
import {
  Button,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  Message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
} from '@arco-design/web-react'
import type { TableColumnProps, TableProps } from '@arco-design/web-react'
import zhCN from '@arco-design/web-react/es/locale/zh-CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import '@arco-design/web-react/dist/css/arco.css'
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

const FormItem = Form.Item

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
      <FormItem
        label={field.label}
        field={field.key}
        rules={rules}
        triggerPropName="checked"
        formatter={(value) => value === 'active'}
        normalize={(value) => (value ? 'active' : 'disabled')}
      >
        <Switch
          checkedText={STATUS_LABELS.active}
          uncheckedText={STATUS_LABELS.disabled}
        />
      </FormItem>
    )
  }

  if (field.key === 'hireDate') {
    return (
      <FormItem
        label={field.label}
        field={field.key}
        rules={rules}
        formatter={(value) => (value ? dayjs(String(value)) : undefined)}
        normalize={(value) => (value ? dayjs(value).format('YYYY-MM-DD') : '')}
      >
        <DatePicker style={{ width: '100%' }} placeholder={field.placeholder} />
      </FormItem>
    )
  }

  return (
    <FormItem label={field.label} field={field.key} rules={rules}>
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
    </FormItem>
  )
}

export function ArcoDesignShowcase({ users }: ShowcaseProps) {
  // body[arco-theme] is applied by themeModeStore; mode keeps ConfigProvider in sync if needed
  useThemeMode()
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
    try {
      const values = await form.validate()
      const input: UserInput = {
        name: String(values.name ?? '').trim(),
        email: String(values.email ?? '').trim(),
        role: values.role as UserRole,
        status: values.status as UserStatus,
        hireDate: values.hireDate ? String(values.hireDate).slice(0, 10) : '',
        remark: String(values.remark ?? '').trim(),
      }
      const result = editing
        ? users.updateUser(editing.id, input)
        : users.createUser(input)
      if (!result.ok) {
        Message.error(Object.values(result.errors).find(Boolean) ?? '请检查表单')
        return
      }

      if (editing) {
        Message.success('已更新用户')
      } else {
        Message.success('已创建用户')
      }
      setOpen(false)
    } catch {
      /* validation failed */
    }
  }

  const columns: TableColumnProps<User>[] = useMemo(
    () => [
      ...USER_TABLE_COLUMNS.map((field) => {
        const column: TableColumnProps<User> = {
          title: field.label,
          dataIndex: field.key,
        }

        if (field.key === 'role') {
          column.render = (role: UserRole) => ROLE_LABELS[role]
        } else if (field.key === 'status') {
          column.render = (status: UserStatus) => (
            <Tag color={status === 'active' ? 'green' : 'gray'}>
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
                : undefined
        }

        return column
      }),
      {
        title: '操作',
        dataIndex: 'id',
        render: (_: string, record: User) => (
          <Space>
            <Button type="text" size="small" onClick={() => openEdit(record)}>
              编辑
            </Button>
            <Popconfirm
              title="确认删除该用户？"
              okText="删除"
              cancelText="取消"
              onOk={() => {
                users.deleteUser(record.id)
                Message.success('已删除')
              }}
            >
              <Button type="text" size="small" status="danger">
                删除
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [users],
  )

  const onChange: TableProps<User>['onChange'] = (_pagination, sorter) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter
    if (s && s.field === 'hireDate') {
      if (s.direction === 'ascend') users.setHireDateSortOrder('asc')
      else if (s.direction === 'descend') users.setHireDateSortOrder('desc')
      else users.setHireDateSortOrder('none')
    }
  }

  return (
    <ConfigProvider locale={zhCN}>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <Space wrap>
            <Input.Search
              allowClear
              placeholder={SHOWCASE_FILTERS.keywordPlaceholder}
              style={{ width: 220 }}
              value={users.filters.keyword}
              onChange={users.setKeyword}
            />
            <Select
              style={{ width: 120 }}
              value={users.filters.role}
              onChange={(v) => users.setRoleFilter(v as typeof users.filters.role)}
              options={SHOWCASE_FILTER_OPTIONS.role}
            />
            <Select
              style={{ width: 120 }}
              value={users.filters.status}
              onChange={(v) => users.setStatusFilter(v as typeof users.filters.status)}
              options={SHOWCASE_FILTER_OPTIONS.status}
            />
          </Space>
          <Button type="primary" onClick={openCreate}>
            新建用户
          </Button>
        </div>

        <Table<User>
          rowKey="id"
          size="middle"
          columns={columns}
          data={users.users}
          onChange={onChange}
          rowSelection={{
            selectedRowKeys: users.selectedIds,
            onChange: (keys) => users.setSelectedIds(keys as string[]),
          }}
          pagination={{
            current: users.page,
            pageSize: users.pageSize,
            total: users.total,
            showTotal: true,
            sizeCanChange: false,
            onChange: users.setPage,
          }}
        />

        <Modal
          title={editing ? '编辑用户' : '新建用户'}
          visible={open}
          onCancel={() => setOpen(false)}
          onOk={submit}
          okText="提交"
          cancelText="取消"
          unmountOnExit
        >
          <Form form={form} layout="vertical" autoComplete="off">
            {USER_FORM_FIELDS.map((field) => (
              <FormField key={field.key} field={field} />
            ))}
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  )
}
