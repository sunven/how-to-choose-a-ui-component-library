import { computed, onUnmounted, ref, shallowRef } from 'vue'
import type { User, UserRole, UserStatus } from '@/domain/user'
import { userStore } from '@/domain/userStore'

/** Shared list/filter/pagination state for Vue island Showcases. */
export function useShowcaseUsers() {
  const allUsers = shallowRef(userStore.getSnapshot())
  const unsubscribe = userStore.subscribe(() => {
    allUsers.value = userStore.getSnapshot()
  })
  onUnmounted(unsubscribe)

  const keyword = ref('')
  const roleFilter = ref<UserRole | 'all'>('all')
  const statusFilter = ref<UserStatus | 'all'>('all')
  const hireDateSort = ref<'none' | 'asc' | 'desc'>('none')
  const page = ref(1)
  const pageSize = 10
  const selectedIds = ref<string[]>([])

  const filtered = computed(() => {
    const kw = keyword.value.trim().toLowerCase()
    let list = allUsers.value.filter((u) => {
      if (kw && !u.name.toLowerCase().includes(kw) && !u.email.toLowerCase().includes(kw)) {
        return false
      }
      if (roleFilter.value !== 'all' && u.role !== roleFilter.value) return false
      if (statusFilter.value !== 'all' && u.status !== statusFilter.value) return false
      return true
    })
    if (hireDateSort.value !== 'none') {
      list = [...list].sort((a, b) => {
        const cmp = a.hireDate.localeCompare(b.hireDate)
        return hireDateSort.value === 'asc' ? cmp : -cmp
      })
    }
    return list
  })

  const total = computed(() => filtered.value.length)

  const pageUsers = computed(() => {
    const start = (page.value - 1) * pageSize
    return filtered.value.slice(start, start + pageSize)
  })

  function resetFiltersPage() {
    page.value = 1
  }

  function onSelectionChange(rows: User[]) {
    selectedIds.value = rows.map((r) => r.id)
  }

  function setHireDateSortFromOrder(order: string | boolean | null | undefined) {
    if (order === 'ascend' || order === 'ascending' || order === true || order === 'asc') {
      hireDateSort.value = 'asc'
    } else if (order === 'descend' || order === 'descending' || order === 'desc') {
      hireDateSort.value = 'desc'
    } else {
      hireDateSort.value = 'none'
    }
  }

  return {
    userStore,
    keyword,
    roleFilter,
    statusFilter,
    hireDateSort,
    page,
    pageSize,
    selectedIds,
    filtered,
    total,
    pageUsers,
    resetFiltersPage,
    onSelectionChange,
    setHireDateSortFromOrder,
  }
}
