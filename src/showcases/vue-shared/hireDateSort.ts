import type { HireDateSort } from '@/domain/showcaseScenario'

export function toHireDateSort(order: unknown): HireDateSort {
  return order === 'ascend' ? 'asc' : order === 'descend' ? 'desc' : 'none'
}
