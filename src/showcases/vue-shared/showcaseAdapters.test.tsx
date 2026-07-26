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

  await act(async () => users?.setStatusFilter('disabled'))
  expect(container.textContent).toBe('1')

  await act(async () => reactRoot?.unmount())
  reactRoot = undefined
  expect(source.listenerCount()).toBe(0)
})

test('Vue adapter translates Scenario snapshots and releases its subscription', async () => {
  const source = createUserStore()
  const Probe = defineComponent({
    setup() {
      const users = useShowcaseUsers(source.store)
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

  vueApp.unmount()
  vueApp = undefined
  expect(source.listenerCount()).toBe(0)
})
