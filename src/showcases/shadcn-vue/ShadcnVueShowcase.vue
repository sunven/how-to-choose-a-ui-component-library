<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
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
import Checkbox from './ui/Checkbox.vue'
import Dialog from './ui/Dialog.vue'
import Input from './ui/Input.vue'
import Label from './ui/Label.vue'
import Select from './ui/Select.vue'
import Switch from './ui/Switch.vue'
import Textarea from './ui/Textarea.vue'

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
  { value: 'all', label: '全部角色' },
  ...ROLE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
]
const statusFilterOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'active', label: STATUS_LABELS.active },
  { value: 'disabled', label: STATUS_LABELS.disabled },
]
const roleFormOptions = ROLE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))

const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
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
  <div class="showcase-shadcn-vue space-y-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Input
          v-model="keyword"
          class="sm:w-56"
          placeholder="搜索姓名 / 邮箱"
          @update:model-value="resetFiltersPage"
        />
        <Select
          :model-value="roleFilter"
          :options="roleFilterOptions"
          trigger-class="w-[140px]"
          @update:model-value="onRoleFilter"
        />
        <Select
          :model-value="statusFilter"
          :options="statusFilterOptions"
          trigger-class="w-[140px]"
          @update:model-value="onStatusFilter"
        />
        <Button variant="outline" @click="cycleHireDateSort">
          入职排序：
          {{ hireDateSort === 'none' ? '默认' : hireDateSort === 'asc' ? '升序' : '降序' }}
        </Button>
      </div>
      <Button @click="openCreate">新建用户</Button>
    </div>

    <div class="overflow-x-auto rounded-md border">
      <table class="w-full min-w-[720px] text-sm">
        <thead class="bg-muted/50">
          <tr class="border-b text-left">
            <th class="w-10 p-2">
              <Checkbox
                :checked="allPageSelected"
                aria-label="全选本页"
                @update:checked="toggleSelectAllPage"
              />
            </th>
            <th class="p-2 font-medium">姓名</th>
            <th class="p-2 font-medium">邮箱</th>
            <th class="p-2 font-medium">角色</th>
            <th class="p-2 font-medium">状态</th>
            <th class="p-2 font-medium">入职日期</th>
            <th class="p-2 text-right font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in pageUsers"
            :key="row.id"
            class="border-b last:border-0 hover:bg-muted/30"
          >
            <td class="p-2">
              <Checkbox
                :checked="selectedIds.includes(row.id)"
                :aria-label="`选择 ${row.name}`"
                @update:checked="(c) => toggleSelect(row.id, c)"
              />
            </td>
            <td class="p-2">{{ row.name }}</td>
            <td class="p-2 text-muted-foreground">{{ row.email }}</td>
            <td class="p-2">{{ ROLE_LABELS[row.role as UserRole] }}</td>
            <td class="p-2">
              <span
                :class="
                  row.status === 'active'
                    ? 'rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700'
                    : 'rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600'
                "
              >
                {{ STATUS_LABELS[row.status as UserStatus] }}
              </span>
            </td>
            <td class="p-2">{{ row.hireDate }}</td>
            <td class="p-2 text-right">
              <Button variant="ghost" size="sm" @click="openEdit(row)">编辑</Button>
              <Button variant="ghost" size="sm" class="text-destructive" @click="confirmDelete(row)">
                删除
              </Button>
            </td>
          </tr>
          <tr v-if="pageUsers.length === 0">
            <td colspan="7" class="p-8 text-center text-muted-foreground">暂无数据</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex items-center justify-between text-sm text-muted-foreground">
      <span>共 {{ total }} 条 · 第 {{ page }} / {{ pageCount }} 页</span>
      <div class="flex gap-2">
        <Button variant="outline" size="sm" :disabled="page <= 1" @click="page = page - 1">
          上一页
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="page >= pageCount"
          @click="page = page + 1"
        >
          下一页
        </Button>
      </div>
    </div>

    <Dialog v-model:open="dialogOpen" :title="editing ? '编辑用户' : '新建用户'">
      <div class="grid gap-3 py-2">
        <div class="grid gap-1.5">
          <Label for="sv-name">姓名</Label>
          <Input id="sv-name" v-model="form.name" />
          <p v-if="errors.name" class="text-xs text-destructive">{{ errors.name }}</p>
        </div>
        <div class="grid gap-1.5">
          <Label for="sv-email">邮箱</Label>
          <Input id="sv-email" v-model="form.email" />
          <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</p>
        </div>
        <div class="grid gap-1.5">
          <Label>角色</Label>
          <Select
            v-model="form.role"
            :options="roleFormOptions"
            @update:model-value="(v) => (form.role = v as UserInput['role'])"
          />
        </div>
        <div class="flex items-center justify-between rounded-md border px-3 py-2">
          <Label for="sv-status">状态（启用）</Label>
          <Switch
            id="sv-status"
            :checked="form.status === 'active'"
            @update:checked="(c) => (form.status = c ? 'active' : 'disabled')"
          />
        </div>
        <div class="grid gap-1.5">
          <Label for="sv-hire">入职日期</Label>
          <Input id="sv-hire" v-model="form.hireDate" type="date" />
        </div>
        <div class="grid gap-1.5">
          <Label for="sv-remark">备注</Label>
          <Textarea id="sv-remark" v-model="form.remark" />
        </div>
      </div>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" @click="dialogOpen = false">取消</Button>
        <Button @click="submit">提交</Button>
      </div>
    </Dialog>
  </div>
</template>
