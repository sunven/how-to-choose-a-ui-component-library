<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  SHOWCASE_FILTERS,
  SHOWCASE_FILTER_OPTIONS,
  USER_FIELD_BY_KEY,
  USER_FORM_FIELDS,
  USER_TABLE_COLUMNS,
} from '@/domain/showcaseSpec'
import {
  ROLE_LABELS,
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
  pageCount,
  selectedIds,
  total,
  users,
  setHireDateSort,
  cycleHireDateSort,
  createUser,
  updateUser,
  deleteUser,
} = useShowcaseUsers()

const dialogOpen = ref(false)
const editing = ref<User | null>(null)
const form = reactive<UserInput>(emptyUserInput())
const errors = reactive<UserFormErrors>({})

const roleFilterOptions = SHOWCASE_FILTER_OPTIONS.role.map((option) => ({
  text: option.label,
  value: option.value,
}))
const statusFilterOptions = SHOWCASE_FILTER_OPTIONS.status.map((option) => ({
  text: option.label,
  value: option.value,
}))

const columns = [
  ...USER_TABLE_COLUMNS.map((field) => ({
    key: field.key,
    label: field.label,
    sortable: Boolean(field.sortable),
  })),
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

/** VaDataTable v-model is selected *rows*, not id list */
const selectedRows = computed({
  get: () => users.value.filter((u) => selectedIds.value.includes(u.id)),
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
  setHireDateSort(payload.sortingOrder ?? 'none')
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
          :placeholder="SHOWCASE_FILTERS.keywordPlaceholder"
          style="width: 220px; min-width: 180px"
        />
        <VaSelect
          v-model="roleFilter"
          class="flex-none"
          :options="roleFilterOptions"
          text-by="text"
          value-by="value"
          :label="USER_FIELD_BY_KEY.role.label"
          style="width: 140px; min-width: 120px"
        />
        <VaSelect
          v-model="statusFilter"
          class="flex-none"
          :options="statusFilterOptions"
          text-by="text"
          value-by="value"
          :label="USER_FIELD_BY_KEY.status.label"
          style="width: 140px; min-width: 120px"
        />
        <VaButton preset="secondary" class="flex-none" @click="cycleHireDateSort">
          入职排序：{{ sortLabel }}
        </VaButton>
      </div>
      <VaButton class="shrink-0 flex-none" @click="openCreate">新建用户</VaButton>
    </div>

    <VaDataTable
      v-model="selectedRows"
      :items="users"
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
        :pages="pageCount"
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
        <template v-for="field in USER_FORM_FIELDS" :key="field.key">
          <div v-if="field.key === 'status'" class="space-y-1">
            <div class="flex items-center gap-3">
              <span class="text-sm">
                {{ field.label }}{{ field.rules.required ? ' *' : '' }}
              </span>
              <VaSwitch
                :model-value="form.status === 'active'"
                :label="form.status === 'active' ? STATUS_LABELS.active : STATUS_LABELS.disabled"
                @update:model-value="
                  (value: boolean) =>
                    (form.status = value ? 'active' : 'disabled')
                "
              />
            </div>
            <span v-if="errors.status" class="text-xs text-red-500">
              {{ errors.status }}
            </span>
          </div>
          <VaSelect
            v-else-if="field.control === 'select'"
            v-model="form[field.key]"
            :options="field.options?.map((option) => ({ text: option.label, value: option.value }))"
            text-by="text"
            value-by="value"
            :label="field.label"
            :required="Boolean(field.rules.required)"
            :error="!!errors[field.key]"
            :error-messages="errors[field.key]"
          />
          <VaInput
            v-else-if="field.control === 'date'"
            v-model="form.hireDate"
            type="date"
            :label="field.label"
          />
          <VaTextarea
            v-else-if="field.control === 'textarea'"
            v-model="form.remark"
            :label="field.label"
            :placeholder="field.placeholder"
            :min-rows="3"
          />
          <VaInput
            v-else
            v-model="form[field.key]"
            :label="field.label"
            :placeholder="field.placeholder"
            :required="Boolean(field.rules.required)"
            :error="!!errors[field.key]"
            :error-messages="errors[field.key]"
          />
        </template>
      </div>
    </VaModal>
  </div>
</template>
