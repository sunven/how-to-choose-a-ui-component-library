<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  Button,
  DatePicker,
  Form,
  Input,
  Message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  type FormInstance,
  type TableColumnData,
} from '@arco-design/web-vue'
import dayjs from 'dayjs'
import {
  SHOWCASE_FILTERS,
  SHOWCASE_FILTER_OPTIONS,
  USER_FORM_FIELDS,
  USER_TABLE_COLUMNS,
  type UserFieldSpec,
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
import { useShowcaseUsers } from '../vue-shared/useShowcaseUsers'

const FormItem = Form.Item

function fieldRules(field: UserFieldSpec) {
  const rules: { required?: boolean; type?: 'email'; message: string }[] = []
  if (field.rules.required) {
    rules.push({ required: true, message: field.rules.required })
  }
  if (field.rules.email) {
    rules.push({ type: 'email', message: field.rules.email })
  }
  return rules
}

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
const formRef = ref<FormInstance>()
const form = reactive<UserInput>(emptyUserInput())

const columns = computed<TableColumnData[]>(() => {
  const result: TableColumnData[] = []

  for (const field of USER_TABLE_COLUMNS) {
    if (field.key === 'role' || field.key === 'status') {
      result.push({
        title: field.label,
        dataIndex: field.key,
        slotName: field.key,
      })
    } else if (field.sortable) {
      result.push({
        title: field.label,
        dataIndex: field.key,
        sortable: {
          sortDirections: ['ascend', 'descend'],
          sorter: true,
          sortOrder:
            hireDateSort.value === 'asc'
              ? 'ascend'
              : hireDateSort.value === 'desc'
                ? 'descend'
                : '',
        },
      })
    } else {
      result.push({ title: field.label, dataIndex: field.key })
    }
  }

  result.push({ title: '操作', slotName: 'actions' })
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
  const err = await formRef.value?.validate()
  if (err) return
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
    Message.error(Object.values(result.errors).find(Boolean) ?? '请检查表单')
    return
  }

  if (editing.value) {
    Message.success('已更新用户')
  } else {
    Message.success('已创建用户')
  }
  dialogOpen.value = false
}

function confirmDelete(user: User) {
  deleteUser(user.id)
  Message.success('已删除')
}

const hireDateModel = computed({
  get: () => (form.hireDate ? dayjs(form.hireDate) : undefined),
  set: (v: unknown) => {
    form.hireDate = v ? dayjs(v as string | Date).format('YYYY-MM-DD') : ''
  },
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <Space wrap>
        <Input.Search
          v-model="keyword"
          allow-clear
          :placeholder="SHOWCASE_FILTERS.keywordPlaceholder"
          style="width: 220px"
        />
        <Select
          v-model="roleFilter"
          style="width: 120px"
          :options="SHOWCASE_FILTER_OPTIONS.role"
        />
        <Select
          v-model="statusFilter"
          style="width: 120px"
          :options="SHOWCASE_FILTER_OPTIONS.status"
        />
      </Space>
      <Button type="primary" @click="openCreate">新建用户</Button>
    </div>

    <Table
      row-key="id"
      size="medium"
      :columns="columns"
      :data="pageUsers"
      :row-selection="{
        type: 'checkbox',
        selectedRowKeys: selectedIds,
        showCheckedAll: true,
        onChange: (keys: (string | number)[]) => (selectedIds = keys as string[]),
      }"
      :pagination="{
        current: page,
        pageSize,
        total,
        showTotal: true,
        showPageSize: false,
      }"
      @page-change="(p: number) => (page = p)"
      @sorter-change="
        (dataIndex: string, direction: string) => {
          if (dataIndex === 'hireDate')
            setHireDateSort(
              direction === 'ascend'
                ? 'asc'
                : direction === 'descend'
                  ? 'desc'
                  : 'none',
            )
        }
      "
    >
      <template #role="{ record }">
        {{ ROLE_LABELS[record.role as UserRole] }}
      </template>
      <template #status="{ record }">
        <Tag :color="record.status === 'active' ? 'green' : 'gray'">
          {{ STATUS_LABELS[record.status as UserStatus] }}
        </Tag>
      </template>
      <template #actions="{ record }">
        <Space>
          <Button type="text" size="small" @click="openEdit(record as User)">编辑</Button>
          <Popconfirm
            content="确认删除该用户？"
            ok-text="删除"
            cancel-text="取消"
            @ok="confirmDelete(record as User)"
          >
            <Button type="text" size="small" status="danger">删除</Button>
          </Popconfirm>
        </Space>
      </template>
    </Table>

    <Modal
      v-model:visible="dialogOpen"
      :title="editing ? '编辑用户' : '新建用户'"
      ok-text="提交"
      cancel-text="取消"
      unmount-on-close
      @ok="
        () =>
          submit().then(
            () => true,
            () => false,
          )
      "
    >
      <Form ref="formRef" :model="form" layout="vertical" auto-label-width>
        <FormItem
          v-for="field in USER_FORM_FIELDS"
          :key="field.key"
          :field="field.key"
          :label="field.label"
          :rules="fieldRules(field)"
        >
          <Switch
            v-if="field.key === 'status'"
            :model-value="form.status === 'active'"
            :checked-text="STATUS_LABELS.active"
            :unchecked-text="STATUS_LABELS.disabled"
            @change="
              (value: string | number | boolean) =>
                (form.status = value ? 'active' : 'disabled')
            "
          />
          <Select
            v-else-if="field.control === 'select'"
            v-model="form[field.key]"
            :options="field.options?.map((option) => ({ value: option.value, label: option.label }))"
          />
          <DatePicker
            v-else-if="field.control === 'date'"
            v-model="hireDateModel"
            :placeholder="field.placeholder"
            style="width: 100%"
          />
          <Input.TextArea
            v-else-if="field.control === 'textarea'"
            v-model="form.remark"
            :auto-size="{ minRows: 3 }"
            :placeholder="field.placeholder"
          />
          <Input
            v-else
            v-model="form[field.key]"
            :placeholder="field.placeholder"
          />
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>
