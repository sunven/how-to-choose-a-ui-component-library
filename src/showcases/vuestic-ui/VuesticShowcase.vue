<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  ROLE_LABELS,
  ROLE_OPTIONS,
  STATUS_LABELS,
  emptyUserInput,
  type User,
  type UserFormErrors,
  type UserInput,
  type UserRole,
  type UserStatus,
} from '@/domain/user'
import { useShowcaseUsers } from '../vue-shared/useShowcaseUsers'

const {
  keyword,
  roleFilter,
  statusFilter,
  hireDateSort,
  page,
  pageSize,
  selectedIds,
  total,
  pageUsers,
  resetFiltersPage,
  setHireDateSortFromOrder,
  createUser,
  updateUser,
  deleteUser,
} = useShowcaseUsers()

const dialogOpen = ref(false)
const editing = ref<User | null>(null)
const form = reactive<UserInput>(emptyUserInput())
const errors = reactive<UserFormErrors>({})

const roleFilterOptions = [
  { text: '全部角色', value: 'all' },
  ...ROLE_OPTIONS.map((o) => ({ text: o.label, value: o.value })),
]
const statusFilterOptions = [
  { text: '全部状态', value: 'all' },
  { text: STATUS_LABELS.active, value: 'active' },
  { text: STATUS_LABELS.disabled, value: 'disabled' },
]
const roleFormOptions = ROLE_OPTIONS.map((o) => ({ text: o.label, value: o.value }))

const columns = [
  { key: 'name', label: '姓名' },
  { key: 'email', label: '邮箱' },
  { key: 'role', label: '角色' },
  { key: 'status', label: '状态' },
  { key: 'hireDate', label: '入职日期', sortable: true },
  { key: 'actions', label: '操作', width: 140, tdAlign: 'right' as const },
]

const sortBy = computed(() => (hireDateSort.value === 'none' ? undefined : 'hireDate'))
const sortingOrder = computed(() => {
  if (hireDateSort.value === 'asc') return 'asc' as const
  if (hireDateSort.value === 'desc') return 'desc' as const
  return null
})
const sortLabel = computed(() => {
  if (hireDateSort.value === 'asc') return '升序'
  if (hireDateSort.value === 'desc') return '降序'
  return '默认'
})

const pages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

/** VaDataTable v-model is selected *rows*, not id list */
const selectedRows = computed({
  get: () => pageUsers.value.filter((u) => selectedIds.value.includes(u.id)),
  set: (rows: User[]) => {
    selectedIds.value = rows.map((r) => r.id)
  },
})

function openCreate() {
  editing.value = null
  Object.assign(form, emptyUserInput())
  Object.keys(errors).forEach((k) => delete errors[k as keyof UserFormErrors])
  dialogOpen.value = true
}

function openEdit(user: User) {
  editing.value = user
  Object.assign(form, {
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    hireDate: user.hireDate,
    remark: user.remark,
  })
  Object.keys(errors).forEach((k) => delete errors[k as keyof UserFormErrors])
  dialogOpen.value = true
}

function submit() {
  const input: UserInput = {
    name: form.name.trim(),
    email: form.email.trim(),
    role: form.role,
    status: form.status,
    hireDate: form.hireDate ? String(form.hireDate).slice(0, 10) : '',
    remark: (form.remark ?? '').trim(),
  }
  const result = editing.value
    ? updateUser(editing.value.id, input)
    : createUser(input)
  Object.keys(errors).forEach((k) => delete errors[k as keyof UserFormErrors])
  if (!result.ok) {
    Object.assign(errors, result.errors)
    return
  }
  dialogOpen.value = false
}

function confirmDelete(user: User) {
  if (!window.confirm('确认删除该用户？')) return
  deleteUser(user.id)
}

function onSorted(payload: { sortBy?: string; sortingOrder?: 'asc' | 'desc' | null }) {
  if (payload.sortBy && payload.sortBy !== 'hireDate') return
  setHireDateSortFromOrder(payload.sortingOrder ?? null)
}

function cycleHireDateSort() {
  if (hireDateSort.value === 'none') setHireDateSortFromOrder('asc')
  else if (hireDateSort.value === 'asc') setHireDateSortFromOrder('desc')
  else setHireDateSortFromOrder(null)
}

function onOk(hide: () => void) {
  submit()
  if (!Object.keys(errors).length) hide()
}
</script>

<template>
  <div class="vuestic-showcase va-typography-block space-y-4">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div class="flex min-w-0 flex-1 flex-wrap items-end gap-3">
        <VaInput
          v-model="keyword"
          class="flex-none"
          label="搜索"
          placeholder="搜索姓名 / 邮箱"
          style="width: 220px; min-width: 180px"
          @update:model-value="resetFiltersPage"
        />
        <VaSelect
          v-model="roleFilter"
          class="flex-none"
          :options="roleFilterOptions"
          text-by="text"
          value-by="value"
          label="角色"
          style="width: 140px; min-width: 120px"
          @update:model-value="resetFiltersPage"
        />
        <VaSelect
          v-model="statusFilter"
          class="flex-none"
          :options="statusFilterOptions"
          text-by="text"
          value-by="value"
          label="状态"
          style="width: 140px; min-width: 120px"
          @update:model-value="resetFiltersPage"
        />
        <VaButton preset="secondary" class="flex-none" @click="cycleHireDateSort">
          入职排序：{{ sortLabel }}
        </VaButton>
      </div>
      <VaButton class="shrink-0 flex-none" @click="openCreate">新建用户</VaButton>
    </div>

    <VaDataTable
      v-model="selectedRows"
      :items="pageUsers"
      :columns="columns"
      :sort-by="sortBy"
      :sorting-order="sortingOrder"
      selectable
      select-mode="multiple"
      items-track-by="id"
      hoverable
      striped
      no-data-html="暂无数据"
      @sorted="onSorted"
    >
      <template #cell(role)="{ rowData }">
        {{ ROLE_LABELS[(rowData as User).role as UserRole] }}
      </template>
      <template #cell(status)="{ rowData }">
        <VaChip
          size="small"
          :color="(rowData as User).status === 'active' ? 'success' : 'secondary'"
        >
          {{ STATUS_LABELS[(rowData as User).status as UserStatus] }}
        </VaChip>
      </template>
      <template #cell(actions)="{ rowData }">
        <div class="flex justify-end gap-1">
          <VaButton preset="plain" size="small" @click="openEdit(rowData as User)">编辑</VaButton>
          <VaButton
            preset="plain"
            size="small"
            color="danger"
            @click="confirmDelete(rowData as User)"
          >
            删除
          </VaButton>
        </div>
      </template>
    </VaDataTable>

    <div class="flex flex-wrap items-center justify-end gap-3">
      <span class="text-sm" style="color: var(--va-secondary)">共 {{ total }} 条</span>
      <VaPagination
        v-model="page"
        :pages="pages"
        :visible-pages="7"
        buttons-preset="secondary"
        gapped
        boundary-links
        direction-links
      />
    </div>

    <VaModal
      v-model="dialogOpen"
      :title="editing ? '编辑用户' : '新建用户'"
      size="small"
      close-button
      ok-text="提交"
      cancel-text="取消"
      @ok="onOk"
    >
      <div class="flex flex-col gap-3 py-1">
        <VaInput
          v-model="form.name"
          label="姓名"
          :error="!!errors.name"
          :error-messages="errors.name"
        />
        <VaInput
          v-model="form.email"
          label="邮箱"
          :error="!!errors.email"
          :error-messages="errors.email"
        />
        <VaSelect
          v-model="form.role"
          :options="roleFormOptions"
          text-by="text"
          value-by="value"
          label="角色"
        />
        <div class="flex items-center gap-3">
          <span class="text-sm">状态</span>
          <VaSwitch
            :model-value="form.status === 'active'"
            label="启用"
            @update:model-value="(v: boolean) => (form.status = v ? 'active' : 'disabled')"
          />
        </div>
        <VaInput v-model="form.hireDate" type="date" label="入职日期" />
        <VaTextarea v-model="form.remark" label="备注" :min-rows="3" />
      </div>
    </VaModal>
  </div>
</template>
