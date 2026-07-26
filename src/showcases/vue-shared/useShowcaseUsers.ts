import { computed, onUnmounted, shallowRef } from 'vue'
import type { User } from '@/domain/user'
import {
  createShowcaseScenario,
  type HireDateSort,
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
  const filtered = computed(() => snapshot.value.allFiltered)
  const total = computed(() => snapshot.value.total)
  const pageCount = computed(() => snapshot.value.pageCount)
  const pageUsers = computed(() => snapshot.value.users)

  function setHireDateSortFromOrder(order: string | boolean | null | undefined) {
    let normalized: HireDateSort = 'none'
    if (order === 'ascend' || order === 'ascending' || order === true || order === 'asc') {
      normalized = 'asc'
    } else if (order === 'descend' || order === 'descending' || order === 'desc') {
      normalized = 'desc'
    }
    scenario.setHireDateSort(normalized)
  }

  return {
    keyword,
    roleFilter,
    statusFilter,
    hireDateSort,
    page,
    pageSize: snapshot.value.pageSize,
    pageCount,
    selectedIds,
    filtered,
    total,
    pageUsers,
    resetFiltersPage: () => scenario.setPage(1),
    onSelectionChange: (rows: User[]) =>
      scenario.replacePageSelection(rows.map((row) => row.id)),
    setHireDateSortFromOrder,
    setHireDateSort: scenario.setHireDateSort,
    cycleHireDateSort: scenario.cycleHireDateSort,
    toggleSelect: scenario.toggleSelect,
    toggleSelectAllPage: scenario.toggleSelectAllPage,
    createUser: scenario.createUser,
    updateUser: scenario.updateUser,
    deleteUser: scenario.deleteUser,
  }
}
