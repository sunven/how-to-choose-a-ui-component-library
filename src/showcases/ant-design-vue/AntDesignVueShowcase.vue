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

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email' as const, message: '邮箱格式不正确', trigger: 'blur' },
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
}

const columns = computed<TableColumnsType<User>>(() => [
  { title: '姓名', dataIndex: 'name', key: 'name' },
  { title: '邮箱', dataIndex: 'email', key: 'email' },
  { title: '角色', dataIndex: 'role', key: 'role' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  {
    title: '入职日期',
    dataIndex: 'hireDate',
    key: 'hireDate',
    sorter: true,
    sortOrder:
      hireDateSort.value === 'asc'
        ? 'ascend'
        : hireDateSort.value === 'desc'
          ? 'descend'
          : null,
  },
  { title: '操作', key: 'actions' },
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
  if (editing.value) {
    userStore.update(editing.value.id, input)
    message.success('已更新用户')
  } else {
    userStore.create(input)
    page.value = 1
    message.success('已创建用户')
  }
  dialogOpen.value = false
}

function confirmDelete(user: User) {
  userStore.remove(user.id)
  selectedIds.value = selectedIds.value.filter((id) => id !== user.id)
  message.success('已删除')
}

const onTableChange: TableProps['onChange'] = (_pag, _filters, sorter) => {
  const s = Array.isArray(sorter) ? sorter[0] : sorter
  if (s && (s.field === 'hireDate' || s.columnKey === 'hireDate')) {
    setHireDateSortFromOrder(s.order)
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
          placeholder="搜索姓名 / 邮箱"
          style="width: 220px"
          @change="resetFiltersPage"
        />
        <Select
          v-model:value="roleFilter"
          style="width: 120px"
          :options="[
            { value: 'all', label: '全部角色' },
            ...ROLE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
          ]"
          @change="resetFiltersPage"
        />
        <Select
          v-model:value="statusFilter"
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
      size="middle"
      :columns="columns"
      :data-source="pageUsers"
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
        <Form.Item label="姓名" name="name">
          <Input v-model:value="form.name" placeholder="请输入姓名" />
        </Form.Item>
        <Form.Item label="邮箱" name="email">
          <Input v-model:value="form.email" placeholder="name@example.com" />
        </Form.Item>
        <Form.Item label="角色" name="role">
          <Select
            v-model:value="form.role"
            :options="ROLE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))"
          />
        </Form.Item>
        <Form.Item label="状态" name="status">
          <Switch
            :checked="form.status === 'active'"
            checked-children="启用"
            un-checked-children="禁用"
            @change="(c: boolean | string | number) => (form.status = c ? 'active' : 'disabled')"
          />
        </Form.Item>
        <Form.Item label="入职日期" name="hireDate">
          <DatePicker v-model:value="hireDateModel" style="width: 100%" />
        </Form.Item>
        <Form.Item label="备注" name="remark">
          <Input.TextArea v-model:value="form.remark" :rows="3" placeholder="可选" />
        </Form.Item>
      </Form>
    </Modal>
  </div>
</template>
