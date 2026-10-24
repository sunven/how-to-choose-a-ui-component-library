<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
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
import Button from './ui/Button.vue'
import Checkbox from './ui/Checkbox.vue'
import Dialog from './ui/Dialog.vue'
import Input from './ui/Input.vue'
import Label from './ui/Label.vue'
import Select from './ui/Select.vue'
import Switch from './ui/Switch.vue'
import Textarea from './ui/Textarea.vue'

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
  <div class="showcase-shadcn-vue space-y-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Input
          v-model="keyword"
          class="sm:w-56"
          :placeholder="SHOWCASE_FILTERS.keywordPlaceholder"
        />
        <Select
          v-model="roleFilter"
          :options="SHOWCASE_FILTER_OPTIONS.role"
          trigger-class="w-[140px]"
        />
        <Select
          v-model="statusFilter"
          :options="SHOWCASE_FILTER_OPTIONS.status"
          trigger-class="w-[140px]"
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
            <th
              v-for="field in USER_TABLE_COLUMNS"
              :key="field.key"
              class="p-2 font-medium"
            >
              {{ field.label }}
            </th>
            <th class="p-2 text-right font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in users"
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
            <td
              v-for="field in USER_TABLE_COLUMNS"
              :key="field.key"
              :class="
                field.key === 'email'
                  ? 'p-2 text-muted-foreground'
                  : 'p-2'
              "
            >
              <span
                v-if="field.key === 'status'"
                :class="
                  row.status === 'active'
                    ? 'rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700'
                    : 'rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600'
                "
              >
                {{ STATUS_LABELS[row.status] }}
              </span>
              <template v-else-if="field.key === 'role'">
                {{ ROLE_LABELS[row.role] }}
              </template>
              <template v-else>{{ row[field.key] }}</template>
            </td>
            <td class="p-2 text-right">
              <Button variant="ghost" size="sm" @click="openEdit(row)">编辑</Button>
              <Button variant="ghost" size="sm" class="text-destructive" @click="confirmDelete(row)">
                删除
              </Button>
            </td>
          </tr>
          <tr v-if="users.length === 0">
            <td
              :colspan="USER_TABLE_COLUMNS.length + 2"
              class="p-8 text-center text-muted-foreground"
            >
              暂无数据
            </td>
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
        <template v-for="field in USER_FORM_FIELDS" :key="field.key">
          <div v-if="field.key === 'status'" class="space-y-1">
            <div class="flex items-center justify-between rounded-md border px-3 py-2">
              <Label for="sv-status">
                {{ field.label }}{{ field.rules.required ? ' *' : '' }}：
                {{ STATUS_LABELS[form.status] }}
              </Label>
              <Switch
                id="sv-status"
                :checked="form.status === 'active'"
                @update:checked="
                  (checked) =>
                    (form.status = checked ? 'active' : 'disabled')
                "
              />
            </div>
            <p v-if="errors.status" class="text-xs text-destructive">
              {{ errors.status }}
            </p>
          </div>
          <div v-else class="grid gap-1.5">
            <Label
              :for="
                field.control === 'select' ? undefined : `sv-${field.key}`
              "
            >
              {{ field.label }}{{ field.rules.required ? ' *' : '' }}
            </Label>
            <Select
              v-if="field.control === 'select'"
              v-model="form[field.key]"
              :options="field.options ?? []"
            />
            <Input
              v-else-if="field.control === 'date'"
              :id="`sv-${field.key}`"
              v-model="form.hireDate"
              type="date"
              :placeholder="field.placeholder"
            />
            <Textarea
              v-else-if="field.control === 'textarea'"
              :id="`sv-${field.key}`"
              v-model="form.remark"
              :placeholder="field.placeholder"
            />
            <Input
              v-else
              :id="`sv-${field.key}`"
              v-model="form[field.key]"
              :type="field.control === 'email' ? 'email' : 'text'"
              :placeholder="field.placeholder"
            />
            <p v-if="errors[field.key]" class="text-xs text-destructive">
              {{ errors[field.key] }}
            </p>
          </div>
        </template>
      </div>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" @click="dialogOpen = false">取消</Button>
        <Button @click="submit">提交</Button>
      </div>
    </Dialog>
  </div>
</template>
