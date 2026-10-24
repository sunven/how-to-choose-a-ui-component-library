import { computed, onUnmounted, shallowRef } from 'vue'
import {
  createShowcaseScenario,
  type ShowcaseScenarioActions,
  type ShowcaseUserStore,
} from '@/domain/showcaseScenario'
import { userStore } from '@/domain/userStore'

/** Vue adapter for one Showcase Scenario mount. */
export function useShowcaseUsers(store: ShowcaseUserStore = userStore) {
  const scenario = createShowcaseScenario(store)
  const snapshot = shallowRef(scenario.getSnapshot())
  const unsubscribe = scenario.subscribe(() => {
    snapshot.value = scenario.getSnapshot()
  })

  onUnmounted(() => {
    unsubscribe()
    scenario.dispose()
  })

  const keyword = computed({
    get: () => snapshot.value.filters.keyword,
    set: scenario.setKeyword,
  })
  const roleFilter = computed({
    get: () => snapshot.value.filters.role,
    set: scenario.setRoleFilter,
  })
  const statusFilter = computed({
    get: () => snapshot.value.filters.status,
    set: scenario.setStatusFilter,
  })
  const hireDateSort = computed(() => snapshot.value.hireDateSort)
  const page = computed({
    get: () => snapshot.value.page,
    set: scenario.setPage,
  })
  const selectedIds = computed({
    get: () => snapshot.value.selectedIds,
    set: scenario.replacePageSelection,
  })
  const total = computed(() => snapshot.value.total)
  const pageCount = computed(() => snapshot.value.pageCount)
  const users = computed(() => snapshot.value.users)

  const actions: ShowcaseScenarioActions = {
    setKeyword: scenario.setKeyword,
    setRoleFilter: scenario.setRoleFilter,
    setStatusFilter: scenario.setStatusFilter,
    setPage: scenario.setPage,
    setHireDateSort: scenario.setHireDateSort,
    cycleHireDateSort: scenario.cycleHireDateSort,
    replacePageSelection: scenario.replacePageSelection,
    toggleSelect: scenario.toggleSelect,
    toggleSelectAllPage: scenario.toggleSelectAllPage,
    createUser: scenario.createUser,
    updateUser: scenario.updateUser,
    deleteUser: scenario.deleteUser,
  }

  return {
    users,
    keyword,
    roleFilter,
    statusFilter,
    hireDateSort,
    page,
    pageSize: snapshot.value.pageSize,
    pageCount,
    selectedIds,
    total,
    ...actions,
  }
}
