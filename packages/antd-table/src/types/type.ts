import type { SlotsType, VNode } from 'vue'

export const withInstall = <T>(comp: T) => {
  const c = comp as any
  c.install = function (app: App) {
    app.component(c.displayName || c.name, comp)
  }

  return comp as T & Plugin
}

export function omit<T extends object, K extends keyof T>(
  obj: T,
  fields: K[]
): Omit<T, K> {
  // eslint-disable-next-line prefer-object-spread
  const shallowCopy = Object.assign({}, obj)
  for (let i = 0; i < fields.length; i += 1) {
    const key = fields[i]
    delete shallowCopy[key]
  }
  return shallowCopy
}

export type CustomSlotsType<T> = SlotsType<T>

declare type VNodeChildAtom =
  | VNode
  | string
  | number
  | boolean
  | null
  | undefined
  | void

export type VueNode = VNodeChildAtom | VNodeChildAtom[]

export interface TransformCellTextProps {
  text: any
  column: any
  record: any
  index: number
}

export type RequiredMark = boolean | 'optional'

type ValidateMessage = string | (() => string)
export interface ValidateMessages {
  default?: ValidateMessage
  required?: ValidateMessage
  enum?: ValidateMessage
  whitespace?: ValidateMessage
  date?: {
    format?: ValidateMessage
    parse?: ValidateMessage
    invalid?: ValidateMessage
  }
  types?: {
    string?: ValidateMessage
    method?: ValidateMessage
    array?: ValidateMessage
    object?: ValidateMessage
    number?: ValidateMessage
    date?: ValidateMessage
    boolean?: ValidateMessage
    integer?: ValidateMessage
    float?: ValidateMessage
    regexp?: ValidateMessage
    email?: ValidateMessage
    url?: ValidateMessage
    hex?: ValidateMessage
  }
  string?: {
    len?: ValidateMessage
    min?: ValidateMessage
    max?: ValidateMessage
    range?: ValidateMessage
  }
  number?: {
    len?: ValidateMessage
    min?: ValidateMessage
    max?: ValidateMessage
    range?: ValidateMessage
  }
  array?: {
    len?: ValidateMessage
    min?: ValidateMessage
    max?: ValidateMessage
    range?: ValidateMessage
  }
  pattern?: {
    mismatch?: ValidateMessage
  }
}

// EventType
export type FocusEventHandler = (e: FocusEvent) => void
export type MouseEventHandler = (e: MouseEvent) => void
export type KeyboardEventHandler = (e: KeyboardEvent) => void
export type CompositionEventHandler = (e: CompositionEvent) => void
export type ClipboardEventHandler = (e: ClipboardEvent) => void
export type ChangeEventHandler = (e: ChangeEvent) => void
export type WheelEventHandler = (e: WheelEvent) => void
export type ChangeEvent = Event & {
  target: {
    value?: string | undefined
  }
}
export type CheckboxChangeEvent = Event & {
  target: {
    checked?: boolean
  }
}
export type EventHandler = (...args: any[]) => void
