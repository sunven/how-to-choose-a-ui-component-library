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
import type { ColumnsType, TableProps } from 'antd/es/table'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import {
  ROLE_LABELS,
  ROLE_OPTIONS,
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
    const values = await form.validateFields()
    const input: UserInput = {
      name: values.name.trim(),
      email: values.email.trim(),
      role: values.role,
      status: values.status,
      hireDate: values.hireDate ? String(values.hireDate).slice(0, 10) : '',
      remark: (values.remark ?? '').trim(),
    }
    if (editing) {
      users.updateUser(editing.id, input)
      message.success('已更新用户')
    } else {
      users.createUser(input)
      message.success('已创建用户')
    }
    setOpen(false)
  }

  const columns: ColumnsType<User> = useMemo(
    () => [
      { title: '姓名', dataIndex: 'name', key: 'name' },
      { title: '邮箱', dataIndex: 'email', key: 'email' },
      {
        title: '角色',
        dataIndex: 'role',
        key: 'role',
        render: (role: UserRole) => ROLE_LABELS[role],
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (status: UserStatus) => (
          <Tag color={status === 'active' ? 'success' : 'default'}>{STATUS_LABELS[status]}</Tag>
        ),
      },
      {
        title: '入职日期',
        dataIndex: 'hireDate',
        key: 'hireDate',
        sorter: true,
        sortOrder:
          users.hireDateSort === 'asc'
            ? 'ascend'
            : users.hireDateSort === 'desc'
              ? 'descend'
              : null,
      },
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
      if (s.order === 'ascend') users.setHireDateSortOrder('asc')
      else if (s.order === 'descend') users.setHireDateSortOrder('desc')
      else users.setHireDateSortOrder('none')
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
              placeholder="搜索姓名 / 邮箱"
              style={{ width: 220 }}
              value={users.filters.keyword}
              onChange={(e) => users.setKeyword(e.target.value)}
            />
            <Select
              style={{ width: 120 }}
              value={users.filters.role}
              onChange={users.setRoleFilter}
              options={[
                { value: 'all', label: '全部角色' },
                ...ROLE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
              ]}
            />
            <Select
              style={{ width: 120 }}
              value={users.filters.status}
              onChange={users.setStatusFilter}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'active', label: STATUS_LABELS.active },
                { value: 'disabled', label: STATUS_LABELS.disabled },
              ]}
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
            onChange: (keys) => users.setSelectedIds(keys as string[]),
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
            <Form.Item label="姓名" name="name" rules={[{ required: true, message: '请输入姓名' }]}>
              <Input placeholder="请输入姓名" />
            </Form.Item>
            <Form.Item
              label="邮箱"
              name="email"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '邮箱格式不正确' },
              ]}
            >
              <Input placeholder="name@example.com" />
            </Form.Item>
            <Form.Item label="角色" name="role" rules={[{ required: true, message: '请选择角色' }]}>
              <Select options={ROLE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} />
            </Form.Item>
            <Form.Item
              label="状态"
              name="status"
              rules={[{ required: true, message: '请选择状态' }]}
              valuePropName="checked"
              getValueFromEvent={(checked: boolean) => (checked ? 'active' : 'disabled')}
              getValueProps={(value: UserStatus) => ({ checked: value === 'active' })}
            >
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
            </Form.Item>
            <Form.Item
              label="入职日期"
              name="hireDate"
              getValueFromEvent={(d: dayjs.Dayjs | null) => (d ? d.format('YYYY-MM-DD') : '')}
              getValueProps={(v: string) => ({ value: v ? dayjs(v) : null })}
            >
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item label="备注" name="remark">
              <Input.TextArea rows={3} placeholder="可选" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  )
}
