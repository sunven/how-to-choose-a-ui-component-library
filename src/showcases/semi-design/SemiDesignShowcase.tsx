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
      if (editing) {
        users.updateUser(editing.id, input)
        Toast.success('已更新用户')
      } else {
        users.createUser(input)
        Toast.success('已创建用户')
      }
      setOpen(false)
    } catch {
      /* validation failed */
    }
  }

  const columns: ColumnProps<User>[] = useMemo(
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
          <Tag color={status === 'active' ? 'green' : 'grey'}>{STATUS_LABELS[status]}</Tag>
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
              : false,
      },
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
              placeholder="搜索姓名 / 邮箱"
              style={{ width: 220 }}
              value={users.filters.keyword}
              onChange={users.setKeyword}
            />
            <Select
              style={{ width: 120 }}
              value={users.filters.role}
              onChange={(v) => users.setRoleFilter(v as typeof users.filters.role)}
              optionList={[
                { value: 'all', label: '全部角色' },
                ...ROLE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
              ]}
            />
            <Select
              style={{ width: 120 }}
              value={users.filters.status}
              onChange={(v) => users.setStatusFilter(v as typeof users.filters.status)}
              optionList={[
                { value: 'all', label: '全部状态' },
                { value: 'active', label: STATUS_LABELS.active },
                { value: 'disabled', label: STATUS_LABELS.disabled },
              ]}
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
            if (sorter.sortOrder === 'ascend') users.setHireDateSortOrder('asc')
            else if (sorter.sortOrder === 'descend') users.setHireDateSortOrder('desc')
            else users.setHireDateSortOrder('none')
          }}
          rowSelection={{
            selectedRowKeys: users.selectedIds,
            onChange: (keys) => users.setSelectedIds((keys as string[]) ?? []),
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
            <Form.Input
              field="name"
              label="姓名"
              placeholder="请输入姓名"
              rules={[{ required: true, message: '请输入姓名' }]}
            />
            <Form.Input
              field="email"
              label="邮箱"
              placeholder="name@example.com"
              rules={[
                { required: true, message: '请输入邮箱' },
                {
                  validator: (_rule, value) => {
                    if (!value) return true
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))
                  },
                  message: '邮箱格式不正确',
                },
              ]}
            />
            <Form.Select
              field="role"
              label="角色"
              style={{ width: '100%' }}
              rules={[{ required: true, message: '请选择角色' }]}
              optionList={ROLE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
            <Form.Slot label="状态">
              <div className="flex items-center gap-2">
                <Switch
                  checked={statusActive}
                  onChange={(checked) => {
                    setStatusActive(checked)
                    formApiRef.current?.setValue('status', checked ? 'active' : 'disabled')
                  }}
                />
                <Typography.Text>{statusActive ? '启用' : '禁用'}</Typography.Text>
              </div>
            </Form.Slot>
            <Form.DatePicker
              field="hireDate"
              label="入职日期"
              style={{ width: '100%' }}
              type="date"
              format="yyyy-MM-dd"
            />
            <Form.TextArea field="remark" label="备注" placeholder="可选" rows={3} />
          </Form>
        </Modal>
      </div>
    </LocaleProvider>
  )
}
