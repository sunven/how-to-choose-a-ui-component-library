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

const FormItem = Form.Item

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
const formRef = ref<FormInstance>()
const form = reactive<UserInput>(emptyUserInput())

const columns = computed<TableColumnData[]>(() => [
  { title: '姓名', dataIndex: 'name' },
  { title: '邮箱', dataIndex: 'email' },
  {
    title: '角色',
    dataIndex: 'role',
    slotName: 'role',
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
  },
  {
    title: '入职日期',
    dataIndex: 'hireDate',
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
  },
  {
    title: '操作',
    slotName: 'actions',
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
  if (editing.value) {
    userStore.update(editing.value.id, input)
    Message.success('已更新用户')
  } else {
    userStore.create(input)
    page.value = 1
    Message.success('已创建用户')
  }
  dialogOpen.value = false
}

function confirmDelete(user: User) {
  userStore.remove(user.id)
  selectedIds.value = selectedIds.value.filter((id) => id !== user.id)
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
          placeholder="搜索姓名 / 邮箱"
          style="width: 220px"
          @input="resetFiltersPage"
          @clear="resetFiltersPage"
        />
        <Select
          v-model="roleFilter"
          style="width: 120px"
          :options="[
            { value: 'all', label: '全部角色' },
            ...ROLE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
          ]"
          @change="resetFiltersPage"
        />
        <Select
          v-model="statusFilter"
          style="width: 120px"
          :options="[
            { value: 'all', label: '全部状态' },
            { value: 'active', label: STATUS_LABELS.active },
            { value: 'disabled', label: STATUS_LABELS.disabled },
          ]"
          @change="resetFiltersPage"
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
          if (dataIndex === 'hireDate') setHireDateSortFromOrder(direction || null)
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
          field="name"
          label="姓名"
          :rules="[{ required: true, message: '请输入姓名' }]"
        >
          <Input v-model="form.name" placeholder="请输入姓名" />
        </FormItem>
        <FormItem
          field="email"
          label="邮箱"
          :rules="[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '邮箱格式不正确' },
          ]"
        >
          <Input v-model="form.email" placeholder="name@example.com" />
        </FormItem>
        <FormItem
          field="role"
          label="角色"
          :rules="[{ required: true, message: '请选择角色' }]"
        >
          <Select
            v-model="form.role"
            :options="ROLE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))"
          />
        </FormItem>
        <FormItem field="status" label="状态">
          <Switch
            :model-value="form.status === 'active'"
            checked-text="启用"
            unchecked-text="禁用"
            @change="(v: string | number | boolean) => (form.status = v ? 'active' : 'disabled')"
          />
        </FormItem>
        <FormItem field="hireDate" label="入职日期">
          <DatePicker v-model="hireDateModel" style="width: 100%" />
        </FormItem>
        <FormItem field="remark" label="备注">
          <Input.TextArea v-model="form.remark" :auto-size="{ minRows: 3 }" placeholder="可选" />
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>
