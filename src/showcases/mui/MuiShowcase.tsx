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
  ROLE_LABELS,
  ROLE_OPTIONS,
  STATUS_LABELS,
  emptyUserInput,
  type User,
  type UserInput,
  type UserFormErrors,
} from '@/domain/user'
import { useThemeMode } from '@/domain/useThemeMode'
import type { ShowcaseProps } from '../types'

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
                label="搜索姓名 / 邮箱"
                value={users.filters.keyword}
                onChange={(e) => users.setKeyword(e.target.value)}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>角色</InputLabel>
                <Select
                  label="角色"
                  value={users.filters.role}
                  onChange={(e) => users.setRoleFilter(e.target.value as typeof users.filters.role)}
                >
                  <MenuItem value="all">全部角色</MenuItem>
                  {ROLE_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>状态</InputLabel>
                <Select
                  label="状态"
                  value={users.filters.status}
                  onChange={(e) =>
                    users.setStatusFilter(e.target.value as typeof users.filters.status)
                  }
                >
                  <MenuItem value="all">全部状态</MenuItem>
                  <MenuItem value="active">{STATUS_LABELS.active}</MenuItem>
                  <MenuItem value="disabled">{STATUS_LABELS.disabled}</MenuItem>
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
                  <TableCell>姓名</TableCell>
                  <TableCell>邮箱</TableCell>
                  <TableCell>角色</TableCell>
                  <TableCell>状态</TableCell>
                  <TableCell sortDirection={sortDirection}>
                    <TableSortLabel
                      active={users.hireDateSort !== 'none'}
                      direction={users.hireDateSort === 'desc' ? 'desc' : 'asc'}
                      onClick={users.cycleHireDateSort}
                    >
                      入职日期
                    </TableSortLabel>
                  </TableCell>
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
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{ROLE_LABELS[row.role]}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={STATUS_LABELS[row.status]}
                        color={row.status === 'active' ? 'success' : 'default'}
                        variant={row.status === 'active' ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>{row.hireDate}</TableCell>
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
                    <TableCell colSpan={7} align="center">
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
                <TextField
                  label="姓名"
                  required
                  value={form.name}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
                <TextField
                  label="邮箱"
                  required
                  value={form.email}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
                <FormControl fullWidth>
                  <InputLabel>角色</InputLabel>
                  <Select
                    label="角色"
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserInput['role'] }))}
                  >
                    {ROLE_OPTIONS.map((o) => (
                      <MenuItem key={o.value} value={o.value}>
                        {o.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.status === 'active'}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          status: e.target.checked ? 'active' : 'disabled',
                        }))
                      }
                    />
                  }
                  label={form.status === 'active' ? '启用' : '禁用'}
                />
                <DatePicker
                  label="入职日期"
                  value={form.hireDate ? dayjs(form.hireDate) : null}
                  onChange={(d) =>
                    setForm((f) => ({ ...f, hireDate: d ? d.format('YYYY-MM-DD') : '' }))
                  }
                  slotProps={{ textField: { fullWidth: true } }}
                />
                <TextField
                  label="备注"
                  multiline
                  minRows={3}
                  value={form.remark}
                  onChange={(e) => setForm((f) => ({ ...f, remark: e.target.value }))}
                />
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
