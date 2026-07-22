<script setup lang="ts">
import { computed, onUnmounted, reactive, ref, shallowRef } from 'vue'
import {
  ElButton,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElMessageBox,
  ElOption,
  ElPagination,
  ElSelect,
  ElSwitch,
  ElTable,
  ElTableColumn,
  ElTag,
  ElDatePicker,
  type FormInstance,
  type FormRules,
} from 'element-plus'
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
import { userStore } from '@/domain/userStore'

const allUsers = shallowRef(userStore.getSnapshot())
const unsubscribe = userStore.subscribe(() => {
  allUsers.value = userStore.getSnapshot()
})
onUnmounted(() => {
  unsubscribe()
  ElMessage.closeAll()
})

const keyword = ref('')
const roleFilter = ref<UserRole | 'all'>('all')
const statusFilter = ref<UserStatus | 'all'>('all')
const hireDateSort = ref<'none' | 'asc' | 'desc'>('none')
const page = ref(1)
const pageSize = 10
const selectedIds = ref<string[]>([])

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  let list = allUsers.value.filter((u) => {
    if (kw && !u.name.toLowerCase().includes(kw) && !u.email.toLowerCase().includes(kw)) {
      return false
    }
    if (roleFilter.value !== 'all' && u.role !== roleFilter.value) return false
    if (statusFilter.value !== 'all' && u.status !== statusFilter.value) return false
    return true
  })
  if (hireDateSort.value !== 'none') {
    list = [...list].sort((a, b) => {
      const cmp = a.hireDate.localeCompare(b.hireDate)
      return hireDateSort.value === 'asc' ? cmp : -cmp
    })
  }
  return list
})

const total = computed(() => filtered.value.length)

const pageUsers = computed(() => {
  const start = (page.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

const dialogOpen = ref(false)
const editing = ref<User | null>(null)
const formRef = ref<FormInstance>()
const form = reactive<UserInput>(emptyUserInput())

const rules: FormRules<UserInput> = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

function resetFiltersPage() {
  page.value = 1
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
  if (!formRef.value) return
  await formRef.value.validate()
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
    ElMessage.success('已更新用户')
  } else {
    userStore.create(input)
    page.value = 1
    ElMessage.success('已创建用户')
  }
  dialogOpen.value = false
}

async function confirmDelete(user: User) {
  try {
    await ElMessageBox.confirm('确认删除该用户？', '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    userStore.remove(user.id)
    selectedIds.value = selectedIds.value.filter((id) => id !== user.id)
    ElMessage.success('已删除')
  } catch {
    /* cancelled */
  }
}

function onSelectionChange(rows: User[]) {
  selectedIds.value = rows.map((r) => r.id)
}

function onSortChange(payload: { prop: string; order: string | null }) {
  if (payload.prop !== 'hireDate') return
  if (payload.order === 'ascending') hireDateSort.value = 'asc'
  else if (payload.order === 'descending') hireDateSort.value = 'desc'
  else hireDateSort.value = 'none'
}

const sortOrders: Record<'none' | 'asc' | 'desc', 'ascending' | 'descending' | null> = {
  none: null,
  asc: 'ascending',
  desc: 'descending',
}
</script>

<template>
  <div class="ep-showcase space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-2">
        <ElInput
          v-model="keyword"
          clearable
          placeholder="搜索姓名 / 邮箱"
          style="width: 220px"
          @update:model-value="resetFiltersPage"
        />
        <ElSelect
          v-model="roleFilter"
          style="width: 120px"
          @change="resetFiltersPage"
        >
          <ElOption label="全部角色" value="all" />
          <ElOption
            v-for="o in ROLE_OPTIONS"
            :key="o.value"
            :label="o.label"
            :value="o.value"
          />
        </ElSelect>
        <ElSelect
          v-model="statusFilter"
          style="width: 120px"
          @change="resetFiltersPage"
        >
          <ElOption label="全部状态" value="all" />
          <ElOption :label="STATUS_LABELS.active" value="active" />
          <ElOption :label="STATUS_LABELS.disabled" value="disabled" />
        </ElSelect>
      </div>
      <ElButton type="primary" @click="openCreate">新建用户</ElButton>
    </div>

    <ElTable
      :data="pageUsers"
      row-key="id"
      style="width: 100%"
      @selection-change="onSelectionChange"
      @sort-change="onSortChange"
    >
      <ElTableColumn type="selection" width="48" />
      <ElTableColumn prop="name" label="姓名" min-width="100" />
      <ElTableColumn prop="email" label="邮箱" min-width="180" />
      <ElTableColumn prop="role" label="角色" width="100">
        <template #default="{ row }">
          {{ ROLE_LABELS[row.role as UserRole] }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="status" label="状态" width="100">
        <template #default="{ row }">
          <ElTag :type="row.status === 'active' ? 'success' : 'info'" size="small">
            {{ STATUS_LABELS[row.status as UserStatus] }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn
        prop="hireDate"
        label="入职日期"
        width="140"
        sortable="custom"
        :sort-orders="['ascending', 'descending', null]"
        :sort-order="sortOrders[hireDateSort]"
      />
      <ElTableColumn label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <ElButton link type="primary" size="small" @click="openEdit(row)">编辑</ElButton>
          <ElButton link type="danger" size="small" @click="confirmDelete(row)">删除</ElButton>
        </template>
      </ElTableColumn>
    </ElTable>

    <div class="flex justify-end">
      <ElPagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        background
      />
    </div>

    <ElDialog
      v-model="dialogOpen"
      :title="editing ? '编辑用户' : '新建用户'"
      width="480px"
      destroy-on-close
    >
      <ElForm ref="formRef" :model="form" :rules="rules" label-position="top">
        <ElFormItem label="姓名" prop="name">
          <ElInput v-model="form.name" placeholder="请输入姓名" />
        </ElFormItem>
        <ElFormItem label="邮箱" prop="email">
          <ElInput v-model="form.email" placeholder="name@example.com" />
        </ElFormItem>
        <ElFormItem label="角色" prop="role">
          <ElSelect v-model="form.role" class="w-full">
            <ElOption
              v-for="o in ROLE_OPTIONS"
              :key="o.value"
              :label="o.label"
              :value="o.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="状态" prop="status">
          <ElSwitch
            :model-value="form.status === 'active'"
            active-text="启用"
            inactive-text="禁用"
            @update:model-value="(v: boolean) => (form.status = v ? 'active' : 'disabled')"
          />
        </ElFormItem>
        <ElFormItem label="入职日期" prop="hireDate">
          <ElDatePicker
            v-model="form.hireDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            class="w-full"
            style="width: 100%"
          />
        </ElFormItem>
        <ElFormItem label="备注" prop="remark">
          <ElInput v-model="form.remark" type="textarea" :rows="3" placeholder="可选" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogOpen = false">取消</ElButton>
        <ElButton type="primary" @click="submit">提交</ElButton>
      </template>
    </ElDialog>
  </div>
</template>
