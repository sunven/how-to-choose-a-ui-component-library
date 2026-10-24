import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import {
  createShowcaseScenario,
  pickScenarioActions,
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

  const actions = useMemo(() => pickScenarioActions(scenario), [scenario])

  return useMemo(() => ({ ...snapshot, ...actions }), [snapshot, actions])
}
