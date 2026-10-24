<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import Button from 'primevue/button'
import Column from 'primevue/column'
import ConfirmDialog from 'primevue/confirmdialog'
import DataTable from 'primevue/datatable'
import DatePicker from 'primevue/datepicker'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Paginator from 'primevue/paginator'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import Textarea from 'primevue/textarea'
import Toast from 'primevue/toast'
import ToggleSwitch from 'primevue/toggleswitch'
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

const toast = useToast()
const confirm = useConfirm()

const {
  keyword,
  roleFilter,
  statusFilter,
  hireDateSort,
  page,
  pageSize,
  selectedRows,
  total,
  users,
  setHireDateSort,
  createUser,
  updateUser,
  deleteUser,
} = useShowcaseUsers()

const dialogOpen = ref(false)
const editing = ref<User | null>(null)
const form = reactive<UserInput>(emptyUserInput())
const errors = reactive<UserFormErrors>({})

const hireDateModel = computed({
  get: () => (form.hireDate ? new Date(form.hireDate + 'T00:00:00') : null),
  set: (v: Date | null) => {
    if (!v) {
      form.hireDate = ''
      return
    }
    const y = v.getFullYear()
    const m = String(v.getMonth() + 1).padStart(2, '0')
    const d = String(v.getDate()).padStart(2, '0')
    form.hireDate = `${y}-${m}-${d}`
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
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: '取消',
    acceptLabel: '删除',
    acceptClass: 'p-button-danger',
    accept: () => {
      deleteUser(user.id)
      toast.add({ severity: 'success', summary: '已删除', life: 2500 })
    },
  })
}

function onSort(event: { sortField?: string | ((item: unknown) => string); sortOrder?: number | null }) {
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
  <div class="primevue-showcase space-y-4">
    <Toast />
    <ConfirmDialog />

    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-2">
        <InputText
          v-model="keyword"
          :placeholder="SHOWCASE_FILTERS.keywordPlaceholder"
          style="width: 220px"
        />
        <Select
          v-model="roleFilter"
          :options="SHOWCASE_FILTER_OPTIONS.role"
          option-label="label"
          option-value="value"
          style="width: 120px"
        />
        <Select
          v-model="statusFilter"
          :options="SHOWCASE_FILTER_OPTIONS.status"
          option-label="label"
          option-value="value"
          style="width: 120px"
        />
      </div>
      <Button label="新建用户" @click="openCreate" />
    </div>

    <DataTable
      v-model:selection="selectedRows"
      :value="users"
      data-key="id"
      :sort-field="sortField"
      :sort-order="sortOrder"
      :paginator="false"
      striped-rows
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
          <Button label="编辑" link size="small" @click="openEdit(data)" />
          <Button label="删除" link severity="danger" size="small" @click="confirmDelete(data)" />
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
    >
      <div class="flex flex-col gap-3 pt-1">
        <div
          v-for="field in USER_FORM_FIELDS"
          :key="field.key"
          class="flex flex-col gap-1"
        >
          <div v-if="field.key === 'status'" class="flex items-center gap-3">
            <label class="text-sm font-medium">
              {{ field.label }}{{ field.rules.required ? ' *' : '' }}
            </label>
            <ToggleSwitch
              :model-value="form.status === 'active'"
              @update:model-value="
                (value: boolean) =>
                  (form.status = value ? 'active' : 'disabled')
              "
            />
            <span class="text-sm">{{ STATUS_LABELS[form.status] }}</span>
          </div>
          <template v-else>
            <label class="text-sm font-medium">
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
          </template>
          <small v-if="errors[field.key]" class="text-red-500">
            {{ errors[field.key] }}
          </small>
        </div>
      </div>
      <template #footer>
        <Button label="取消" severity="secondary" text @click="dialogOpen = false" />
        <Button label="提交" @click="submit" />
      </template>
    </Dialog>
  </div>
</template>
