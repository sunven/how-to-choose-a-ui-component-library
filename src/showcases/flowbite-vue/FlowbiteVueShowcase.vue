<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  FwbButton,
  FwbCheckbox,
  FwbInput,
  FwbModal,
  FwbPagination,
  FwbSelect,
  FwbTable,
  FwbTableBody,
  FwbTableCell,
  FwbTableHead,
  FwbTableHeadCell,
  FwbTableRow,
  FwbTextarea,
  FwbToggle,
} from 'flowbite-vue'
import {
  ROLE_LABELS,
  ROLE_OPTIONS,
  STATUS_LABELS,
  emptyUserInput,
  validateUserInput,
  type User,
  type UserFormErrors,
  type UserInput,
  type UserRole,
  type UserStatus,
} from '@/domain/user'
import { useShowcaseUsers } from '../vue-shared/useShowcaseUsers'

const {
  userStore,
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
} = useShowcaseUsers()

const dialogOpen = ref(false)
const editing = ref<User | null>(null)
const form = reactive<UserInput>(emptyUserInput())
const errors = reactive<UserFormErrors>({})

const roleFilterOptions = [
  { name: '全部角色', value: 'all' },
  ...ROLE_OPTIONS.map((o) => ({ name: o.label, value: o.value })),
]
const statusFilterOptions = [
  { name: '全部状态', value: 'all' },
  { name: STATUS_LABELS.active, value: 'active' },
  { name: STATUS_LABELS.disabled, value: 'disabled' },
]
const roleFormOptions = ROLE_OPTIONS.map((o) => ({ name: o.label, value: o.value }))

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
const allPageSelected = computed(
  () => pageUsers.value.length > 0 && pageUsers.value.every((u) => selectedIds.value.includes(u.id)),
)

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
  const next = validateUserInput(form)
  Object.keys(errors).forEach((k) => delete errors[k as keyof UserFormErrors])
  Object.assign(errors, next)
  if (Object.keys(next).length) return

  const input: UserInput = {
    name: form.name.trim(),
    email: form.email.trim(),
    role: form.role,
    status: form.status,
    hireDate: form.hireDate ? String(form.hireDate).slice(0, 10) : '',
    remark: (form.remark ?? '').trim(),
  }
  if (editing.value) userStore.update(editing.value.id, input)
  else {
    userStore.create(input)
    page.value = 1
  }
  dialogOpen.value = false
}

function confirmDelete(user: User) {
  if (!window.confirm('确认删除该用户？')) return
  userStore.remove(user.id)
  selectedIds.value = selectedIds.value.filter((id) => id !== user.id)
}

function toggleSelect(id: string, checked: boolean) {
  if (checked) {
    if (!selectedIds.value.includes(id)) selectedIds.value = [...selectedIds.value, id]
  } else {
    selectedIds.value = selectedIds.value.filter((x) => x !== id)
  }
}

function toggleSelectAllPage(checked: boolean) {
  const ids = pageUsers.value.map((u) => u.id)
  if (checked) {
    selectedIds.value = Array.from(new Set([...selectedIds.value, ...ids]))
  } else {
    selectedIds.value = selectedIds.value.filter((id) => !ids.includes(id))
  }
}

function cycleHireDateSort() {
  if (hireDateSort.value === 'none') setHireDateSortFromOrder('asc')
  else if (hireDateSort.value === 'asc') setHireDateSortFromOrder('desc')
  else setHireDateSortFromOrder(null)
}

function onRoleFilter(v: string) {
  roleFilter.value = v as typeof roleFilter.value
  resetFiltersPage()
}

function onStatusFilter(v: string) {
  statusFilter.value = v as typeof statusFilter.value
  resetFiltersPage()
}
</script>

<template>
  <div class="flowbite-vue-showcase space-y-4">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div class="flex min-w-0 flex-1 flex-wrap items-end gap-2">
        <FwbInput
          v-model="keyword"
          placeholder="搜索姓名 / 邮箱"
          class="w-[220px]"
          @update:model-value="resetFiltersPage"
        />
        <FwbSelect
          :model-value="roleFilter"
          :options="roleFilterOptions"
          class="w-[140px]"
          @update:model-value="onRoleFilter"
        />
        <FwbSelect
          :model-value="statusFilter"
          :options="statusFilterOptions"
          class="w-[140px]"
          @update:model-value="onStatusFilter"
        />
        <FwbButton color="alternative" @click="cycleHireDateSort">
          入职排序：
          {{ hireDateSort === 'none' ? '默认' : hireDateSort === 'asc' ? '升序' : '降序' }}
        </FwbButton>
      </div>
      <!-- color=default → text-white bg-blue-700（依赖 tailwind 扫描 flowbite-vue） -->
      <FwbButton color="default" class="shrink-0" @click="openCreate">新建用户</FwbButton>
    </div>

    <FwbTable>
      <FwbTableHead>
        <FwbTableHeadCell class="w-10">
          <FwbCheckbox
            :model-value="allPageSelected"
            @update:model-value="(v: boolean) => toggleSelectAllPage(v)"
          />
        </FwbTableHeadCell>
        <FwbTableHeadCell>姓名</FwbTableHeadCell>
        <FwbTableHeadCell>邮箱</FwbTableHeadCell>
        <FwbTableHeadCell>角色</FwbTableHeadCell>
        <FwbTableHeadCell>状态</FwbTableHeadCell>
        <FwbTableHeadCell>入职日期</FwbTableHeadCell>
        <FwbTableHeadCell>操作</FwbTableHeadCell>
      </FwbTableHead>
      <FwbTableBody>
        <FwbTableRow v-for="row in pageUsers" :key="row.id">
          <FwbTableCell>
            <FwbCheckbox
              :model-value="selectedIds.includes(row.id)"
              @update:model-value="(v: boolean) => toggleSelect(row.id, v)"
            />
          </FwbTableCell>
          <FwbTableCell>{{ row.name }}</FwbTableCell>
          <FwbTableCell>{{ row.email }}</FwbTableCell>
          <FwbTableCell>{{ ROLE_LABELS[row.role as UserRole] }}</FwbTableCell>
          <FwbTableCell>{{ STATUS_LABELS[row.status as UserStatus] }}</FwbTableCell>
          <FwbTableCell>{{ row.hireDate }}</FwbTableCell>
          <FwbTableCell>
            <div class="flex flex-wrap items-center gap-2">
              <FwbButton size="xs" color="alternative" @click="openEdit(row)">编辑</FwbButton>
              <FwbButton size="xs" color="red" class="shrink-0" @click="confirmDelete(row)">
                删除
              </FwbButton>
            </div>
          </FwbTableCell>
        </FwbTableRow>
        <FwbTableRow v-if="pageUsers.length === 0">
          <FwbTableCell colspan="7" class="text-center text-gray-500">暂无数据</FwbTableCell>
        </FwbTableRow>
      </FwbTableBody>
    </FwbTable>

    <div class="flex items-center justify-end gap-3">
      <span class="text-sm text-gray-500">共 {{ total }} 条</span>
      <FwbPagination
        v-model="page"
        :total-pages="totalPages"
        :per-page="pageSize"
        :total-items="total"
        show-icons
        previous-label="上一页"
        next-label="下一页"
      />
    </div>

    <FwbModal v-if="dialogOpen" size="md" @close="dialogOpen = false">
      <template #header>
        <div class="text-lg font-semibold">{{ editing ? '编辑用户' : '新建用户' }}</div>
      </template>
      <template #body>
        <div class="flex flex-col gap-3">
          <FwbInput
            v-model="form.name"
            label="姓名"
            :validation-status="errors.name ? 'error' : undefined"
            :validation-message="errors.name"
          />
          <FwbInput
            v-model="form.email"
            label="邮箱"
            :validation-status="errors.email ? 'error' : undefined"
            :validation-message="errors.email"
          />
          <FwbSelect v-model="form.role" label="角色" :options="roleFormOptions" />
          <div class="flex items-center gap-3">
            <span class="text-sm font-medium">状态</span>
            <FwbToggle
              :model-value="form.status === 'active'"
              label="启用"
              @update:model-value="(v: boolean) => (form.status = v ? 'active' : 'disabled')"
            />
          </div>
          <FwbInput v-model="form.hireDate" type="date" label="入职日期" />
          <FwbTextarea v-model="form.remark" label="备注" :rows="3" placeholder="可选" />
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <FwbButton color="alternative" @click="dialogOpen = false">取消</FwbButton>
          <FwbButton @click="submit">提交</FwbButton>
        </div>
      </template>
    </FwbModal>
  </div>
</template>
