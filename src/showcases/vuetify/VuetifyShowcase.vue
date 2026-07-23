<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  ROLE_LABELS,
  ROLE_OPTIONS,
  STATUS_LABELS,
  emptyUserInput,
  type User,
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
const deleteTarget = ref<User | null>(null)
const editing = ref<User | null>(null)
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)
const form = reactive<UserInput>(emptyUserInput())
const snackbar = ref(false)
const snackbarText = ref('')

const roleFilterItems = [
  { title: '全部角色', value: 'all' as const },
  ...ROLE_OPTIONS.map((o) => ({ title: o.label, value: o.value })),
]
const statusFilterItems = [
  { title: '全部状态', value: 'all' as const },
  { title: STATUS_LABELS.active, value: 'active' as const },
  { title: STATUS_LABELS.disabled, value: 'disabled' as const },
]
const roleFormItems = ROLE_OPTIONS.map((o) => ({ title: o.label, value: o.value }))

const headers = [
  { title: '姓名', key: 'name', sortable: false },
  { title: '邮箱', key: 'email', sortable: false },
  { title: '角色', key: 'role', sortable: false },
  { title: '状态', key: 'status', sortable: false },
  { title: '入职日期', key: 'hireDate', sortable: true },
  { title: '操作', key: 'actions', sortable: false, align: 'end' as const },
]

const sortBy = computed(() => {
  if (hireDateSort.value === 'asc') return [{ key: 'hireDate', order: 'asc' as const }]
  if (hireDateSort.value === 'desc') return [{ key: 'hireDate', order: 'desc' as const }]
  return []
})

const nameRules = [(v: string) => !!v?.trim() || '请输入姓名']
const emailRules = [
  (v: string) => !!v?.trim() || '请输入邮箱',
  (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v?.trim() ?? '') || '邮箱格式不正确',
]
const roleRules = [(v: string) => !!v || '请选择角色']

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
  const result = await formRef.value?.validate()
  if (!result?.valid) return
  const input: UserInput = {
    name: form.name.trim(),
    email: form.email.trim(),
    role: form.role,
    status: form.status,
    hireDate: form.hireDate ? String(form.hireDate).slice(0, 10) : '',
    remark: (form.remark ?? '').trim(),
  }
  if (editing.value) {
    userStore.update(editing.value.id, input)
    showMessage('已更新用户')
  } else {
    userStore.create(input)
    page.value = 1
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
  userStore.remove(user.id)
  selectedIds.value = selectedIds.value.filter((id) => id !== user.id)
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
          label="搜索姓名 / 邮箱"
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
        :length="Math.max(1, Math.ceil(total / pageSize))"
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
            <v-text-field
              v-model="form.name"
              label="姓名"
              :rules="nameRules"
              density="comfortable"
            />
            <v-text-field
              v-model="form.email"
              label="邮箱"
              placeholder="name@example.com"
              :rules="emailRules"
              density="comfortable"
            />
            <v-select
              v-model="form.role"
              :items="roleFormItems"
              label="角色"
              :rules="roleRules"
              density="comfortable"
            />
            <div class="mb-4 flex items-center gap-3">
              <span class="text-body-2">状态</span>
              <v-switch
                :model-value="form.status === 'active'"
                color="primary"
                hide-details
                density="compact"
                :label="form.status === 'active' ? '启用' : '禁用'"
                @update:model-value="(v) => (form.status = v ? 'active' : 'disabled')"
              />
            </div>
            <v-text-field
              v-model="form.hireDate"
              label="入职日期"
              type="date"
              density="comfortable"
            />
            <v-textarea
              v-model="form.remark"
              label="备注"
              placeholder="可选"
              rows="3"
              density="comfortable"
            />
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
