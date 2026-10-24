import { describe, expect, it } from 'vitest'
import {
  SHOWCASE_FILTER_OPTIONS,
  SHOWCASE_FILTERS,
  USER_FIELDS,
  USER_FIELD_BY_KEY,
  USER_FORM_FIELDS,
  USER_TABLE_COLUMNS,
  withUserFieldValue,
  type UserFieldKey,
} from './showcaseSpec'
import {
  ROLE_OPTIONS,
  STATUS_OPTIONS,
  USER_VALIDATION_MESSAGES,
  emptyUserInput,
  validateUserInput,
  type UserInput,
  type UserRole,
  type UserStatus,
} from './user'

function field(key: UserFieldKey) {
  return USER_FIELDS.find((item) => item.key === key)
}

describe('Showcase Scenario Spec', () => {
  it('keeps the canonical field, form, and table order', () => {
    expect(USER_FIELDS.map((item) => item.key)).toEqual([
      'name',
      'email',
      'role',
      'status',
      'hireDate',
      'remark',
    ])
    expect(USER_FORM_FIELDS.map((item) => item.key)).toEqual([
      'name',
      'email',
      'role',
      'status',
      'hireDate',
      'remark',
    ])
    expect(USER_TABLE_COLUMNS.map((item) => item.key)).toEqual([
      'name',
      'email',
      'role',
      'status',
      'hireDate',
    ])
  })

  it('marks hireDate sortable and remark form-only', () => {
    expect(field('hireDate')?.sortable).toBe(true)
    expect(field('remark')?.table).toBe(false)
    expect(field('remark')?.form).toBe(true)
    expect(USER_FIELD_BY_KEY.role.label).toBe('角色')
  })

  it('uses the canonical validation messages', () => {
    const missing = {
      ...emptyUserInput(),
      name: '',
      email: '',
      role: '' as UserRole,
      status: '' as UserStatus,
    } satisfies UserInput

    expect(validateUserInput(missing)).toEqual({
      name: USER_VALIDATION_MESSAGES.nameRequired,
      email: USER_VALIDATION_MESSAGES.emailRequired,
      role: USER_VALIDATION_MESSAGES.roleRequired,
      status: USER_VALIDATION_MESSAGES.statusRequired,
    })
    expect(
      validateUserInput({ ...emptyUserInput(), email: 'not-an-email' }).email,
    ).toBe(USER_VALIDATION_MESSAGES.emailInvalid)

    expect(field('name')?.rules.required).toBe(
      USER_VALIDATION_MESSAGES.nameRequired,
    )
    expect(field('email')?.rules.required).toBe(
      USER_VALIDATION_MESSAGES.emailRequired,
    )
    expect(field('email')?.rules.email).toBe(
      USER_VALIDATION_MESSAGES.emailInvalid,
    )
    expect(field('role')?.rules.required).toBe(
      USER_VALIDATION_MESSAGES.roleRequired,
    )
    expect(field('status')?.rules.required).toBe(
      USER_VALIDATION_MESSAGES.statusRequired,
    )
  })

  it('uses the canonical role and status options', () => {
    expect(field('role')?.options).toEqual(ROLE_OPTIONS)
    expect(field('status')?.options).toEqual(STATUS_OPTIONS)
    expect(SHOWCASE_FILTER_OPTIONS.role[0]).toEqual({
      value: 'all',
      label: SHOWCASE_FILTERS.roleAll,
    })
    expect(SHOWCASE_FILTER_OPTIONS.status[0]).toEqual({
      value: 'all',
      label: SHOWCASE_FILTERS.statusAll,
    })
    expect(SHOWCASE_FILTER_OPTIONS.role.slice(1)).toEqual(ROLE_OPTIONS)
    expect(SHOWCASE_FILTER_OPTIONS.status.slice(1)).toEqual(STATUS_OPTIONS)
  })

  it('provides a label and placeholder for every field', () => {
    for (const item of USER_FIELDS) {
      expect(item.label).toBeTruthy()
      expect(item.placeholder).toBeTruthy()
    }
  })

  it('updates a field without mutating the input', () => {
    const input = emptyUserInput()
    const next = withUserFieldValue(input, 'name', '张三')

    expect(next.name).toBe('张三')
    expect(input.name).toBe('')
  })
})
