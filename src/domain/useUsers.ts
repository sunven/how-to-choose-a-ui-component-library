import { useCallback, useMemo, useState } from 'react'
import {
  SEED_USERS,
  type User,
  type UserInput,
  type UserRole,
  type UserStatus,
} from './user'

export interface UserFilters {
  keyword: string
  role: UserRole | 'all'
  status: UserStatus | 'all'
}

export type HireDateSort = 'none' | 'asc' | 'desc'

function createId() {
  return `u_${Math.random().toString(36).slice(2, 10)}`
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>(() => [...SEED_USERS])
  const [filters, setFilters] = useState<UserFilters>({
    keyword: '',
    role: 'all',
    status: 'all',
  })
  const [hireDateSort, setHireDateSort] = useState<HireDateSort>('none')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const filtered = useMemo(() => {
    const kw = filters.keyword.trim().toLowerCase()
    let list = users.filter((u) => {
      if (kw && !u.name.toLowerCase().includes(kw) && !u.email.toLowerCase().includes(kw)) {
        return false
      }
      if (filters.role !== 'all' && u.role !== filters.role) return false
      if (filters.status !== 'all' && u.status !== filters.status) return false
      return true
    })
    if (hireDateSort !== 'none') {
      list = [...list].sort((a, b) => {
        const cmp = a.hireDate.localeCompare(b.hireDate)
        return hireDateSort === 'asc' ? cmp : -cmp
      })
    }
    return list
  }, [users, filters, hireDateSort])

  const total = filtered.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, pageCount)

  const pageUsers = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, safePage, pageSize])

  const createUser = useCallback((input: UserInput) => {
    const user: User = { ...input, id: createId() }
    setUsers((prev) => [user, ...prev])
    setPage(1)
    return user
  }, [])

  const updateUser = useCallback((id: string, input: UserInput) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...input, id } : u)))
  }, [])

  const deleteUser = useCallback((id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
    setSelectedIds((prev) => prev.filter((x) => x !== id))
  }, [])

  const toggleSelect = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) return prev.includes(id) ? prev : [...prev, id]
      return prev.filter((x) => x !== id)
    })
  }, [])

  const toggleSelectAllPage = useCallback(
    (checked: boolean) => {
      const ids = pageUsers.map((u) => u.id)
      setSelectedIds((prev) => {
        if (checked) {
          const set = new Set([...prev, ...ids])
          return [...set]
        }
        return prev.filter((id) => !ids.includes(id))
      })
    },
    [pageUsers],
  )

  const setKeyword = useCallback((keyword: string) => {
    setFilters((f) => ({ ...f, keyword }))
    setPage(1)
  }, [])

  const setRoleFilter = useCallback((role: UserFilters['role']) => {
    setFilters((f) => ({ ...f, role }))
    setPage(1)
  }, [])

  const setStatusFilter = useCallback((status: UserFilters['status']) => {
    setFilters((f) => ({ ...f, status }))
    setPage(1)
  }, [])

  const cycleHireDateSort = useCallback(() => {
    setHireDateSort((s) => (s === 'none' ? 'asc' : s === 'asc' ? 'desc' : 'none'))
  }, [])

  const setHireDateSortOrder = useCallback((order: HireDateSort) => {
    setHireDateSort(order)
  }, [])

  return {
    users: pageUsers,
    allFiltered: filtered,
    total,
    page: safePage,
    pageSize,
    pageCount,
    setPage,
    filters,
    setKeyword,
    setRoleFilter,
    setStatusFilter,
    hireDateSort,
    cycleHireDateSort,
    setHireDateSortOrder,
    selectedIds,
    setSelectedIds,
    toggleSelect,
    toggleSelectAllPage,
    createUser,
    updateUser,
    deleteUser,
  }
}

export type UsersController = ReturnType<typeof useUsers>
