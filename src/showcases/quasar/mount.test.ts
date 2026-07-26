/* @vitest-environment jsdom */

import { afterEach, expect, test, vi } from 'vitest'
import { mountQuasarShowcase } from './mount'

vi.mock('quasar', () => {
  const QuasarStub = { render: () => null }
  const components = {
    QBtn: QuasarStub,
    QCard: QuasarStub,
    QCardActions: QuasarStub,
    QCardSection: QuasarStub,
    QDialog: QuasarStub,
    QInput: QuasarStub,
    QSelect: QuasarStub,
    QTable: QuasarStub,
    QTd: QuasarStub,
    QToggle: QuasarStub,
    QBadge: QuasarStub,
  }

  return {
    ...components,
    Quasar: {
      install(app: { component: (name: string, value: unknown) => void }) {
        for (const [name, value] of Object.entries(components)) {
          app.component(name, value)
        }
      },
    },
    Dark: { set: vi.fn() },
    Notify: {},
    Dialog: {},
    useQuasar: () => ({
      dialog: () => ({ onOk: () => undefined }),
      notify: () => undefined,
    }),
  }
})

afterEach(() => {
  document.body.classList.remove('body--dark', 'body--light')
  document.body.replaceChildren()
})

test('disposer unmounts Quasar and removes its body theme classes', () => {
  const element = document.createElement('div')
  document.body.appendChild(element)

  const dispose = mountQuasarShowcase(element)
  document.body.classList.add('body--dark', 'body--light')

  expect(dispose).toBeTypeOf('function')
  expect(element.childElementCount).toBeGreaterThan(0)
  dispose()

  expect(element.childElementCount).toBe(0)
  expect(document.body.classList.contains('body--dark')).toBe(false)
  expect(document.body.classList.contains('body--light')).toBe(false)
})
