<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  CheckboxIndicator,
  CheckboxRoot,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  SwitchRoot,
  SwitchThumb,
} from 'reka-ui'
import {
  ROLE_LABELS,
  ROLE_OPTIONS,
  STATUS_LABELS,
  emptyUserInput,
  type User,
  type UserFormErrors,
  type UserInput,
  type UserRole,
  type UserStatus,
} from '@/domain/user'
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
  pageUsers,
  resetFiltersPage,
  cycleHireDateSort,
  toggleSelect: setUserSelected,
  toggleSelectAllPage: setPageSelected,
  createUser,
  updateUser,
  deleteUser,
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

function toggleSelect(id: string, checked: boolean | 'indeterminate') {
  setUserSelected(id, checked === true)
}

function toggleSelectAllPage(checked: boolean | 'indeterminate') {
  setPageSelected(checked === true)
}
</script>

<template>
  <div class="reka-showcase space-y-4">
    <div class="reka-banner">
      观感为 <strong>Documented Example Skin</strong>（复刻官网文档示例样式），非 Reka npm
      默认主题。Reka 本身为 unstyled 原语。
    </div>

    <div class="reka-toolbar">
      <div class="reka-toolbar-filters">
        <input
          v-model="keyword"
          class="reka-input reka-input--search"
          placeholder="搜索姓名 / 邮箱"
          @input="resetFiltersPage"
        />
        <select
          v-model="roleFilter"
          class="reka-select reka-select--filter"
          @change="resetFiltersPage"
        >
          <option v-for="o in roleFilterOptions" :key="o.value" :value="o.value">
            {{ o.label }}
          </option>
        </select>
        <select
          v-model="statusFilter"
          class="reka-select reka-select--filter"
          @change="resetFiltersPage"
        >
          <option v-for="o in statusFilterOptions" :key="o.value" :value="o.value">
            {{ o.label }}
          </option>
        </select>
        <button type="button" class="reka-btn reka-btn--outline" @click="cycleHireDateSort">
          入职排序：
          {{ hireDateSort === 'none' ? '默认' : hireDateSort === 'asc' ? '升序' : '降序' }}
        </button>
      </div>
      <button type="button" class="reka-btn" @click="openCreate">新建用户</button>
    </div>

    <div class="reka-table-wrap">
      <table class="reka-table">
        <thead>
          <tr>
            <th style="width: 2.5rem">
              <CheckboxRoot
                class="reka-checkbox"
                :checked="allPageSelected"
                aria-label="全选本页"
                @update:checked="toggleSelectAllPage"
              >
                <CheckboxIndicator>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                  </svg>
                </CheckboxIndicator>
              </CheckboxRoot>
            </th>
            <th>姓名</th>
            <th>邮箱</th>
            <th>角色</th>
            <th>状态</th>
            <th>入职日期</th>
            <th style="text-align: right">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in pageUsers" :key="row.id">
            <td>
              <CheckboxRoot
                class="reka-checkbox"
                :checked="selectedIds.includes(row.id)"
                :aria-label="`选择 ${row.name}`"
                @update:checked="(c) => toggleSelect(row.id, c)"
              >
                <CheckboxIndicator>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                  </svg>
                </CheckboxIndicator>
              </CheckboxRoot>
            </td>
            <td>{{ row.name }}</td>
            <td style="color: var(--reka-muted-fg)">{{ row.email }}</td>
            <td>{{ ROLE_LABELS[row.role as UserRole] }}</td>
            <td>
              <span
                class="reka-badge"
                :class="row.status === 'active' ? 'reka-badge--ok' : ''"
              >
                {{ STATUS_LABELS[row.status as UserStatus] }}
              </span>
            </td>
            <td>{{ row.hireDate }}</td>
            <td style="text-align: right">
              <button type="button" class="reka-btn reka-btn--ghost reka-btn--sm" @click="openEdit(row)">
                编辑
              </button>
              <button
                type="button"
                class="reka-btn reka-btn--danger reka-btn--sm"
                @click="confirmDelete(row)"
              >
                删除
              </button>
            </td>
          </tr>
          <tr v-if="pageUsers.length === 0">
            <td colspan="7" style="text-align: center; padding: 2rem; color: var(--reka-muted-fg)">
              暂无数据
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      class="flex items-center justify-between text-sm"
      style="color: var(--reka-muted-fg)"
    >
      <span>共 {{ total }} 条 · 第 {{ page }} / {{ pageCount }} 页</span>
      <div class="flex gap-2">
        <button
          type="button"
          class="reka-btn reka-btn--outline reka-btn--sm"
          :disabled="page <= 1"
          @click="page = page - 1"
        >
          上一页
        </button>
        <button
          type="button"
          class="reka-btn reka-btn--outline reka-btn--sm"
          :disabled="page >= pageCount"
          @click="page = page + 1"
        >
          下一页
        </button>
      </div>
    </div>

    <DialogRoot :open="dialogOpen" @update:open="(v) => (dialogOpen = v)">
      <DialogPortal>
        <DialogOverlay class="reka-overlay" />
        <DialogContent class="reka-dialog" aria-describedby="undefined">
          <DialogTitle class="reka-dialog-title">
            {{ editing ? '编辑用户' : '新建用户' }}
          </DialogTitle>
          <div class="reka-field">
            <label class="reka-label" for="reka-name">姓名</label>
            <input id="reka-name" v-model="form.name" class="reka-input" />
            <p v-if="errors.name" class="reka-error">{{ errors.name }}</p>
          </div>
          <div class="reka-field">
            <label class="reka-label" for="reka-email">邮箱</label>
            <input id="reka-email" v-model="form.email" class="reka-input" />
            <p v-if="errors.email" class="reka-error">{{ errors.email }}</p>
          </div>
          <div class="reka-field">
            <label class="reka-label" for="reka-role">角色</label>
            <select id="reka-role" v-model="form.role" class="reka-select">
              <option v-for="o in roleFormOptions" :key="o.value" :value="o.value">
                {{ o.label }}
              </option>
            </select>
          </div>
          <div
            class="reka-field"
            style="
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: space-between;
              border: 1px solid var(--reka-border);
              border-radius: 0.375rem;
              padding: 0.5rem 0.75rem;
            "
          >
            <label class="reka-label" for="reka-status">状态（启用）</label>
            <SwitchRoot
              id="reka-status"
              class="reka-switch"
              :checked="form.status === 'active'"
              @update:checked="(c) => (form.status = c ? 'active' : 'disabled')"
            >
              <SwitchThumb class="reka-switch-thumb" />
            </SwitchRoot>
          </div>
          <div class="reka-field">
            <label class="reka-label" for="reka-hire">入职日期</label>
            <input id="reka-hire" v-model="form.hireDate" type="date" class="reka-input" />
          </div>
          <div class="reka-field">
            <label class="reka-label" for="reka-remark">备注</label>
            <textarea id="reka-remark" v-model="form.remark" class="reka-textarea" rows="3" />
          </div>
          <div class="flex justify-end gap-2" style="margin-top: 0.5rem">
            <button type="button" class="reka-btn reka-btn--outline" @click="dialogOpen = false">
              取消
            </button>
            <button type="button" class="reka-btn" @click="submit">提交</button>
          </div>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </div>
</template>
