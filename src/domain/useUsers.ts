import { useEffect, useState, useSyncExternalStore } from 'react'
import {
  createShowcaseScenario,
  type HireDateSort,
  type ShowcaseUserStore,
} from './showcaseScenario'
import { userStore } from './userStore'

export type { HireDateSort, UserFilters } from './showcaseScenario'

/** React adapter for one Showcase Scenario mount. */
export function useUsers(store: ShowcaseUserStore = userStore) {
  const [scenario] = useState(() => createShowcaseScenario(store))
  const snapshot = useSyncExternalStore(
    scenario.subscribe,
    scenario.getSnapshot,
    scenario.getSnapshot,
  )

  useEffect(() => () => scenario.dispose(), [scenario])

  return {
    ...snapshot,
    setKeyword: scenario.setKeyword,
    setRoleFilter: scenario.setRoleFilter,
    setStatusFilter: scenario.setStatusFilter,
    setPage: scenario.setPage,
    cycleHireDateSort: scenario.cycleHireDateSort,
    setHireDateSortOrder: (order: HireDateSort) => scenario.setHireDateSort(order),
    setSelectedIds: scenario.replacePageSelection,
    toggleSelect: scenario.toggleSelect,
    toggleSelectAllPage: scenario.toggleSelectAllPage,
    createUser: scenario.createUser,
    updateUser: scenario.updateUser,
    deleteUser: scenario.deleteUser,
  }
}

export type UsersController = ReturnType<typeof useUsers>
