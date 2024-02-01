import { isVNode, Fragment, Comment } from 'vue'

export function call<T extends any[]>(func: Function, ...args: T): void {
  return func(...args)
}

export function isValidElement(element) {
  return (
    element &&
    typeof element === 'object' &&
    'componentOptions' in element &&
    'context' in element &&
    element.tag !== undefined
  ) // remove text node
}

export function isEmptyElement(c) {
  return (
    c &&
    (c.type === Comment ||
      (c.type === Fragment && c.children.length === 0) ||
      (c.type === Text && c.children.trim() === ''))
  )
}

const isValid = (value: any): boolean => {
  return value !== undefined && value !== null && value !== ''
}

export const flattenChildren = (children = [], filterEmpty = true) => {
  const temp = Array.isArray(children) ? children : [children]
  const res = []
  temp.forEach(child => {
    if (Array.isArray(child)) {
      res.push(...flattenChildren(child, filterEmpty))
    } else if (child && child.type === Fragment) {
      res.push(...flattenChildren(child.children, filterEmpty))
    } else if (child && isVNode(child)) {
      if (filterEmpty && !isEmptyElement(child)) {
        res.push(child)
      } else if (!filterEmpty) {
        res.push(child)
      }
    } else if (isValid(child)) {
      res.push(child)
    }
  })
  return res
}

export const getComponent = (
  instance,
  prop = 'default',
  options = instance,
  execute = true
) => {
  let com = undefined
  if (instance.$) {
    const temp = instance[prop]
    if (temp !== undefined) {
      return typeof temp === 'function' && execute ? temp(options) : temp
    } else {
      com = instance.$slots[prop]
      com = execute && com ? com(options) : com
    }
  } else if (isVNode(instance)) {
    const temp = instance.props && instance.props[prop]
    if (temp !== undefined && instance.props !== null) {
      return typeof temp === 'function' && execute ? temp(options) : temp
    } else if (instance.type === Fragment) {
      com = instance.children
    } else if (instance.children && instance.children[prop]) {
      com = instance.children[prop]
      com = execute && com ? com(options) : com
    }
  }
  if (Array.isArray(com)) {
    com = flattenChildren(com)
    com = com.length === 1 ? com[0] : com
    com = com.length === 0 ? undefined : com
  }
  return com
}

export const getSlot = (self, name = 'default', options = {}) => {
  if (isVNode(self)) {
    if (self.type === Fragment) {
      return name === 'default' ? flattenChildren(self.children) : []
    } else if (self.children && self.children[name]) {
      return flattenChildren(self.children[name](options))
    } else {
      return []
    }
  } else {
    const res = self.$slots[name] && self.$slots[name](options)
    return flattenChildren(res)
  }
}
