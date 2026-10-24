/* @vitest-environment jsdom */

import { act, StrictMode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { createApp, defineComponent, h, nextTick, type App } from 'vue'
import { afterEach, expect, test } from 'vitest'
import type { ShowcaseUserStore } from '@/domain/showcaseScenario'
import type { User, UserInput } from '@/domain/user'
import { useUsers, type UsersController } from '@/domain/useUsers'
import { useShowcaseUsers } from './useShowcaseUsers'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

const CANONICAL_ACTIONS = [
  'setKeyword',
  'setRoleFilter',
  'setStatusFilter',
  'setPage',
  'setHireDateSort',
  'cycleHireDateSort',
  'replacePageSelection',
  'toggleSelect',
  'toggleSelectAllPage',
  'createUser',
  'updateUser',
  'deleteUser',
] as const

function createUserStore() {
  let users: User[] = [
    {
      id: 'u1',
      name: 'First User',
      email: 'first@example.com',
      role: 'viewer',
      status: 'active',
      hireDate: '2024-01-01',
      remark: '',
    },
    {
      id: 'u2',
      name: 'Second User',
      email: 'second@example.com',
      role: 'editor',
      status: 'disabled',
      hireDate: '2024-01-02',
      remark: '',
    },
  ]
  const listeners = new Set<() => void>()

  function emit() {
    for (const listener of listeners) listener()
  }

  const store: ShowcaseUserStore = {
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot: () => users,
    create(input: UserInput) {
      const user = { ...input, id: `u${users.length + 1}` }
      users = [user, ...users]
      emit()
      return user
    },
    update(id: string, input: UserInput) {
      users = users.map((user) => (user.id === id ? { ...input, id } : user))
      emit()
    },
    remove(id: string) {
      users = users.filter((user) => user.id !== id)
      emit()
    },
  }

  return { store, listenerCount: () => listeners.size }
}

let reactRoot: Root | undefined
let vueApp: App | undefined
let container: HTMLDivElement | undefined

afterEach(async () => {
  if (reactRoot) await act(async () => reactRoot?.unmount())
  vueApp?.unmount()
  container?.remove()
  reactRoot = undefined
  vueApp = undefined
  container = undefined
})

test('React adapter keeps one Store subscription in Strict Mode and releases it', async () => {
  const source = createUserStore()
  let users: UsersController | undefined
  function Probe() {
    users = useUsers(source.store)
    return <span>{users.total}</span>
  }

  container = document.createElement('div')
  document.body.appendChild(container)
  reactRoot = createRoot(container)

  await act(async () => {
    reactRoot?.render(
      <StrictMode>
        <Probe />
      </StrictMode>,
    )
  })

  expect(source.listenerCount()).toBe(1)
  expect(container.textContent).toBe('2')
  for (const action of CANONICAL_ACTIONS) {
    expect(users?.[action]).toBeTypeOf('function')
  }

  await act(async () => users?.setStatusFilter('disabled'))
  expect(container.textContent).toBe('1')

  await act(async () => reactRoot?.unmount())
  reactRoot = undefined
  expect(source.listenerCount()).toBe(0)
})

test('Vue adapter translates Scenario snapshots and releases its subscription', async () => {
  const source = createUserStore()
  let controller: ReturnType<typeof useShowcaseUsers> | undefined
  const Probe = defineComponent({
    setup() {
      const users = useShowcaseUsers(source.store)
      controller = users
      users.statusFilter.value = 'disabled'
      return () => h('span', users.total.value)
    },
  })

  container = document.createElement('div')
  document.body.appendChild(container)
  vueApp = createApp(Probe)
  vueApp.mount(container)
  await nextTick()

  expect(source.listenerCount()).toBe(1)
  expect(container.textContent).toBe('1')
  for (const action of CANONICAL_ACTIONS) {
    expect(controller?.[action]).toBeTypeOf('function')
  }

  vueApp.unmount()
  vueApp = undefined
  expect(source.listenerCount()).toBe(0)
})

test('both adapters share canonical sort and selection actions', async () => {
  const reactSource = createUserStore()
  let reactUsers: UsersController | undefined
  function Probe() {
    reactUsers = useUsers(reactSource.store)
    return <span>{reactUsers.total}</span>
  }

  container = document.createElement('div')
  document.body.appendChild(container)
  reactRoot = createRoot(container)

  await act(async () => {
    reactRoot?.render(<Probe />)
  })
  await act(async () => {
    reactUsers?.setHireDateSort('desc')
    reactUsers?.replacePageSelection(['u2'])
  })

  expect(reactUsers?.hireDateSort).toBe('desc')
  expect(reactUsers?.selectedIds).toEqual(['u2'])

  await act(async () => reactRoot?.unmount())
  reactRoot = undefined
  container.remove()
  container = undefined

  const vueSource = createUserStore()
  let vueUsers: ReturnType<typeof useShowcaseUsers> | undefined
  const VueProbe = defineComponent({
    setup() {
      vueUsers = useShowcaseUsers(vueSource.store)
      return () => h('span', vueUsers?.total.value ?? 0)
    },
  })
  const vueContainer = document.createElement('div')
  document.body.appendChild(vueContainer)
  const app = createApp(VueProbe)
  app.mount(vueContainer)
  await nextTick()

  vueUsers?.setHireDateSort('desc')
  vueUsers?.replacePageSelection(['u2'])
  await nextTick()

  expect(vueUsers?.hireDateSort.value).toBe('desc')
  expect(vueUsers?.selectedIds.value).toEqual(['u2'])

  app.unmount()
  vueContainer.remove()
})
