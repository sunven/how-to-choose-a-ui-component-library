import { useEffect, useState, useSyncExternalStore } from 'react'
import {
  createShowcaseScenario,
  type ShowcaseScenarioActions,
  type ShowcaseScenarioSnapshot,
  type ShowcaseUserStore,
} from './showcaseScenario'
import { userStore } from './userStore'

export type { HireDateSort, UserFilters } from './showcaseScenario'

export type UsersController = ShowcaseScenarioSnapshot & ShowcaseScenarioActions

/** React adapter for one Showcase Scenario mount. */
export function useUsers(store: ShowcaseUserStore = userStore): UsersController {
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
    setHireDateSort: scenario.setHireDateSort,
    replacePageSelection: scenario.replacePageSelection,
    toggleSelect: scenario.toggleSelect,
    toggleSelectAllPage: scenario.toggleSelectAllPage,
    createUser: scenario.createUser,
    updateUser: scenario.updateUser,
    deleteUser: scenario.deleteUser,
  }
}
