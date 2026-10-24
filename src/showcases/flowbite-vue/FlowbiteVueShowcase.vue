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
  SHOWCASE_FILTERS,
  SHOWCASE_FILTER_OPTIONS,
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
} from '@/domain/user'
import { useShowcaseUsers } from '../vue-shared/useShowcaseUsers'

const {
  keyword,
  roleFilter,
  statusFilter,
  hireDateSort,
  page,
  pageSize,
  pageCount,
  selectedIds,
  total,
  users,
  cycleHireDateSort,
  toggleSelect,
  toggleSelectAllPage,
  createUser,
  updateUser,
  deleteUser,
} = useShowcaseUsers()

const dialogOpen = ref(false)
const editing = ref<User | null>(null)
const form = reactive<UserInput>(emptyUserInput())
const errors = reactive<UserFormErrors>({})

const roleFilterOptions = SHOWCASE_FILTER_OPTIONS.role.map((option) => ({
  name: option.label,
  value: option.value,
}))
const statusFilterOptions = SHOWCASE_FILTER_OPTIONS.status.map((option) => ({
  name: option.label,
  value: option.value,
}))

const allPageSelected = computed(
  () => users.value.length > 0 && users.value.every((u) => selectedIds.value.includes(u.id)),
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

</script>

<template>
  <div class="flowbite-vue-showcase space-y-4">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div class="flex min-w-0 flex-1 flex-wrap items-end gap-2">
        <FwbInput
          v-model="keyword"
          :placeholder="SHOWCASE_FILTERS.keywordPlaceholder"
          class="w-[220px]"
        />
        <FwbSelect
          v-model="roleFilter"
          :options="roleFilterOptions"
          class="w-[140px]"
        />
        <FwbSelect
          v-model="statusFilter"
          :options="statusFilterOptions"
          class="w-[140px]"
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
        <FwbTableHeadCell
          v-for="field in USER_TABLE_COLUMNS"
          :key="field.key"
        >
          {{ field.label }}
        </FwbTableHeadCell>
        <FwbTableHeadCell>操作</FwbTableHeadCell>
      </FwbTableHead>
      <FwbTableBody>
        <FwbTableRow v-for="row in users" :key="row.id">
          <FwbTableCell>
            <FwbCheckbox
              :model-value="selectedIds.includes(row.id)"
              @update:model-value="(v: boolean) => toggleSelect(row.id, v)"
            />
          </FwbTableCell>
          <FwbTableCell
            v-for="field in USER_TABLE_COLUMNS"
            :key="field.key"
          >
            <template v-if="field.key === 'role'">
              {{ ROLE_LABELS[row.role] }}
            </template>
            <template v-else-if="field.key === 'status'">
              {{ STATUS_LABELS[row.status] }}
            </template>
            <template v-else>{{ row[field.key] }}</template>
          </FwbTableCell>
          <FwbTableCell>
            <div class="flex flex-wrap items-center gap-2">
              <FwbButton size="xs" color="alternative" @click="openEdit(row)">编辑</FwbButton>
              <FwbButton size="xs" color="red" class="shrink-0" @click="confirmDelete(row)">
                删除
              </FwbButton>
            </div>
          </FwbTableCell>
        </FwbTableRow>
        <FwbTableRow v-if="users.length === 0">
          <FwbTableCell
            :colspan="USER_TABLE_COLUMNS.length + 2"
            class="text-center text-gray-500"
          >
            暂无数据
          </FwbTableCell>
        </FwbTableRow>
      </FwbTableBody>
    </FwbTable>

    <div class="flex items-center justify-end gap-3">
      <span class="text-sm text-gray-500">共 {{ total }} 条</span>
      <FwbPagination
        v-model="page"
        :total-pages="pageCount"
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
          <template v-for="field in USER_FORM_FIELDS" :key="field.key">
            <div v-if="field.key === 'status'" class="space-y-1">
              <div class="flex items-center gap-3">
                <span class="text-sm font-medium">
                  {{ field.label }}{{ field.rules.required ? ' *' : '' }}
                </span>
                <FwbToggle
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
            <FwbSelect
              v-else-if="field.control === 'select'"
              v-model="form[field.key]"
              :label="field.label + (field.rules.required ? ' *' : '')"
              :options="field.options?.map((option) => ({ name: option.label, value: option.value }))"
              :validation-status="errors[field.key] ? 'error' : undefined"
              :validation-message="errors[field.key]"
            />
            <FwbInput
              v-else-if="field.control === 'date'"
              v-model="form.hireDate"
              type="date"
              :label="field.label"
              :placeholder="field.placeholder"
            />
            <FwbTextarea
              v-else-if="field.control === 'textarea'"
              v-model="form.remark"
              :label="field.label"
              :rows="3"
              :placeholder="field.placeholder"
            />
            <FwbInput
              v-else
              v-model="form[field.key]"
              :label="field.label + (field.rules.required ? ' *' : '')"
              :type="field.control === 'email' ? 'email' : 'text'"
              :placeholder="field.placeholder"
              :validation-status="errors[field.key] ? 'error' : undefined"
              :validation-message="errors[field.key]"
            />
          </template>
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
