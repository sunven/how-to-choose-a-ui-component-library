<script setup lang="ts">
import { onUnmounted, reactive, ref } from 'vue'
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

const {
  keyword,
  roleFilter,
  statusFilter,
  hireDateSort,
  page,
  pageSize,
  total,
  pageUsers,
  resetFiltersPage,
  onSelectionChange,
  setHireDateSort,
  createUser,
  updateUser,
  deleteUser,
} = useShowcaseUsers()

onUnmounted(() => ElMessage.closeAll())

const dialogOpen = ref(false)
const editing = ref<User | null>(null)
const formRef = ref<FormInstance>()
const form = reactive<UserInput>(emptyUserInput())
const canonicalErrors = reactive<UserFormErrors>({})

const rules: FormRules<UserInput> = Object.fromEntries(
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
) as FormRules<UserInput>

function setCanonicalErrors(errors: UserFormErrors) {
  for (const key of Object.keys(canonicalErrors)) {
    delete canonicalErrors[key as keyof UserFormErrors]
  }
  Object.assign(canonicalErrors, errors)
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
  try {
    await formRef.value.validate()
  } catch {
    return
  }
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
    setCanonicalErrors(result.errors)
    return
  }

  setCanonicalErrors({})
  if (editing.value) {
    ElMessage.success('已更新用户')
  } else {
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
    deleteUser(user.id)
    ElMessage.success('已删除')
  } catch {
    /* cancelled */
  }
}

function onSortChange(payload: { prop: string; order: string | null }) {
  if (payload.prop !== 'hireDate') return
  if (payload.order === 'ascending') setHireDateSort('asc')
  else if (payload.order === 'descending') setHireDateSort('desc')
  else setHireDateSort('none')
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
          :placeholder="SHOWCASE_FILTERS.keywordPlaceholder"
          style="width: 220px"
          @update:model-value="resetFiltersPage"
        />
        <ElSelect
          v-model="roleFilter"
          style="width: 120px"
          @change="resetFiltersPage"
        >
          <ElOption
            v-for="option in SHOWCASE_FILTER_OPTIONS.role"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </ElSelect>
        <ElSelect
          v-model="statusFilter"
          style="width: 120px"
          @change="resetFiltersPage"
        >
          <ElOption
            v-for="option in SHOWCASE_FILTER_OPTIONS.status"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
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
      <ElTableColumn type="selection" width="48" reserve-selection />
      <ElTableColumn
        v-for="column in USER_TABLE_COLUMNS"
        :key="column.key"
        :prop="column.key"
        :label="column.label"
        :min-width="column.key === 'email' ? 180 : 100"
        :width="
          column.key === 'role' || column.key === 'status'
            ? 100
            : column.key === 'hireDate'
              ? 140
              : undefined
        "
        :sortable="column.sortable ? 'custom' : false"
        :sort-orders="
          column.sortable ? ['ascending', 'descending', null] : undefined
        "
        :sort-order="column.sortable ? sortOrders[hireDateSort] : undefined"
      >
        <template #default="{ row }">
          <ElTag
            v-if="column.key === 'status'"
            :type="row.status === 'active' ? 'success' : 'info'"
            size="small"
          >
            {{ STATUS_LABELS[row.status] }}
          </ElTag>
          <template v-else-if="column.key === 'role'">
            {{ ROLE_LABELS[row.role] }}
          </template>
          <template v-else>{{ row[column.key] }}</template>
        </template>
      </ElTableColumn>
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
        <ElFormItem
          v-for="field in USER_FORM_FIELDS"
          :key="field.key"
          :label="field.label"
          :prop="field.key"
          :error="canonicalErrors[field.key]"
        >
          <ElSwitch
            v-if="field.key === 'status'"
            :model-value="form.status === 'active'"
            :active-text="STATUS_LABELS.active"
            :inactive-text="STATUS_LABELS.disabled"
            @update:model-value="
              (value: boolean) =>
                (form.status = value ? 'active' : 'disabled')
            "
          />
          <ElSelect
            v-else-if="field.control === 'select'"
            v-model="form[field.key]"
            class="w-full"
          >
            <ElOption
              v-for="option in field.options ?? []"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </ElSelect>
          <ElDatePicker
            v-else-if="field.control === 'date'"
            v-model="form.hireDate"
            type="date"
            value-format="YYYY-MM-DD"
            :placeholder="field.placeholder"
            class="w-full"
            style="width: 100%"
          />
          <ElInput
            v-else-if="field.control === 'textarea'"
            v-model="form.remark"
            type="textarea"
            :rows="3"
            :placeholder="field.placeholder"
          />
          <ElInput
            v-else
            v-model="form[field.key]"
            :placeholder="field.placeholder"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogOpen = false">取消</ElButton>
        <ElButton type="primary" @click="submit">提交</ElButton>
      </template>
    </ElDialog>
  </div>
</template>
