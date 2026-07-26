import { expect, test, vi } from 'vitest'
import type { User, UserInput } from './user'
import {
  createShowcaseScenario,
  type ShowcaseUserStore,
} from './showcaseScenario'

function makeUsers(count: number): User[] {
  return Array.from({ length: count }, (_, index) => {
    const number = index + 1
    return {
      id: `u${number}`,
      name: `User ${String(number).padStart(2, '0')}`,
      email: `user${number}@example.com`,
      role: number % 2 === 0 ? 'editor' : 'viewer',
      status: number % 3 === 0 ? 'disabled' : 'active',
      hireDate: `2024-01-${String(number).padStart(2, '0')}`,
      remark: '',
    }
  })
}

function createUserStore(initialUsers: User[]) {
  let users = initialUsers
  const listeners = new Set<() => void>()
  const calls = {
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  }

  function emit() {
    for (const listener of listeners) listener()
  }

  const store: ShowcaseUserStore = {
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot() {
      return users
    },
    create(input) {
      calls.create(input)
      const user = { ...input, id: `u${users.length + 1}` }
      users = [user, ...users]
      emit()
      return user
    },
    update(id, input) {
      calls.update(id, input)
      users = users.map((user) => (user.id === id ? { ...input, id } : user))
      emit()
    },
    remove(id) {
      calls.remove(id)
      users = users.filter((user) => user.id !== id)
      emit()
    },
  }

  return {
    store,
    calls,
    listenerCount: () => listeners.size,
    replace(nextUsers: User[]) {
      users = nextUsers
      emit()
    },
  }
}

function validInput(overrides: Partial<UserInput> = {}): UserInput {
  return {
    name: 'New User',
    email: 'new@example.com',
    role: 'viewer',
    status: 'active',
    hireDate: '2024-02-01',
    remark: '',
    ...overrides,
  }
}

test('filters and sorts users behind one snapshot interface', () => {
  const { store } = createUserStore(makeUsers(12))
  const scenario = createShowcaseScenario(store)

  scenario.setPage(2)
  scenario.setKeyword('USER12@EXAMPLE.COM')
  expect(scenario.getSnapshot()).toMatchObject({ total: 1, page: 1, pageCount: 1 })
  expect(scenario.getSnapshot().users.map((user) => user.id)).toEqual(['u12'])

  scenario.setKeyword('')
  scenario.setRoleFilter('editor')
  expect(scenario.getSnapshot().filters.role).toBe('editor')
  expect(scenario.getSnapshot().users.every((user) => user.role === 'editor')).toBe(true)

  scenario.setRoleFilter('all')
  scenario.setHireDateSort('desc')
  expect(scenario.getSnapshot().users[0]?.id).toBe('u12')
  scenario.cycleHireDateSort()
  expect(scenario.getSnapshot().hireDateSort).toBe('none')
})

test('clamps the page when shared data removes the last page', () => {
  const source = createUserStore(makeUsers(21))
  const scenario = createShowcaseScenario(source.store)
  const unsubscribe = scenario.subscribe(() => {})

  scenario.setPage(3)
  expect(scenario.getSnapshot().page).toBe(3)

  source.replace(makeUsers(11))
  expect(scenario.getSnapshot()).toMatchObject({ page: 2, pageCount: 2, total: 11 })

  unsubscribe()
})

test('preserves selection across pages and filters while page selection stays local', () => {
  const { store } = createUserStore(makeUsers(21))
  const scenario = createShowcaseScenario(store)

  scenario.toggleSelectAllPage(true)
  expect(scenario.getSnapshot().selectedIds).toHaveLength(10)

  scenario.setPage(2)
  scenario.replacePageSelection(['u11'])
  expect(scenario.getSnapshot().selectedIds).toEqual([
    'u1',
    'u2',
    'u3',
    'u4',
    'u5',
    'u6',
    'u7',
    'u8',
    'u9',
    'u10',
    'u11',
  ])

  scenario.setKeyword('user 11')
  expect(scenario.getSnapshot().selectedIds).toContain('u1')
  expect(scenario.getSnapshot().selectedIds).toContain('u11')

  scenario.replacePageSelection([])
  expect(scenario.getSnapshot().selectedIds).toContain('u1')
  expect(scenario.getSnapshot().selectedIds).not.toContain('u11')
})

test('rejects invalid create and update commands before they reach the store', () => {
  const source = createUserStore(makeUsers(1))
  const scenario = createShowcaseScenario(source.store)
  const invalid = validInput({ name: ' ', email: 'invalid' })

  const createResult = scenario.createUser(invalid)
  const updateResult = scenario.updateUser('u1', invalid)

  expect(createResult).toEqual({
    ok: false,
    errors: { name: '请输入姓名', email: '邮箱格式不正确' },
  })
  expect(updateResult).toEqual(createResult)
  expect(source.calls.create).not.toHaveBeenCalled()
  expect(source.calls.update).not.toHaveBeenCalled()
})

test('owns CRUD page and selection invariants', () => {
  const source = createUserStore(makeUsers(11))
  const scenario = createShowcaseScenario(source.store)

  scenario.setPage(2)
  scenario.toggleSelect('u11', true)
  expect(scenario.createUser(validInput())).toEqual({ ok: true })
  expect(scenario.getSnapshot()).toMatchObject({ page: 1, total: 12 })

  expect(scenario.updateUser('u1', validInput({ name: 'Updated' }))).toEqual({ ok: true })
  expect(source.store.getSnapshot().find((user) => user.id === 'u1')?.name).toBe('Updated')

  scenario.deleteUser('u11')
  expect(scenario.getSnapshot().selectedIds).not.toContain('u11')
  expect(source.calls.remove).toHaveBeenCalledWith('u11')
})

test('shares User data without sharing UI state between scenario mounts', () => {
  const source = createUserStore(makeUsers(3))
  const first = createShowcaseScenario(source.store)
  const second = createShowcaseScenario(source.store)
  const unsubscribeFirst = first.subscribe(() => {})
  const unsubscribeSecond = second.subscribe(() => {})

  first.setKeyword('user 01')
  expect(first.getSnapshot().total).toBe(1)
  expect(second.getSnapshot().total).toBe(3)

  first.createUser(validInput())
  expect(first.getSnapshot().total).toBe(1)
  expect(second.getSnapshot().total).toBe(4)

  unsubscribeFirst()
  unsubscribeSecond()
})

test('subscribes lazily and releases the shared store on unsubscribe or dispose', () => {
  const source = createUserStore(makeUsers(2))
  const scenario = createShowcaseScenario(source.store)
  const listener = vi.fn()

  expect(source.listenerCount()).toBe(0)
  const unsubscribe = scenario.subscribe(listener)
  expect(source.listenerCount()).toBe(1)

  scenario.setStatusFilter('disabled')
  expect(listener).toHaveBeenCalledTimes(1)

  unsubscribe()
  expect(source.listenerCount()).toBe(0)

  scenario.subscribe(listener)
  scenario.dispose()
  expect(source.listenerCount()).toBe(0)

  source.replace(makeUsers(3))
  expect(listener).toHaveBeenCalledTimes(1)
})
