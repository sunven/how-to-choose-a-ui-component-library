<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useQuasar, type QTableColumn, type QTableProps } from 'quasar'
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
  type UserRole,
  type UserStatus,
} from '@/domain/user'
import { useShowcaseUsers } from '../vue-shared/useShowcaseUsers'

const $q = useQuasar()

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
const deleteTarget = ref<User | null>(null)
const editing = ref<User | null>(null)
const form = reactive<UserInput>(emptyUserInput())
const errors = reactive<UserFormErrors>({})

const columns: QTableColumn<User>[] = [
  ...USER_TABLE_COLUMNS.map((field) => {
    const column: QTableColumn<User> = {
      name: field.key,
      label: field.label,
      field: field.key,
      align: 'left',
    }
    if (field.key === 'role') {
      column.format = (value: UserRole) => ROLE_LABELS[value]
    } else if (field.sortable) {
      column.sortable = true
    }
    return column
  }),
  { name: 'actions', label: '操作', field: 'id', align: 'right' },
]

const selectedRows = computed({
  get: () => pageUsers.value.filter((u) => selectedIds.value.includes(u.id)),
  set: (rows: User[]) => {
    selectedIds.value = rows.map((r) => r.id)
  },
})

const pagination = computed(() => ({
  page: page.value,
  rowsPerPage: pageSize,
  rowsNumber: total.value,
  sortBy: hireDateSort.value === 'none' ? undefined : 'hireDate',
  descending: hireDateSort.value === 'desc',
}))

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

  if (editing.value) {
    $q.notify({ type: 'positive', message: '已更新用户', timeout: 2500 })
  } else {
    $q.notify({ type: 'positive', message: '已创建用户', timeout: 2500 })
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
  $q.notify({ type: 'positive', message: '已删除', timeout: 2500 })
}

function onRequest(props: { pagination: NonNullable<QTableProps['pagination']> }) {
  const p = props.pagination
  if (p) {
    page.value = p.page ?? 1
    if (p.sortBy === 'hireDate') {
      setHireDateSortFromOrder(p.descending ? 'desc' : 'asc')
    } else if (!p.sortBy) {
      setHireDateSortFromOrder(null)
    }
  }
}

function statusLabel(status: UserStatus) {
  return STATUS_LABELS[status]
}
</script>

<template>
  <div class="quasar-showcase q-gutter-y-md">
    <div class="row items-center justify-between q-col-gutter-sm">
      <div class="col-auto row q-gutter-sm items-center">
        <q-input
          v-model="keyword"
          dense
          outlined
          clearable
          :placeholder="SHOWCASE_FILTERS.keywordPlaceholder"
          style="width: 220px"
          @update:model-value="resetFiltersPage"
        />
        <q-select
          v-model="roleFilter"
          :options="SHOWCASE_FILTER_OPTIONS.role"
          dense
          outlined
          emit-value
          map-options
          style="width: 120px"
          @update:model-value="resetFiltersPage"
        />
        <q-select
          v-model="statusFilter"
          :options="SHOWCASE_FILTER_OPTIONS.status"
          dense
          outlined
          emit-value
          map-options
          style="width: 120px"
          @update:model-value="resetFiltersPage"
        />
      </div>
      <div class="col-auto">
        <q-btn color="primary" label="新建用户" unelevated @click="openCreate" />
      </div>
    </div>

    <q-table
      v-model:selected="selectedRows"
      :rows="pageUsers"
      :columns="columns"
      row-key="id"
      selection="multiple"
      :pagination="pagination"
      :rows-per-page-options="[pageSize]"
      flat
      bordered
      binary-state-sort
      @request="onRequest"
    >
      <template #body-cell-status="props">
        <q-td :props="props">
          <q-badge :color="props.row.status === 'active' ? 'positive' : 'grey'">
            {{ statusLabel(props.row.status) }}
          </q-badge>
        </q-td>
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props" class="q-gutter-xs">
          <q-btn flat dense color="primary" label="编辑" @click="openEdit(props.row)" />
          <q-btn flat dense color="negative" label="删除" @click="askDelete(props.row)" />
        </q-td>
      </template>
      <template #bottom>
        <div class="full-width row justify-end items-center q-pa-sm text-caption">
          共 {{ total }} 条
        </div>
      </template>
    </q-table>

    <q-dialog v-model="dialogOpen" persistent>
      <q-card style="min-width: 420px; max-width: 480px">
        <q-card-section>
          <div class="text-h6">{{ editing ? '编辑用户' : '新建用户' }}</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <template v-for="field in USER_FORM_FIELDS" :key="field.key">
            <div
              v-if="field.key === 'status'"
              class="row items-center q-gutter-sm"
            >
              <span class="text-body2">
                {{ field.label }}{{ field.rules.required ? ' *' : '' }}
              </span>
              <q-toggle
                :model-value="form.status === 'active'"
                :label="form.status === 'active' ? STATUS_LABELS.active : STATUS_LABELS.disabled"
                color="primary"
                :error="!!errors.status"
                :error-message="errors.status"
                @update:model-value="
                  (value: boolean) =>
                    (form.status = value ? 'active' : 'disabled')
                "
              />
            </div>
            <q-select
              v-else-if="field.control === 'select'"
              v-model="form[field.key]"
              :options="field.options ?? []"
              :label="field.label + (field.rules.required ? ' *' : '')"
              outlined
              dense
              emit-value
              map-options
              :error="!!errors[field.key]"
              :error-message="errors[field.key]"
            />
            <q-input
              v-else-if="field.control === 'date'"
              v-model="form.hireDate"
              :label="field.label"
              type="date"
              outlined
              dense
            />
            <q-input
              v-else-if="field.control === 'textarea'"
              v-model="form.remark"
              :label="field.label"
              :placeholder="field.placeholder"
              type="textarea"
              outlined
              dense
              autogrow
            />
            <q-input
              v-else
              v-model="form[field.key]"
              :label="field.label + (field.rules.required ? ' *' : '')"
              :placeholder="field.placeholder"
              :type="field.control === 'email' ? 'email' : 'text'"
              outlined
              dense
              :error="!!errors[field.key]"
              :error-message="errors[field.key]"
            />
          </template>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" @click="dialogOpen = false" />
          <q-btn color="primary" unelevated label="提交" @click="submit" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog :model-value="!!deleteTarget" @update:model-value="(v) => !v && (deleteTarget = null)">
      <q-card style="min-width: 320px">
        <q-card-section>
          <div class="text-h6">删除确认</div>
        </q-card-section>
        <q-card-section>确认删除该用户？</q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="取消" @click="deleteTarget = null" />
          <q-btn color="negative" unelevated label="删除" @click="confirmDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
