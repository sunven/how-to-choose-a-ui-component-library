<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  message,
  type FormInstance,
  type TableColumnsType,
  type TableProps,
} from 'ant-design-vue'
import dayjs, { type Dayjs } from 'dayjs'
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
  type UserInput,
  type UserRole,
  type UserStatus,
} from '@/domain/user'
import type { HireDateSort } from '@/domain/showcaseScenario'
import { useShowcaseUsers } from '../vue-shared/useShowcaseUsers'

const {
  keyword,
  roleFilter,
  statusFilter,
  hireDateSort,
  page,
  pageSize,
  selectedIds,
  total,
  users,
  setHireDateSort,
  createUser,
  updateUser,
  deleteUser,
} = useShowcaseUsers()

const dialogOpen = ref(false)
const editing = ref<User | null>(null)
const formRef = ref<FormInstance>()
const form = reactive<UserInput>(emptyUserInput())

const rules = Object.fromEntries(
  USER_FORM_FIELDS.flatMap((field) => {
    const fieldRules: {
      required?: boolean
      type?: 'email'
      message: string
      trigger: 'blur' | 'change'
    }[] = []
    if (field.rules.required) {
      fieldRules.push({
        required: true,
        message: field.rules.required,
        trigger: field.control === 'select' ? 'change' : 'blur',
      })
    }
    if (field.rules.email) {
      fieldRules.push({
        type: 'email',
        message: field.rules.email,
        trigger: 'blur',
      })
    }
    return fieldRules.length ? [[field.key, fieldRules] as const] : []
  }),
)

const columns = computed<TableColumnsType<User>>(() => {
  const result: TableColumnsType<User> = []

  for (const field of USER_TABLE_COLUMNS) {
    if (field.sortable) {
      result.push({
        title: field.label,
        dataIndex: field.key,
        key: field.key,
        sorter: true,
        sortOrder:
          hireDateSort.value === 'asc'
            ? 'ascend'
            : hireDateSort.value === 'desc'
              ? 'descend'
              : null,
      })
    } else {
      result.push({
        title: field.label,
        dataIndex: field.key,
        key: field.key,
      })
    }
  }

  result.push({ title: '操作', key: 'actions' })
  return result
})

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
  deleteUser(user.id)
  message.success('已删除')
}

function toHireDateSort(
  order: string | null | undefined,
): HireDateSort {
  return order === 'ascend' ? 'asc' : order === 'descend' ? 'desc' : 'none'
}

const onTableChange: TableProps['onChange'] = (_pag, _filters, sorter) => {
  const s = Array.isArray(sorter) ? sorter[0] : sorter
  if (s && (s.field === 'hireDate' || s.columnKey === 'hireDate')) {
    setHireDateSort(toHireDateSort(s.order))
  }
}

const hireDateModel = computed({
  get: () => (form.hireDate ? dayjs(form.hireDate) : undefined),
  set: (v: Dayjs | undefined | null) => {
    form.hireDate = v ? v.format('YYYY-MM-DD') : ''
  },
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <Space wrap>
        <Input.Search
          v-model:value="keyword"
          allow-clear
          :placeholder="SHOWCASE_FILTERS.keywordPlaceholder"
          style="width: 220px"
        />
        <Select
          v-model:value="roleFilter"
          style="width: 120px"
          :options="SHOWCASE_FILTER_OPTIONS.role"
        />
        <Select
          v-model:value="statusFilter"
          style="width: 120px"
          :options="SHOWCASE_FILTER_OPTIONS.status"
        />
      </Space>
      <Button type="primary" @click="openCreate">新建用户</Button>
    </div>

    <Table
      row-key="id"
      size="middle"
      :columns="columns"
      :data-source="users"
      :row-selection="{
        selectedRowKeys: selectedIds,
        onChange: (keys) => (selectedIds = keys as string[]),
      }"
      :pagination="{
        current: page,
        pageSize,
        total,
        showSizeChanger: false,
        showTotal: (t: number) => `共 ${t} 条`,
        onChange: (p: number) => (page = p),
      }"
      @change="onTableChange"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.key === 'role'">
          {{ ROLE_LABELS[text as UserRole] }}
        </template>
        <template v-else-if="column.key === 'status'">
          <Tag :color="text === 'active' ? 'success' : 'default'">
            {{ STATUS_LABELS[text as UserStatus] }}
          </Tag>
        </template>
        <template v-else-if="column.key === 'actions'">
          <Space>
            <Button type="link" size="small" @click="openEdit(record as User)">编辑</Button>
            <Popconfirm
              title="确认删除该用户？"
              ok-text="删除"
              cancel-text="取消"
              @confirm="confirmDelete(record as User)"
            >
              <Button type="link" size="small" danger>删除</Button>
            </Popconfirm>
          </Space>
        </template>
      </template>
    </Table>

    <Modal
      v-model:open="dialogOpen"
      :title="editing ? '编辑用户' : '新建用户'"
      ok-text="提交"
      cancel-text="取消"
      destroy-on-close
      @ok="
        (e: MouseEvent) => {
          e.preventDefault()
          return submit().then(
            () => true,
            () => false,
          )
        }
      "
    >
      <Form ref="formRef" :model="form" :rules="rules" layout="vertical" class="mt-2">
        <Form.Item
          v-for="field in USER_FORM_FIELDS"
          :key="field.key"
          :label="field.label"
          :name="field.key"
        >
          <Switch
            v-if="field.key === 'status'"
            :checked="form.status === 'active'"
            :checked-children="STATUS_LABELS.active"
            :un-checked-children="STATUS_LABELS.disabled"
            @change="
              (value: boolean | string | number) =>
                (form.status = value ? 'active' : 'disabled')
            "
          />
          <Select
            v-else-if="field.control === 'select'"
            v-model:value="form[field.key]"
            :options="field.options?.map((option) => ({ value: option.value, label: option.label }))"
          />
          <DatePicker
            v-else-if="field.control === 'date'"
            v-model:value="hireDateModel"
            :placeholder="field.placeholder"
            style="width: 100%"
          />
          <Input.TextArea
            v-else-if="field.control === 'textarea'"
            v-model:value="form.remark"
            :rows="3"
            :placeholder="field.placeholder"
          />
          <Input
            v-else
            v-model:value="form[field.key]"
            :placeholder="field.placeholder"
          />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>
