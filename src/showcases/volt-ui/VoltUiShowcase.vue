<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import Column from 'primevue/column'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
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
const islandEl = ref<HTMLElement | null>(null)

const roleFilterOptions = [
  { label: '全部角色', value: 'all' },
  ...ROLE_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
]
const statusFilterOptions = [
  { label: '全部状态', value: 'all' },
  { label: STATUS_LABELS.active, value: 'active' },
  { label: STATUS_LABELS.disabled, value: 'disabled' },
]
const roleFormOptions = ROLE_OPTIONS.map((o) => ({ label: o.label, value: o.value }))

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
  const next = validateUserInput(form)
  Object.assign(errors, next)
  Object.keys(errors).forEach((k) => {
    const key = k as keyof UserFormErrors
    if (!(key in next)) delete errors[key]
  })
  if (Object.keys(next).length) return

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
    toast.add({ severity: 'success', summary: '已更新用户', life: 2500 })
  } else {
    userStore.create(input)
    page.value = 1
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
      userStore.remove(user.id)
      selectedIds.value = selectedIds.value.filter((id) => id !== user.id)
      toast.add({ severity: 'success', summary: '已删除', life: 2500 })
    },
  })
}

function onSort(event: {
  sortField?: string | ((item: unknown) => string)
  sortOrder?: number | null
}) {
  if (event.sortField !== 'hireDate') return
  if (event.sortOrder === 1) setHireDateSortFromOrder('asc')
  else if (event.sortOrder === -1) setHireDateSortFromOrder('desc')
  else setHireDateSortFromOrder(null)
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
          placeholder="搜索姓名 / 邮箱"
          class="w-[220px]"
          @update:model-value="resetFiltersPage"
        />
        <Select
          v-model="roleFilter"
          :options="roleFilterOptions"
          option-label="label"
          option-value="value"
          class="w-[120px]"
          @update:model-value="resetFiltersPage"
        />
        <Select
          v-model="statusFilter"
          :options="statusFilterOptions"
          option-label="label"
          option-value="value"
          class="w-[120px]"
          @update:model-value="resetFiltersPage"
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
      <Column field="name" header="姓名" />
      <Column field="email" header="邮箱" />
      <Column field="role" header="角色">
        <template #body="{ data }">
          {{ roleLabel(data.role) }}
        </template>
      </Column>
      <Column field="status" header="状态">
        <template #body="{ data }">
          <Tag
            :value="STATUS_LABELS[data.status as UserStatus]"
            :severity="statusSeverity(data.status)"
          />
        </template>
      </Column>
      <Column field="hireDate" header="入职日期" sortable />
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
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-color">姓名</label>
          <InputText v-model="form.name" placeholder="请输入姓名" class="w-full" />
          <small v-if="errors.name" class="text-red-500">{{ errors.name }}</small>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-color">邮箱</label>
          <InputText v-model="form.email" placeholder="name@example.com" class="w-full" />
          <small v-if="errors.email" class="text-red-500">{{ errors.email }}</small>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-color">角色</label>
          <Select
            v-model="form.role"
            :options="roleFormOptions"
            option-label="label"
            option-value="value"
            class="w-full"
          />
          <small v-if="errors.role" class="text-red-500">{{ errors.role }}</small>
        </div>
        <div class="flex items-center gap-3">
          <label class="text-sm font-medium text-color">状态</label>
          <ToggleSwitch
            :model-value="form.status === 'active'"
            @update:model-value="(v: boolean) => (form.status = v ? 'active' : 'disabled')"
          />
          <span class="text-sm text-muted-color">{{
            form.status === 'active' ? '启用' : '禁用'
          }}</span>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-color">入职日期</label>
          <DatePicker v-model="hireDateModel" date-format="yy-mm-dd" class="w-full" show-icon />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-color">备注</label>
          <Textarea v-model="form.remark" rows="3" placeholder="可选" class="w-full" auto-resize />
        </div>
      </div>
      <template #footer>
        <SecondaryButton label="取消" text @click="dialogOpen = false" />
        <Button label="提交" @click="submit" />
      </template>
    </Dialog>
  </div>
</template>
