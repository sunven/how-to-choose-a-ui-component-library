import { useMemo, useState } from 'react'
import {
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  ThemeProvider,
  createTheme,
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import {
  SHOWCASE_FILTERS,
  SHOWCASE_FILTER_OPTIONS,
  USER_FIELD_BY_KEY,
  USER_FORM_FIELDS,
  USER_TABLE_COLUMNS,
  withUserFieldValue,
  type UserFieldKey,
} from '@/domain/showcaseSpec'
import {
  ROLE_LABELS,
  STATUS_LABELS,
  emptyUserInput,
  type User,
  type UserInput,
  type UserFormErrors,
} from '@/domain/user'
import { useThemeMode } from '@/domain/useThemeMode'
import type { ShowcaseProps } from '../types'

function renderCell(user: User, key: UserFieldKey) {
  switch (key) {
    case 'role':
      return ROLE_LABELS[user.role]
    case 'status':
      return (
        <Chip
          size="small"
          label={STATUS_LABELS[user.status]}
          color={user.status === 'active' ? 'success' : 'default'}
          variant={user.status === 'active' ? 'filled' : 'outlined'}
        />
      )
    default:
      return user[key]
  }
}

export function MuiShowcase({ users }: ShowcaseProps) {
  const mode = useThemeMode()
  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode },
        typography: { fontFamily: 'inherit' },
      }),
    [mode],
  )
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState<UserInput>(emptyUserInput())
  const [errors, setErrors] = useState<UserFormErrors>({})

  const openCreate = () => {
    setEditing(null)
    setForm(emptyUserInput())
    setErrors({})
    setOpen(true)
  }

  const openEdit = (user: User) => {
    setEditing(user)
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      hireDate: user.hireDate,
      remark: user.remark,
    })
    setErrors({})
    setOpen(true)
  }

  const submit = () => {
    const input: UserInput = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      remark: form.remark.trim(),
    }
    const result = editing
      ? users.updateUser(editing.id, input)
      : users.createUser(input)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    setErrors({})
    setOpen(false)
  }

  const allPageSelected =
    users.users.length > 0 && users.users.every((u) => users.selectedIds.includes(u.id))
  const somePageSelected = users.users.some((u) => users.selectedIds.includes(u.id))

  const sortDirection = useMemo(() => {
    if (users.hireDateSort === 'asc') return 'asc' as const
    if (users.hireDateSort === 'desc') return 'desc' as const
    return false as const
  }, [users.hireDateSort])

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-cn">
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between">
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap" useFlexGap>
              <TextField
                size="small"
                label={SHOWCASE_FILTERS.keywordPlaceholder}
                value={users.filters.keyword}
                onChange={(e) => users.setKeyword(e.target.value)}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>{USER_FIELD_BY_KEY.role.label}</InputLabel>
                <Select
                  label={USER_FIELD_BY_KEY.role.label}
                  value={users.filters.role}
                  onChange={(e) => users.setRoleFilter(e.target.value as typeof users.filters.role)}
                >
                  {SHOWCASE_FILTER_OPTIONS.role.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>{USER_FIELD_BY_KEY.status.label}</InputLabel>
                <Select
                  label={USER_FIELD_BY_KEY.status.label}
                  value={users.filters.status}
                  onChange={(e) =>
                    users.setStatusFilter(e.target.value as typeof users.filters.status)
                  }
                >
                  {SHOWCASE_FILTER_OPTIONS.status.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <Button variant="contained" onClick={openCreate}>
              新建用户
            </Button>
          </Stack>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={somePageSelected && !allPageSelected}
                      checked={allPageSelected}
                      onChange={(e) => users.toggleSelectAllPage(e.target.checked)}
                    />
                  </TableCell>
                  {USER_TABLE_COLUMNS.map((field) =>
                    field.sortable ? (
                      <TableCell key={field.key} sortDirection={sortDirection}>
                        <TableSortLabel
                          active={users.hireDateSort !== 'none'}
                          direction={users.hireDateSort === 'desc' ? 'desc' : 'asc'}
                          onClick={users.cycleHireDateSort}
                        >
                          {field.label}
                        </TableSortLabel>
                      </TableCell>
                    ) : (
                      <TableCell key={field.key}>{field.label}</TableCell>
                    ),
                  )}
                  <TableCell align="right">操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.users.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={users.selectedIds.includes(row.id)}
                        onChange={(e) => users.toggleSelect(row.id, e.target.checked)}
                      />
                    </TableCell>
                    {USER_TABLE_COLUMNS.map((field) => (
                      <TableCell key={field.key}>
                        {renderCell(row, field.key)}
                      </TableCell>
                    ))}
                    <TableCell align="right">
                      <Button size="small" onClick={() => openEdit(row)}>
                        编辑
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => {
                          if (window.confirm('确认删除该用户？')) users.deleteUser(row.id)
                        }}
                      >
                        删除
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {users.users.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={USER_TABLE_COLUMNS.length + 2}
                      align="center"
                    >
                      暂无数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={users.total}
            page={users.page - 1}
            onPageChange={(_, p) => users.setPage(p + 1)}
            rowsPerPage={users.pageSize}
            rowsPerPageOptions={[users.pageSize]}
            labelRowsPerPage="每页"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 共 ${count} 条`}
          />

          <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>{editing ? '编辑用户' : '新建用户'}</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                {USER_FORM_FIELDS.map((field) => {
                  if (field.key === 'role') {
                    return (
                      <FormControl
                        key={field.key}
                        fullWidth
                        required={Boolean(field.rules.required)}
                        error={Boolean(errors.role)}
                      >
                        <InputLabel>{field.label}</InputLabel>
                        <Select
                          label={field.label}
                          value={form.role}
                          onChange={(e) =>
                            setForm((current) =>
                              withUserFieldValue(current, 'role', e.target.value),
                            )
                          }
                        >
                          {field.options?.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.role && (
                          <FormHelperText>{errors.role}</FormHelperText>
                        )}
                      </FormControl>
                    )
                  }

                  if (field.key === 'status') {
                    return (
                      <FormControl
                        key={field.key}
                        error={Boolean(errors.status)}
                      >
                        <FormControlLabel
                          control={
                            <Switch
                              checked={form.status === 'active'}
                              onChange={(e) =>
                                setForm((current) =>
                                  withUserFieldValue(
                                    current,
                                    'status',
                                    e.target.checked ? 'active' : 'disabled',
                                  ),
                                )
                              }
                            />
                          }
                          label={`${field.label}${field.rules.required ? ' *' : ''}：${STATUS_LABELS[form.status]}`}
                        />
                        {errors.status && (
                          <FormHelperText>{errors.status}</FormHelperText>
                        )}
                      </FormControl>
                    )
                  }

                  if (field.key === 'hireDate') {
                    return (
                      <DatePicker
                        key={field.key}
                        label={field.label}
                        value={form.hireDate ? dayjs(form.hireDate) : null}
                        onChange={(value) =>
                          setForm((current) =>
                            withUserFieldValue(
                              current,
                              'hireDate',
                              value ? value.format('YYYY-MM-DD') : '',
                            ),
                          )
                        }
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    )
                  }

                  return (
                    <TextField
                      key={field.key}
                      label={field.label}
                      required={Boolean(field.rules.required)}
                      type={field.control === 'email' ? 'email' : 'text'}
                      multiline={field.control === 'textarea'}
                      minRows={field.control === 'textarea' ? 3 : undefined}
                      placeholder={field.placeholder}
                      value={form[field.key]}
                      error={Boolean(errors[field.key])}
                      helperText={errors[field.key]}
                      onChange={(e) =>
                        setForm((current) =>
                          withUserFieldValue(
                            current,
                            field.key,
                            e.target.value,
                          ),
                        )
                      }
                    />
                  )
                })}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)}>取消</Button>
              <Button variant="contained" onClick={submit}>
                提交
              </Button>
            </DialogActions>
          </Dialog>
        </Stack>
      </LocalizationProvider>
    </ThemeProvider>
  )
}
