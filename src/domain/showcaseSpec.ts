import type { HireDateSort } from './showcaseScenario'
import {
  ROLE_OPTIONS,
  STATUS_OPTIONS,
  USER_VALIDATION_MESSAGES,
  type UserInput,
} from './user'

export type UserFieldKey = keyof UserInput
export type UserFieldControl = 'text' | 'email' | 'select' | 'date' | 'textarea'

export interface UserFieldRules {
  readonly required?: string
  readonly email?: string
}

export interface UserFieldOption {
  readonly value: string
  readonly label: string
}

export interface UserFieldSpec {
  readonly key: UserFieldKey
  readonly label: string
  readonly table: boolean
  readonly form: boolean
  readonly control: UserFieldControl
  readonly placeholder: string
  readonly sortable?: boolean
  readonly options?: readonly UserFieldOption[]
  readonly rules: UserFieldRules
}

export interface UserFormRule {
  readonly required?: boolean
  readonly type?: 'email'
  readonly message: string
}

export const USER_FIELDS: readonly UserFieldSpec[] = [
  {
    key: 'name',
    label: '姓名',
    table: true,
    form: true,
    control: 'text',
    placeholder: '请输入姓名',
    rules: { required: USER_VALIDATION_MESSAGES.nameRequired },
  },
  {
    key: 'email',
    label: '邮箱',
    table: true,
    form: true,
    control: 'email',
    placeholder: '请输入邮箱',
    rules: {
      required: USER_VALIDATION_MESSAGES.emailRequired,
      email: USER_VALIDATION_MESSAGES.emailInvalid,
    },
  },
  {
    key: 'role',
    label: '角色',
    table: true,
    form: true,
    control: 'select',
    placeholder: '请选择角色',
    options: ROLE_OPTIONS,
    rules: { required: USER_VALIDATION_MESSAGES.roleRequired },
  },
  {
    key: 'status',
    label: '状态',
    table: true,
    form: true,
    control: 'select',
    placeholder: '请选择状态',
    options: STATUS_OPTIONS,
    rules: { required: USER_VALIDATION_MESSAGES.statusRequired },
  },
  {
    key: 'hireDate',
    label: '入职日期',
    table: true,
    form: true,
    control: 'date',
    placeholder: '请选择入职日期',
    sortable: true,
    rules: {},
  },
  {
    key: 'remark',
    label: '备注',
    table: false,
    form: true,
    control: 'textarea',
    placeholder: '请输入备注',
    rules: {},
  },
]

export const USER_TABLE_COLUMNS = USER_FIELDS.filter((field) => field.table)
export const USER_FORM_FIELDS = USER_FIELDS.filter((field) => field.form)

export const USER_FIELD_BY_KEY = Object.fromEntries(
  USER_FIELDS.map((field) => [field.key, field]),
) as Record<UserFieldKey, UserFieldSpec>

/** Library-agnostic validation rules; form libraries add their own triggers. */
export function fieldFormRules(field: UserFieldSpec): UserFormRule[] {
  const rules: UserFormRule[] = []
  if (field.rules.required) {
    rules.push({ required: true, message: field.rules.required })
  }
  if (field.rules.email) {
    rules.push({ type: 'email', message: field.rules.email })
  }
  return rules
}

export const HIRE_DATE_SORT_LABELS: Record<HireDateSort, string> = {
  none: '默认',
  asc: '升序',
  desc: '降序',
}

export const SHOWCASE_FILTERS = {
  keywordPlaceholder: '搜索姓名 / 邮箱',
  roleAll: '全部角色',
  statusAll: '全部状态',
} as const

export const SHOWCASE_FILTER_OPTIONS = {
  role: [
    { value: 'all' as const, label: SHOWCASE_FILTERS.roleAll },
    ...ROLE_OPTIONS,
  ],
  status: [
    { value: 'all' as const, label: SHOWCASE_FILTERS.statusAll },
    ...STATUS_OPTIONS,
  ],
}

export function withUserFieldValue(
  input: UserInput,
  key: UserFieldKey,
  value: string,
): UserInput {
  return { ...input, [key]: value } as UserInput
}
