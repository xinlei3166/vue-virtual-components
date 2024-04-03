// @ts-nocheck
import { isVNode, Fragment, Comment, Text, h } from 'vue'

const cacheStringFunction = fn => {
  const cache = Object.create(null)
  return str => {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  }
}

const camelizeRE = /-(\w)/g
const camelize = cacheStringFunction(str => {
  return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''))
})

const hyphenateRE = /\B([A-Z])/g
const hyphenate = cacheStringFunction(str => {
  return str.replace(hyphenateRE, '-$1').toLowerCase()
})

const onRE = /^on[^a-z]/
const isOn = key => onRE.test(key)

// change from vue sourcecode
function resolvePropValue(options, props, key, value) {
  const opt = options[key]
  /* eslint-disable */
  if (opt != null) {
    const hasDefault = hasOwn(opt, 'default')
    // default values
    if (hasDefault && value === undefined) {
      const defaultValue = opt.default
      value =
        opt.type !== Function && isFunction(defaultValue)
          ? defaultValue()
          : defaultValue
    }
    // boolean casting
    if (opt.type === Boolean) {
      if (!hasOwn(props, key) && !hasDefault) {
        value = false
      } else if (value === '') {
        value = true
      }
    }
  }
  return value
}

const isValid = (value: any): boolean => {
  return value !== undefined && value !== null && value !== ''
}

const splitAttrs = attrs => {
  const allAttrs = Object.keys(attrs)
  const eventAttrs = {}
  const onEvents = {}
  const extraAttrs = {}
  for (let i = 0, l = allAttrs.length; i < l; i++) {
    const key = allAttrs[i]
    if (isOn(key)) {
      eventAttrs[key[2].toLowerCase() + key.slice(3)] = attrs[key]
      onEvents[key] = attrs[key]
    } else {
      extraAttrs[key] = attrs[key]
    }
  }
  return { onEvents, events: eventAttrs, extraAttrs }
}
const parseStyleText = (cssText = '', camel) => {
  const res = {}
  const listDelimiter = /;(?![^(]*\))/g
  const propertyDelimiter = /:(.+)/
  if (typeof cssText === 'object') return cssText
  cssText.split(listDelimiter).forEach(function (item) {
    if (item) {
      const tmp = item.split(propertyDelimiter)
      if (tmp.length > 1) {
        const k = camel ? camelize(tmp[0].trim()) : tmp[0].trim()
        res[k] = tmp[1].trim()
      }
    }
  })
  return res
}

const hasProp = (instance, prop) => {
  return instance[prop] !== undefined
}
// 重构后直接使用 hasProp 替换
const slotHasProp = (slot, prop) => {
  return hasProp(slot, prop)
}

const getScopedSlots = ele => {
  return (ele.data && ele.data.scopedSlots) || {}
}

const getSlots = ele => {
  let componentOptions = ele.componentOptions || {}
  if (ele.$vnode) {
    componentOptions = ele.$vnode.componentOptions || {}
  }
  const children = ele.children || componentOptions.children || []
  const slots = {}
  children.forEach(child => {
    if (!isEmptyElement(child)) {
      const name = (child.data && child.data.slot) || 'default'
      slots[name] = slots[name] || []
      slots[name].push(child)
    }
  })
  return { ...slots, ...getScopedSlots(ele) }
}

const flattenChildren = (children = [], filterEmpty = true) => {
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

const getSlot = (self, name = 'default', options = {}) => {
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

const getAllChildren = ele => {
  let componentOptions = ele.componentOptions || {}
  if (ele.$vnode) {
    componentOptions = ele.$vnode.componentOptions || {}
  }
  return ele.children || componentOptions.children || []
}
const getSlotOptions = () => {
  throw Error('使用 .type 直接取值')
}
const findDOMNode = instance => {
  let node = instance?.vnode?.el || (instance && (instance.$el || instance))
  while (node && !node.tagName) {
    node = node.nextSibling
  }
  return node
}
const getOptionProps = instance => {
  const res = {}
  if (instance.$ && instance.$.vnode) {
    const props = instance.$.vnode.props || {}
    Object.keys(instance.$props).forEach(k => {
      const v = instance.$props[k]
      const hyphenateKey = hyphenate(k)
      if (v !== undefined || hyphenateKey in props) {
        res[k] = v // 直接取 $props[k]
      }
    })
  } else if (isVNode(instance) && typeof instance.type === 'object') {
    const originProps = instance.props || {}
    const props = {}
    Object.keys(originProps).forEach(key => {
      props[camelize(key)] = originProps[key]
    })
    const options = instance.type.props || {}
    Object.keys(options).forEach(k => {
      const v = resolvePropValue(options, props, k, props[k])
      if (v !== undefined || k in props) {
        res[k] = v
      }
    })
  }
  return res
}
const getComponent = (
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
const getComponentFromProp = (
  instance,
  prop,
  options = instance,
  execute = true
) => {
  if (instance.$createElement) {
    // const h = instance.$createElement;
    const temp = instance[prop]
    if (temp !== undefined) {
      return typeof temp === 'function' && execute ? temp(h, options) : temp
    }
    return (
      (instance.$scopedSlots[prop] &&
        execute &&
        instance.$scopedSlots[prop](options)) ||
      instance.$scopedSlots[prop] ||
      instance.$slots[prop] ||
      undefined
    )
  } else {
    // const h = instance.context.$createElement;
    const temp = getPropsData(instance)[prop]
    if (temp !== undefined) {
      return typeof temp === 'function' && execute ? temp(h, options) : temp
    }
    const slotScope = getScopedSlots(instance)[prop]
    if (slotScope !== undefined) {
      return typeof slotScope === 'function' && execute
        ? slotScope(h, options)
        : slotScope
    }
    const slotsProp = []
    const componentOptions = instance.componentOptions || {}
    ;(componentOptions.children || []).forEach(child => {
      if (child.data && child.data.slot === prop) {
        if (child.data.attrs) {
          delete child.data.attrs.slot
        }
        if (child.tag === 'template') {
          slotsProp.push(child.children)
        } else {
          slotsProp.push(child)
        }
      }
    })
    return slotsProp.length ? slotsProp : undefined
  }
}

const getAllProps = ele => {
  let props = getOptionProps(ele)
  if (ele.$) {
    props = { ...props, ...this.$attrs }
  } else {
    props = { ...ele.props, ...props }
  }
  return props
}

const getAttrs = ele => {
  let data = ele.data
  if (ele.$vnode) {
    data = ele.$vnode.data
  }
  return data ? data.attrs || {} : {}
}

const getKey = ele => {
  const key = ele.key
  return key
}

export function getEvents(ele = {}, on = true) {
  let props = {}
  if (ele.$) {
    props = { ...props, ...ele.$attrs }
  } else {
    props = { ...props, ...ele.props }
  }
  return splitAttrs(props)[on ? 'onEvents' : 'events']
}

export function getEvent(child, event) {
  return child.props && child.props[event]
}

// 获取 xxx.native 或者 原生标签 事件
export function getDataEvents(child) {
  let events = {}
  if (child.data && child.data.on) {
    events = child.data.on
  }
  return { ...events }
}

// use getListeners instead this.$listeners
// https://github.com/vueComponent/ant-design-vue/issues/1705
export function getListeners(context) {
  return (
    (context.$vnode
      ? context.$vnode.componentOptions.listeners
      : context.$listeners) || {}
  )
}

export function getComponentName(opts) {
  return opts && (opts.Ctor.options.name || opts.tag)
}

export function isFragment(c) {
  return c.length === 1 && c[0].type === Fragment
}

export function isEmptyContent(c) {
  return (
    c === undefined ||
    c === null ||
    c === '' ||
    (Array.isArray(c) && c.length === 0)
  )
}

export function isEmptyElement(c) {
  return (
    c &&
    (c.type === Comment ||
      (c.type === Fragment && c.children.length === 0) ||
      (c.type === Text && c.children.trim() === ''))
  )
}

export function isEmptySlot(c) {
  return !c || c().every(isEmptyElement)
}

export function isStringElement(c) {
  return c && c.type === Text
}

export function filterEmpty(children = []) {
  const res = []
  children.forEach(child => {
    if (Array.isArray(child)) {
      res.push(...child)
    } else if (child?.type === Fragment) {
      res.push(...filterEmpty(child.children))
    } else {
      res.push(child)
    }
  })
  return res.filter(c => !isEmptyElement(c))
}

export function filterEmptyWithUndefined(children) {
  if (children) {
    const coms = filterEmpty(children)
    return coms.length ? coms : undefined
  } else {
    return children
  }
}

function isValidElement(element) {
  if (Array.isArray(element) && element.length === 1) {
    element = element[0]
  }
  return element && element.__v_isVNode && typeof element.type !== 'symbol' // remove text node
}

function getPropsSlot(slots, props, prop = 'default') {
  return props[prop] ?? slots[prop]?.()
}

export const getTextFromElement = ele => {
  if (isValidElement(ele) && isStringElement(ele[0])) {
    return ele[0].children
  }
  return ele
}

// export const initDefaultProps = <T>(
//   types: T,
//   defaultProps: any,
// ): T => {
//   const propTypes: T = { ...types };
//   Object.keys(defaultProps).forEach(k => {
//     const prop = propTypes[k] as any;
//     if (prop) {
//       if (prop.type || prop.default) {
//         prop.default = defaultProps[k];
//       } else if (prop.def) {
//         prop.def(defaultProps[k]);
//       } else {
//         propTypes[k] = { type: prop, default: defaultProps[k] };
//       }
//     } else {
//       throw new Error(`not have ${k} prop`);
//     }
//   });
//   return propTypes;
// };

export {
  splitAttrs,
  hasProp,
  getOptionProps,
  getComponent,
  getComponentFromProp,
  getSlotOptions,
  slotHasProp,
  getPropsData,
  getKey,
  getAttrs,
  getValueByProp,
  parseStyleText,
  isValidElement,
  camelize,
  getSlots,
  getSlot,
  getAllProps,
  getAllChildren,
  findDOMNode,
  flattenChildren,
  getPropsSlot
}
