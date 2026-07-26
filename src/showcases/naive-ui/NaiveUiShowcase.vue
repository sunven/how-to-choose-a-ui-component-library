<script setup lang="ts">
import { computed, h, reactive, ref } from 'vue'
import {
  NButton,
  NDataTable,
  NDatePicker,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NSelect,
  NSpace,
  NSwitch,
  NTag,
  NPagination,
  useMessage,
  type DataTableColumns,
  type FormInst,
  type FormRules,
} from 'naive-ui'
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

const message = useMessage()
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
const editing = ref<User | null>(null)
const formRef = ref<FormInst | null>(null)
const form = reactive<UserInput>(emptyUserInput())

const rules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: ['blur', 'input'] }],
  email: [
    { required: true, message: '请输入邮箱', trigger: ['blur', 'input'] },
    { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'input'] },
  ],
  role: [{ required: true, message: '请选择角色', trigger: ['change', 'blur'] }],
}

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

const columns = computed<DataTableColumns<User>>(() => [
  { type: 'selection' },
  { title: '姓名', key: 'name' },
  { title: '邮箱', key: 'email' },
  {
    title: '角色',
    key: 'role',
    render: (row) => ROLE_LABELS[row.role as UserRole],
  },
  {
    title: '状态',
    key: 'status',
    render: (row) =>
      h(
        NTag,
        { type: row.status === 'active' ? 'success' : 'default', size: 'small', bordered: false },
        { default: () => STATUS_LABELS[row.status as UserStatus] },
      ),
  },
  {
    title: '入职日期',
    key: 'hireDate',
    sorter: true,
    sortOrder:
      hireDateSort.value === 'asc'
        ? 'ascend'
        : hireDateSort.value === 'desc'
          ? 'descend'
          : false,
  },
  {
    title: '操作',
    key: 'actions',
    render: (row) =>
      h(NSpace, { size: 4 }, {
        default: () => [
          h(
            NButton,
            { text: true, type: 'primary', size: 'small', onClick: () => openEdit(row) },
            { default: () => '编辑' },
          ),
          h(
            NButton,
            {
              text: true,
              type: 'error',
              size: 'small',
              onClick: () => confirmDelete(row),
            },
            { default: () => '删除' },
          ),
        ],
      }),
  },
])

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
  await formRef.value?.validate()
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
  if (!result.ok) {
    message.error(Object.values(result.errors).find(Boolean) ?? '请检查表单')
    return
  }

  if (editing.value) {
    message.success('已更新用户')
  } else {
    message.success('已创建用户')
  }
  dialogOpen.value = false
}

function confirmDelete(user: User) {
  if (!window.confirm('确认删除该用户？')) return
  deleteUser(user.id)
  message.success('已删除')
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <NSpace wrap>
        <NInput
          v-model:value="keyword"
          clearable
          placeholder="搜索姓名 / 邮箱"
          style="width: 220px"
          @update:value="resetFiltersPage"
        />
        <NSelect
          v-model:value="roleFilter"
          :options="roleFilterOptions"
          style="width: 120px"
          @update:value="resetFiltersPage"
        />
        <NSelect
          v-model:value="statusFilter"
          :options="statusFilterOptions"
          style="width: 120px"
          @update:value="resetFiltersPage"
        />
      </NSpace>
      <NButton type="primary" @click="openCreate">新建用户</NButton>
    </div>

    <NDataTable
      remote
      :columns="columns"
      :data="pageUsers"
      :row-key="(row: User) => row.id"
      :checked-row-keys="selectedIds"
      :pagination="false"
      @update:checked-row-keys="(keys) => (selectedIds = keys as string[])"
      @update:sorter="
        (sorter) => {
          const s = Array.isArray(sorter) ? sorter[0] : sorter
          if (s && s.columnKey === 'hireDate') setHireDateSortFromOrder(s.order)
        }
      "
    />

    <div class="flex justify-end">
      <NPagination v-model:page="page" :page-size="pageSize" :item-count="total">
        <template #prefix="{ itemCount }">共 {{ itemCount }} 条</template>
      </NPagination>
    </div>

    <NModal
      v-model:show="dialogOpen"
      preset="dialog"
      :title="editing ? '编辑用户' : '新建用户'"
      positive-text="提交"
      negative-text="取消"
      @positive-click="
        () =>
          submit().then(
            () => true,
            () => false,
          )
      "
    >
      <NForm ref="formRef" :model="form" :rules="rules" label-placement="top">
        <NFormItem label="姓名" path="name">
          <NInput v-model:value="form.name" placeholder="请输入姓名" />
        </NFormItem>
        <NFormItem label="邮箱" path="email">
          <NInput v-model:value="form.email" placeholder="name@example.com" />
        </NFormItem>
        <NFormItem label="角色" path="role">
          <NSelect v-model:value="form.role" :options="roleFormOptions" />
        </NFormItem>
        <NFormItem label="状态" path="status">
          <NSwitch
            :value="form.status === 'active'"
            @update:value="(v: boolean) => (form.status = v ? 'active' : 'disabled')"
          >
            <template #checked>启用</template>
            <template #unchecked>禁用</template>
          </NSwitch>
        </NFormItem>
        <NFormItem label="入职日期" path="hireDate">
          <NDatePicker
            v-model:value="form.hireDate"
            type="date"
            value-format="yyyy-MM-dd"
            style="width: 100%"
          />
        </NFormItem>
        <NFormItem label="备注" path="remark">
          <NInput v-model:value="form.remark" type="textarea" :rows="3" placeholder="可选" />
        </NFormItem>
      </NForm>
    </NModal>
  </div>
</template>
