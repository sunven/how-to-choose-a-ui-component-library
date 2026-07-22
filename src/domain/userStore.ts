import { SEED_USERS, type User, type UserInput } from './user'

type Listener = () => void

let users: User[] = SEED_USERS.map((u) => ({ ...u }))
const listeners = new Set<Listener>()

function emit() {
  for (const listener of listeners) listener()
}

function createId() {
  return `u_${Math.random().toString(36).slice(2, 10)}`
}

/** Framework-agnostic in-memory User list shared by React showcases and Vue islands. */
export const userStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  getSnapshot(): User[] {
    return users
  },

  create(input: UserInput): User {
    const user: User = { ...input, id: createId() }
    users = [user, ...users]
    emit()
    return user
  },

  update(id: string, input: UserInput): void {
    users = users.map((u) => (u.id === id ? { ...input, id } : u))
    emit()
  },

  remove(id: string): void {
    users = users.filter((u) => u.id !== id)
    emit()
  },
}
