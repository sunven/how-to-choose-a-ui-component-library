<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  SHOWCASE_FILTERS,
  SHOWCASE_FILTER_OPTIONS,
  USER_FORM_FIELDS,
  USER_TABLE_COLUMNS,
  type UserFieldSpec,
} from '@/domain/showcaseSpec'
import {
  EMAIL_RE,
  ROLE_LABELS,
  STATUS_LABELS,
  emptyUserInput,
  type User,
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
  pageUsers,
  resetFiltersPage,
  setHireDateSortFromOrder,
  createUser,
  updateUser,
  deleteUser,
} = useShowcaseUsers()

const dialogOpen = ref(false)
const deleteTarget = ref<User | null>(null)
const editing = ref<User | null>(null)
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)
const form = reactive<UserInput>(emptyUserInput())
const snackbar = ref(false)
const snackbarText = ref('')

const roleFilterItems = SHOWCASE_FILTER_OPTIONS.role.map((option) => ({
  title: option.label,
  value: option.value,
}))
const statusFilterItems = SHOWCASE_FILTER_OPTIONS.status.map((option) => ({
  title: option.label,
  value: option.value,
}))

const headers = [
  ...USER_TABLE_COLUMNS.map((field) => ({
    title: field.label,
    key: field.key,
    sortable: Boolean(field.sortable),
  })),
  { title: '操作', key: 'actions', sortable: false, align: 'end' as const },
]

function fieldRules(field: UserFieldSpec) {
  const rules: ((value: unknown) => true | string)[] = []
  if (field.rules.required) {
    rules.push(
      (value) =>
        (typeof value === 'string' ? value.trim() : value) ||
        field.rules.required ||
        true,
    )
  }
  if (field.rules.email) {
    rules.push(
      (value) =>
        EMAIL_RE.test(String(value ?? '').trim()) ||
        field.rules.email ||
        true,
    )
  }
  return rules
}

const sortBy = computed(() => {
  if (hireDateSort.value === 'asc') return [{ key: 'hireDate', order: 'asc' as const }]
  if (hireDateSort.value === 'desc') return [{ key: 'hireDate', order: 'desc' as const }]
  return []
})


function showMessage(text: string) {
  snackbarText.value = text
  snackbar.value = true
}

function openCreate() {
  editing.value = null
  Object.assign(form, emptyUserInput())
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
  dialogOpen.value = true
}

async function submit() {
  const formResult = await formRef.value?.validate()
  if (!formResult?.valid) return
  const input: UserInput = {
    name: form.name.trim(),
    email: form.email.trim(),
    role: form.role,
    status: form.status,
    hireDate: form.hireDate ? String(form.hireDate).slice(0, 10) : '',
    remark: (form.remark ?? '').trim(),
  }
  const saveResult = editing.value
    ? updateUser(editing.value.id, input)
    : createUser(input)
  if (!saveResult.ok) {
    showMessage(Object.values(saveResult.errors).find(Boolean) ?? '请检查表单')
    return
  }

  if (editing.value) {
    showMessage('已更新用户')
  } else {
    showMessage('已创建用户')
  }
  dialogOpen.value = false
}

function askDelete(user: User) {
  deleteTarget.value = user
}

function confirmDelete() {
  const user = deleteTarget.value
  if (!user) return
  deleteUser(user.id)
  deleteTarget.value = null
  showMessage('已删除')
}

function onSortByUpdate(value: { key: string; order?: 'asc' | 'desc' }[]) {
  const hire = value.find((s) => s.key === 'hireDate')
  if (!hire?.order) {
    setHireDateSortFromOrder(null)
    return
  }
  setHireDateSortFromOrder(hire.order === 'asc' ? 'asc' : 'desc')
}

function roleLabel(role: UserRole) {
  return ROLE_LABELS[role]
}

function statusLabel(status: UserStatus) {
  return STATUS_LABELS[status]
}
</script>

<template>
  <div class="vuetify-showcase space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-2">
        <v-text-field
          v-model="keyword"
          density="compact"
          hide-details
          clearable
          :label="SHOWCASE_FILTERS.keywordPlaceholder"
          style="width: 220px"
          @update:model-value="resetFiltersPage"
        />
        <v-select
          v-model="roleFilter"
          :items="roleFilterItems"
          density="compact"
          hide-details
          style="width: 120px"
          @update:model-value="resetFiltersPage"
        />
        <v-select
          v-model="statusFilter"
          :items="statusFilterItems"
          density="compact"
          hide-details
          style="width: 120px"
          @update:model-value="resetFiltersPage"
        />
      </div>
      <v-btn color="primary" @click="openCreate">新建用户</v-btn>
    </div>

    <v-data-table
      v-model="selectedIds"
      :headers="headers"
      :items="pageUsers"
      :items-per-page="-1"
      :sort-by="sortBy"
      item-value="id"
      show-select
      hide-default-footer
      class="elevation-0 border rounded"
      @update:sort-by="onSortByUpdate"
    >
      <template #item.role="{ item }">
        {{ roleLabel(item.role) }}
      </template>
      <template #item.status="{ item }">
        <v-chip
          size="small"
          :color="item.status === 'active' ? 'success' : 'default'"
          variant="tonal"
        >
          {{ statusLabel(item.status) }}
        </v-chip>
      </template>
      <template #item.actions="{ item }">
        <v-btn variant="text" size="small" color="primary" @click="openEdit(item)">编辑</v-btn>
        <v-btn variant="text" size="small" color="error" @click="askDelete(item)">删除</v-btn>
      </template>
    </v-data-table>

    <div class="flex justify-end">
      <v-pagination
        v-model="page"
        :length="pageCount"
        density="comfortable"
        total-visible="7"
      />
      <span class="ml-3 self-center text-sm text-medium-emphasis">共 {{ total }} 条</span>
    </div>

    <v-dialog v-model="dialogOpen" max-width="480" persistent>
      <v-card>
        <v-card-title>{{ editing ? '编辑用户' : '新建用户' }}</v-card-title>
        <v-card-text>
          <v-form ref="formRef" @submit.prevent="submit">
            <template v-for="field in USER_FORM_FIELDS" :key="field.key">
              <div
                v-if="field.key === 'status'"
                class="mb-4 flex items-center gap-3"
              >
                <span class="text-body-2">
                  {{ field.label }}{{ field.rules.required ? ' *' : '' }}
                </span>
                <v-switch
                  :model-value="form.status === 'active'"
                  color="primary"
                  hide-details
                  density="compact"
                  :label="form.status === 'active' ? STATUS_LABELS.active : STATUS_LABELS.disabled"
                  @update:model-value="(value) => (form.status = value ? 'active' : 'disabled')"
                />
              </div>
              <v-select
                v-else-if="field.control === 'select'"
                v-model="form[field.key]"
                :items="field.options?.map((option) => ({ title: option.label, value: option.value }))"
                :label="field.label"
                :rules="fieldRules(field)"
                :required="Boolean(field.rules.required)"
                density="comfortable"
              />
              <v-text-field
                v-else-if="field.control === 'date'"
                v-model="form.hireDate"
                :label="field.label"
                type="date"
                density="comfortable"
              />
              <v-textarea
                v-else-if="field.control === 'textarea'"
                v-model="form.remark"
                :label="field.label"
                :placeholder="field.placeholder"
                rows="3"
                density="comfortable"
              />
              <v-text-field
                v-else
                v-model="form[field.key]"
                :label="field.label"
                :placeholder="field.placeholder"
                :type="field.control === 'email' ? 'email' : 'text'"
                :rules="fieldRules(field)"
                :required="Boolean(field.rules.required)"
                density="comfortable"
              />
            </template>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="dialogOpen = false">取消</v-btn>
          <v-btn color="primary" @click="submit">提交</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog :model-value="!!deleteTarget" max-width="400" @update:model-value="(v) => !v && (deleteTarget = null)">
      <v-card>
        <v-card-title>删除确认</v-card-title>
        <v-card-text>确认删除该用户？</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteTarget = null">取消</v-btn>
          <v-btn color="error" @click="confirmDelete">删除</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :timeout="2500" color="success">
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>
