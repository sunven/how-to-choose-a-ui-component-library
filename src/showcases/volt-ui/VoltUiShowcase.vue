<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import Column from 'primevue/column'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
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
import Button from './ui/Button.vue'
import ConfirmDialog from './ui/ConfirmDialog.vue'
import DataTable from './ui/DataTable.vue'
import DatePicker from './ui/DatePicker.vue'
import Dialog from './ui/Dialog.vue'
import InputText from './ui/InputText.vue'
import Paginator from './ui/Paginator.vue'
import SecondaryButton from './ui/SecondaryButton.vue'
import Select from './ui/Select.vue'
import Tag from './ui/Tag.vue'
import Textarea from './ui/Textarea.vue'
import Toast from './ui/Toast.vue'
import ToggleSwitch from './ui/ToggleSwitch.vue'

const toast = useToast()
const confirm = useConfirm()

const {
  keyword,
  roleFilter,
  statusFilter,
  hireDateSort,
  page,
  pageSize,
  selectedIds,
  total,
  users: pageUsers,
  setHireDateSort,
  createUser,
  updateUser,
  deleteUser,
} = useShowcaseUsers()

const dialogOpen = ref(false)
const editing = ref<User | null>(null)
const form = reactive<UserInput>(emptyUserInput())
const errors = reactive<UserFormErrors>({})
const islandEl = ref<HTMLElement | null>(null)

const selectedUsers = computed({
  get: () => pageUsers.value.filter((u) => selectedIds.value.includes(u.id)),
  set: (rows: User[]) => {
    selectedIds.value = rows.map((r) => r.id)
  },
})

const hireDateModel = computed({
  get: () => (form.hireDate ? new Date(form.hireDate + 'T00:00:00') : null),
  set: (v: Date | Date[] | (Date | null)[] | null | undefined) => {
    const d = Array.isArray(v) ? v[0] : v
    if (!d || !(d instanceof Date)) {
      form.hireDate = ''
      return
    }
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    form.hireDate = `${y}-${m}-${day}`
  },
})

const sortField = computed(() => (hireDateSort.value === 'none' ? undefined : 'hireDate'))
const sortOrder = computed(() => {
  if (hireDateSort.value === 'asc') return 1
  if (hireDateSort.value === 'desc') return -1
  return 0
})

const first = computed(() => (page.value - 1) * pageSize)

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
    toast.add({ severity: 'success', summary: '已更新用户', life: 2500 })
  } else {
    toast.add({ severity: 'success', summary: '已创建用户', life: 2500 })
  }
  dialogOpen.value = false
}

function confirmDelete(user: User) {
  confirm.require({
    message: '确认删除该用户？',
    header: '删除确认',
    rejectLabel: '取消',
    acceptLabel: '删除',
    accept: () => {
      deleteUser(user.id)
      toast.add({ severity: 'success', summary: '已删除', life: 2500 })
    },
  })
}

function onSort(event: {
  sortField?: string | ((item: unknown) => string)
  sortOrder?: number | null
}) {
  if (event.sortField !== 'hireDate') return
  if (event.sortOrder === 1) setHireDateSort('asc')
  else if (event.sortOrder === -1) setHireDateSort('desc')
  else setHireDateSort('none')
}

function onPage(event: { page: number }) {
  page.value = event.page + 1
}

function roleLabel(role: UserRole) {
  return ROLE_LABELS[role]
}

function statusSeverity(status: UserStatus) {
  return status === 'active' ? 'success' : 'secondary'
}
</script>

<template>
  <div ref="islandEl" class="volt-showcase space-y-4">
    <Toast />
    <ConfirmDialog />

    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-2">
        <InputText
          v-model="keyword"
          :placeholder="SHOWCASE_FILTERS.keywordPlaceholder"
          class="w-[220px]"
        />
        <Select
          v-model="roleFilter"
          :options="SHOWCASE_FILTER_OPTIONS.role"
          option-label="label"
          option-value="value"
          class="w-[120px]"
        />
        <Select
          v-model="statusFilter"
          :options="SHOWCASE_FILTER_OPTIONS.status"
          option-label="label"
          option-value="value"
          class="w-[120px]"
        />
      </div>
      <Button label="新建用户" @click="openCreate" />
    </div>

    <DataTable
      v-model:selection="selectedUsers"
      :value="pageUsers"
      data-key="id"
      :sort-field="sortField"
      :sort-order="sortOrder"
      :paginator="false"
      @sort="onSort"
    >
      <Column selection-mode="multiple" header-style="width: 3rem" />
      <Column
        v-for="field in USER_TABLE_COLUMNS"
        :key="field.key"
        :field="field.key"
        :header="field.label"
        :sortable="Boolean(field.sortable)"
      >
        <template #body="{ data }">
          <Tag
            v-if="field.key === 'status'"
            :value="STATUS_LABELS[data.status as UserStatus]"
            :severity="statusSeverity(data.status)"
          />
          <template v-else-if="field.key === 'role'">
            {{ roleLabel(data.role) }}
          </template>
          <template v-else>{{ data[field.key] }}</template>
        </template>
      </Column>
      <Column header="操作" style="width: 10rem">
        <template #body="{ data }">
          <SecondaryButton label="编辑" text size="small" @click="openEdit(data)" />
          <Button label="删除" text size="small" severity="danger" @click="confirmDelete(data)" />
        </template>
      </Column>
    </DataTable>

    <div class="flex justify-end">
      <Paginator
        :rows="pageSize"
        :total-records="total"
        :first="first"
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
        current-page-report-template="共 {totalRecords} 条"
        @page="onPage"
      />
    </div>

    <Dialog
      v-model:visible="dialogOpen"
      modal
      :header="editing ? '编辑用户' : '新建用户'"
      :style="{ width: '480px' }"
      :closable="true"
      :append-to="islandEl ?? 'body'"
    >
      <div class="flex flex-col gap-3 pt-1">
        <div
          v-for="field in USER_FORM_FIELDS"
          :key="field.key"
          class="flex flex-col gap-1"
        >
          <template v-if="field.key === 'status'">
            <div class="flex items-center gap-3">
              <label class="text-sm font-medium text-color">
                {{ field.label }}{{ field.rules.required ? ' *' : '' }}
              </label>
              <ToggleSwitch
                :model-value="form.status === 'active'"
                @update:model-value="
                  (value: boolean) =>
                    (form.status = value ? 'active' : 'disabled')
                "
              />
              <span class="text-sm text-muted-color">
                {{ STATUS_LABELS[form.status] }}
              </span>
            </div>
            <small v-if="errors.status" class="text-red-500">
              {{ errors.status }}
            </small>
          </template>
          <template v-else>
            <label class="text-sm font-medium text-color">
              {{ field.label }}{{ field.rules.required ? ' *' : '' }}
            </label>
            <Select
              v-if="field.control === 'select'"
              v-model="form[field.key]"
              :options="field.options"
              option-label="label"
              option-value="value"
              class="w-full"
            />
            <DatePicker
              v-else-if="field.control === 'date'"
              v-model="hireDateModel"
              date-format="yy-mm-dd"
              :placeholder="field.placeholder"
              class="w-full"
              show-icon
            />
            <Textarea
              v-else-if="field.control === 'textarea'"
              v-model="form.remark"
              rows="3"
              :placeholder="field.placeholder"
              class="w-full"
              auto-resize
            />
            <InputText
              v-else
              v-model="form[field.key]"
              :placeholder="field.placeholder"
              class="w-full"
            />
            <small v-if="errors[field.key]" class="text-red-500">
              {{ errors[field.key] }}
            </small>
          </template>
        </div>
      </div>
      <template #footer>
        <SecondaryButton label="取消" text @click="dialogOpen = false" />
        <Button label="提交" @click="submit" />
      </template>
    </Dialog>
  </div>
</template>
