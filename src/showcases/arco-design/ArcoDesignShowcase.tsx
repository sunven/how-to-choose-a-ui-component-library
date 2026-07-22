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
  ROLE_LABELS,
  ROLE_OPTIONS,
  STATUS_LABELS,
  emptyUserInput,
  type User,
  type UserInput,
  type UserRole,
  type UserStatus,
} from '@/domain/user'
import type { ShowcaseProps } from '../types'

dayjs.locale('zh-cn')

const FormItem = Form.Item

export function ArcoDesignShowcase({ users }: ShowcaseProps) {
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
      if (editing) {
        users.updateUser(editing.id, input)
        Message.success('已更新用户')
      } else {
        users.createUser(input)
        Message.success('已创建用户')
      }
      setOpen(false)
    } catch {
      /* validation failed */
    }
  }

  const columns: TableColumnProps<User>[] = useMemo(
    () => [
      { title: '姓名', dataIndex: 'name' },
      { title: '邮箱', dataIndex: 'email' },
      {
        title: '角色',
        dataIndex: 'role',
        render: (role: UserRole) => ROLE_LABELS[role],
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (status: UserStatus) => (
          <Tag color={status === 'active' ? 'green' : 'gray'}>{STATUS_LABELS[status]}</Tag>
        ),
      },
      {
        title: '入职日期',
        dataIndex: 'hireDate',
        sorter: true,
        sortOrder:
          users.hireDateSort === 'asc'
            ? 'ascend'
            : users.hireDateSort === 'desc'
              ? 'descend'
              : undefined,
      },
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
              placeholder="搜索姓名 / 邮箱"
              style={{ width: 220 }}
              value={users.filters.keyword}
              onChange={users.setKeyword}
            />
            <Select
              style={{ width: 120 }}
              value={users.filters.role}
              onChange={(v) => users.setRoleFilter(v as typeof users.filters.role)}
              options={[
                { value: 'all', label: '全部角色' },
                ...ROLE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
              ]}
            />
            <Select
              style={{ width: 120 }}
              value={users.filters.status}
              onChange={(v) => users.setStatusFilter(v as typeof users.filters.status)}
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
            <FormItem
              label="姓名"
              field="name"
              rules={[{ required: true, message: '请输入姓名' }]}
            >
              <Input placeholder="请输入姓名" />
            </FormItem>
            <FormItem
              label="邮箱"
              field="email"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '邮箱格式不正确' },
              ]}
            >
              <Input placeholder="name@example.com" />
            </FormItem>
            <FormItem
              label="角色"
              field="role"
              rules={[{ required: true, message: '请选择角色' }]}
            >
              <Select options={ROLE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))} />
            </FormItem>
            <FormItem
              label="状态"
              field="status"
              triggerPropName="checked"
              formatter={(value) => value === 'active'}
              normalize={(value) => (value ? 'active' : 'disabled')}
            >
              <Switch checkedText="启用" uncheckedText="禁用" />
            </FormItem>
            <FormItem
              label="入职日期"
              field="hireDate"
              formatter={(value) => (value ? dayjs(String(value)) : undefined)}
              normalize={(value) => (value ? dayjs(value).format('YYYY-MM-DD') : '')}
            >
              <DatePicker style={{ width: '100%' }} />
            </FormItem>
            <FormItem label="备注" field="remark">
              <Input.TextArea rows={3} placeholder="可选" />
            </FormItem>
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  )
}
