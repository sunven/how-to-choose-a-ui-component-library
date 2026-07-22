export type UserRole = 'admin' | 'editor' | 'viewer'
export type UserStatus = 'active' | 'disabled'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  /** ISO date string YYYY-MM-DD */
  hireDate: string
  remark: string
}

export type UserInput = Omit<User, 'id'>

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: '管理员',
  editor: '编辑',
  viewer: '访客',
}

export const STATUS_LABELS: Record<UserStatus, string> = {
  active: '启用',
  disabled: '禁用',
}

export const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'admin', label: ROLE_LABELS.admin },
  { value: 'editor', label: ROLE_LABELS.editor },
  { value: 'viewer', label: ROLE_LABELS.viewer },
]

export const STATUS_OPTIONS: { value: UserStatus; label: string }[] = [
  { value: 'active', label: STATUS_LABELS.active },
  { value: 'disabled', label: STATUS_LABELS.disabled },
]

export interface UserFormErrors {
  name?: string
  email?: string
  role?: string
  status?: string
  hireDate?: string
  remark?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateUserInput(input: UserInput): UserFormErrors {
  const errors: UserFormErrors = {}
  if (!input.name.trim()) errors.name = '请输入姓名'
  if (!input.email.trim()) errors.email = '请输入邮箱'
  else if (!EMAIL_RE.test(input.email.trim())) errors.email = '邮箱格式不正确'
  if (!input.role) errors.role = '请选择角色'
  if (!input.status) errors.status = '请选择状态'
  return errors
}

export function emptyUserInput(): UserInput {
  return {
    name: '',
    email: '',
    role: 'viewer',
    status: 'active',
    hireDate: new Date().toISOString().slice(0, 10),
    remark: '',
  }
}

export const SEED_USERS: User[] = [
  {
    id: 'u1',
    name: '陈思远',
    email: 'siyuan.chen@example.com',
    role: 'admin',
    status: 'active',
    hireDate: '2021-03-12',
    remark: '平台管理员',
  },
  {
    id: 'u2',
    name: '林晓雨',
    email: 'xiaoyu.lin@example.com',
    role: 'editor',
    status: 'active',
    hireDate: '2022-07-01',
    remark: '内容编辑',
  },
  {
    id: 'u3',
    name: '王浩然',
    email: 'haoran.wang@example.com',
    role: 'viewer',
    status: 'active',
    hireDate: '2023-01-18',
    remark: '',
  },
  {
    id: 'u4',
    name: '赵敏',
    email: 'min.zhao@example.com',
    role: 'editor',
    status: 'disabled',
    hireDate: '2020-11-05',
    remark: '已停用账号',
  },
  {
    id: 'u5',
    name: '周子墨',
    email: 'zimo.zhou@example.com',
    role: 'viewer',
    status: 'active',
    hireDate: '2024-02-20',
    remark: '实习访客',
  },
  {
    id: 'u6',
    name: '吴倩',
    email: 'qian.wu@example.com',
    role: 'admin',
    status: 'active',
    hireDate: '2019-08-09',
    remark: '安全合规',
  },
  {
    id: 'u7',
    name: '郑一诺',
    email: 'yinuo.zheng@example.com',
    role: 'editor',
    status: 'active',
    hireDate: '2023-09-14',
    remark: '',
  },
  {
    id: 'u8',
    name: '孙丽',
    email: 'li.sun@example.com',
    role: 'viewer',
    status: 'disabled',
    hireDate: '2022-04-30',
    remark: '长期未登录',
  },
  {
    id: 'u9',
    name: '马俊杰',
    email: 'junjie.ma@example.com',
    role: 'editor',
    status: 'active',
    hireDate: '2021-12-01',
    remark: '运营支持',
  },
  {
    id: 'u10',
    name: '黄嘉怡',
    email: 'jiayi.huang@example.com',
    role: 'viewer',
    status: 'active',
    hireDate: '2024-06-08',
    remark: '',
  },
  {
    id: 'u11',
    name: '徐涛',
    email: 'tao.xu@example.com',
    role: 'admin',
    status: 'active',
    hireDate: '2018-05-22',
    remark: '技术负责人',
  },
  {
    id: 'u12',
    name: '何美琳',
    email: 'meilin.he@example.com',
    role: 'editor',
    status: 'active',
    hireDate: '2023-03-03',
    remark: '设计协作',
  },
]
