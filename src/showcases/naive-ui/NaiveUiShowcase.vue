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

const rules: FormRules = Object.fromEntries(
  USER_FORM_FIELDS.flatMap((field) => {
    const fieldRules: {
      required?: boolean
      type?: 'email'
      message: string
      trigger: ('blur' | 'input' | 'change')[]
    }[] = []
    if (field.rules.required) {
      fieldRules.push({
        required: true,
        message: field.rules.required,
        trigger:
          field.control === 'select' ? ['change', 'blur'] : ['blur', 'input'],
      })
    }
    if (field.rules.email) {
      fieldRules.push({
        type: 'email',
        message: field.rules.email,
        trigger: ['blur', 'input'],
      })
    }
    return fieldRules.length ? [[field.key, fieldRules] as const] : []
  }),
) as FormRules

const columns = computed<DataTableColumns<User>>(() => {
  const result: DataTableColumns<User> = [{ type: 'selection' }]

  for (const field of USER_TABLE_COLUMNS) {
    if (field.key === 'role') {
      result.push({
        title: field.label,
        key: field.key,
        render: (row: User) => ROLE_LABELS[row.role],
      })
    } else if (field.key === 'status') {
      result.push({
        title: field.label,
        key: field.key,
        render: (row: User) =>
          h(
            NTag,
            {
              type: row.status === 'active' ? 'success' : 'default',
              size: 'small',
              bordered: false,
            },
            { default: () => STATUS_LABELS[row.status] },
          ),
      })
    } else if (field.sortable) {
      result.push({
        title: field.label,
        key: field.key,
        sorter: true,
        sortOrder:
          hireDateSort.value === 'asc'
            ? 'ascend'
            : hireDateSort.value === 'desc'
              ? 'descend'
              : false,
      })
    } else {
      result.push({ title: field.label, key: field.key })
    }
  }

  result.push({
    title: '操作',
    key: 'actions',
    render: (row: User) =>
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
  })

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
          :placeholder="SHOWCASE_FILTERS.keywordPlaceholder"
          style="width: 220px"
          @update:value="resetFiltersPage"
        />
        <NSelect
          v-model:value="roleFilter"
          :options="SHOWCASE_FILTER_OPTIONS.role"
          style="width: 120px"
          @update:value="resetFiltersPage"
        />
        <NSelect
          v-model:value="statusFilter"
          :options="SHOWCASE_FILTER_OPTIONS.status"
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
        <NFormItem
          v-for="field in USER_FORM_FIELDS"
          :key="field.key"
          :label="field.label"
          :path="field.key"
        >
          <NSwitch
            v-if="field.key === 'status'"
            :value="form.status === 'active'"
            @update:value="
              (value: boolean) =>
                (form.status = value ? 'active' : 'disabled')
            "
          >
            <template #checked>{{ STATUS_LABELS.active }}</template>
            <template #unchecked>{{ STATUS_LABELS.disabled }}</template>
          </NSwitch>
          <NSelect
            v-else-if="field.control === 'select'"
            v-model:value="form[field.key]"
            :options="field.options ?? []"
          />
          <NDatePicker
            v-else-if="field.control === 'date'"
            v-model:value="form.hireDate"
            type="date"
            value-format="yyyy-MM-dd"
            :placeholder="field.placeholder"
            style="width: 100%"
          />
          <NInput
            v-else-if="field.control === 'textarea'"
            v-model:value="form.remark"
            type="textarea"
            :rows="3"
            :placeholder="field.placeholder"
          />
          <NInput
            v-else
            v-model:value="form[field.key]"
            :placeholder="field.placeholder"
          />
        </NFormItem>
      </NForm>
    </NModal>
  </div>
</template>
