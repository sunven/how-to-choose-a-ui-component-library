import {
  validateUserInput,
  type User,
  type UserFormErrors,
  type UserInput,
  type UserRole,
  type UserStatus,
} from './user'

export interface UserFilters {
  readonly keyword: string
  readonly role: UserRole | 'all'
  readonly status: UserStatus | 'all'
}

export type HireDateSort = 'none' | 'asc' | 'desc'

export type UserSaveResult =
  | { ok: true }
  | { ok: false; errors: UserFormErrors }

export interface ShowcaseScenarioSnapshot {
  readonly users: User[]
  readonly allFiltered: User[]
  readonly total: number
  readonly page: number
  readonly pageSize: number
  readonly pageCount: number
  readonly filters: UserFilters
  readonly hireDateSort: HireDateSort
  readonly selectedIds: string[]
}

export interface ShowcaseUserStore {
  subscribe(listener: () => void): () => void
  getSnapshot(): User[]
  create(input: UserInput): User
  update(id: string, input: UserInput): void
  remove(id: string): void
}

export interface ShowcaseScenario {
  subscribe(listener: () => void): () => void
  getSnapshot(): ShowcaseScenarioSnapshot
  setKeyword(keyword: string): void
  setRoleFilter(role: UserFilters['role']): void
  setStatusFilter(status: UserFilters['status']): void
  setPage(page: number): void
  setHireDateSort(order: HireDateSort): void
  cycleHireDateSort(): void
  replacePageSelection(selectedIds: string[]): void
  toggleSelect(id: string, checked: boolean): void
  toggleSelectAllPage(checked: boolean): void
  createUser(input: UserInput): UserSaveResult
  updateUser(id: string, input: UserInput): UserSaveResult
  deleteUser(id: string): void
  dispose(): void
}

const PAGE_SIZE = 10

function hasErrors(errors: UserFormErrors) {
  return Object.keys(errors).length > 0
}

export function createShowcaseScenario(store: ShowcaseUserStore): ShowcaseScenario {
  let sourceUsers = store.getSnapshot()
  let filters: UserFilters = { keyword: '', role: 'all', status: 'all' }
  let hireDateSort: HireDateSort = 'none'
  let page = 1
  let selectedIds: string[] = []
  let unsubscribeStore: (() => void) | undefined
  const listeners = new Set<() => void>()

  function buildSnapshot(): ShowcaseScenarioSnapshot {
    const keyword = filters.keyword.trim().toLowerCase()
    let allFiltered = sourceUsers.filter((user) => {
      if (
        keyword &&
        !user.name.toLowerCase().includes(keyword) &&
        !user.email.toLowerCase().includes(keyword)
      ) {
        return false
      }
      if (filters.role !== 'all' && user.role !== filters.role) return false
      if (filters.status !== 'all' && user.status !== filters.status) return false
      return true
    })

    if (hireDateSort !== 'none') {
      allFiltered = [...allFiltered].sort((left, right) => {
        const comparison = left.hireDate.localeCompare(right.hireDate)
        return hireDateSort === 'asc' ? comparison : -comparison
      })
    }

    const existingIds = new Set(sourceUsers.map((user) => user.id))
    selectedIds = selectedIds.filter((id) => existingIds.has(id))

    const total = allFiltered.length
    const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
    page = Math.min(Math.max(1, page), pageCount)
    const start = (page - 1) * PAGE_SIZE

    return {
      users: allFiltered.slice(start, start + PAGE_SIZE),
      allFiltered,
      total,
      page,
      pageSize: PAGE_SIZE,
      pageCount,
      filters,
      hireDateSort,
      selectedIds,
    }
  }

  let snapshot = buildSnapshot()

  function publish() {
    snapshot = buildSnapshot()
    for (const listener of listeners) listener()
  }

  function syncFromStore() {
    const nextUsers = store.getSnapshot()
    if (nextUsers === sourceUsers) return
    sourceUsers = nextUsers
    publish()
  }

  function stopStoreSubscriptionIfIdle() {
    if (listeners.size > 0 || !unsubscribeStore) return
    unsubscribeStore()
    unsubscribeStore = undefined
  }

  function subscribe(listener: () => void) {
    listeners.add(listener)
    syncFromStore()
    unsubscribeStore ??= store.subscribe(syncFromStore)

    return () => {
      listeners.delete(listener)
      stopStoreSubscriptionIfIdle()
    }
  }

  function setKeyword(keyword: string) {
    if (keyword === filters.keyword) return
    filters = { ...filters, keyword }
    page = 1
    publish()
  }

  function setRoleFilter(role: UserFilters['role']) {
    if (role === filters.role) return
    filters = { ...filters, role }
    page = 1
    publish()
  }

  function setStatusFilter(status: UserFilters['status']) {
    if (status === filters.status) return
    filters = { ...filters, status }
    page = 1
    publish()
  }

  function setPage(nextPage: number) {
    const normalizedPage = Number.isFinite(nextPage) ? Math.trunc(nextPage) : 1
    const clampedPage = Math.min(Math.max(1, normalizedPage), snapshot.pageCount)
    if (clampedPage === page) return
    page = clampedPage
    publish()
  }

  function setHireDateSort(order: HireDateSort) {
    if (order === hireDateSort) return
    hireDateSort = order
    publish()
  }

  function cycleHireDateSort() {
    setHireDateSort(
      hireDateSort === 'none' ? 'asc' : hireDateSort === 'asc' ? 'desc' : 'none',
    )
  }

  function replacePageSelection(nextSelectedIds: string[]) {
    const pageIds = new Set(snapshot.users.map((user) => user.id))
    const selectedOnPage = new Set(nextSelectedIds.filter((id) => pageIds.has(id)))
    selectedIds = [
      ...selectedIds.filter((id) => !pageIds.has(id)),
      ...snapshot.users.filter((user) => selectedOnPage.has(user.id)).map((user) => user.id),
    ]
    publish()
  }

  function toggleSelect(id: string, checked: boolean) {
    if (checked) {
      if (selectedIds.includes(id) || !sourceUsers.some((user) => user.id === id)) return
      selectedIds = [...selectedIds, id]
    } else {
      if (!selectedIds.includes(id)) return
      selectedIds = selectedIds.filter((selectedId) => selectedId !== id)
    }
    publish()
  }

  function toggleSelectAllPage(checked: boolean) {
    replacePageSelection(checked ? snapshot.users.map((user) => user.id) : [])
  }

  function createUser(input: UserInput): UserSaveResult {
    const errors = validateUserInput(input)
    if (hasErrors(errors)) return { ok: false, errors }

    page = 1
    store.create(input)
    syncFromStore()
    return { ok: true }
  }

  function updateUser(id: string, input: UserInput): UserSaveResult {
    const errors = validateUserInput(input)
    if (hasErrors(errors)) return { ok: false, errors }

    store.update(id, input)
    syncFromStore()
    return { ok: true }
  }

  function deleteUser(id: string) {
    selectedIds = selectedIds.filter((selectedId) => selectedId !== id)
    store.remove(id)
    syncFromStore()
  }

  function dispose() {
    unsubscribeStore?.()
    unsubscribeStore = undefined
    listeners.clear()
  }

  return {
    subscribe,
    getSnapshot: () => snapshot,
    setKeyword,
    setRoleFilter,
    setStatusFilter,
    setPage,
    setHireDateSort,
    cycleHireDateSort,
    replacePageSelection,
    toggleSelect,
    toggleSelectAllPage,
    createUser,
    updateUser,
    deleteUser,
    dispose,
  }
}
