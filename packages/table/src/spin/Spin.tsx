import type { Slot, VNode, ExtractPropTypes, PropType } from 'vue'
import { inject, cloneVNode, isVNode, defineComponent, nextTick } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { getComponent, getSlot } from '../utils'
import { defaultConfigProvider } from '../config'

export type SpinSize = 'small' | 'default' | 'large'
export const spinProps = {
  prefixCls: String,
  spinning: { type: Boolean, default: true },
  size: { type: String as PropType<SpinSize>, default: 'default' },
  wrapperClassName: { type: String, default: '' },
  tip: { type: [String, Function] as PropType<string | Slot> },
  delay: Number,
  indicator: { type: [Object, Function] as PropType<VNode | Slot> }
}

export type SpinProps = ExtractPropTypes<typeof spinProps>

// Render indicator
let defaultIndicator: () => VNode

function shouldDelay(spinning?: boolean, delay?: number): boolean {
  return !!spinning && !!delay && !isNaN(Number(delay))
}

export function setDefaultIndicator(Content: any) {
  const Indicator = Content.indicator
  defaultIndicator =
    typeof Indicator === 'function' ? Indicator : () => <Indicator />
}

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'VirtualSpin',
  inheritAttrs: false,
  props: spinProps,
  setup() {
    return {
      originalUpdateSpinning: () => {},
      configProvider: inject('configProvider', defaultConfigProvider)
    }
  },
  data() {
    const { spinning, delay } = this
    const shouldBeDelayed = shouldDelay(spinning, delay)
    return {
      sSpinning: spinning && !shouldBeDelayed
    }
  },
  created() {
    this.originalUpdateSpinning = this.updateSpinning
    this.debouncifyUpdateSpinning(this.$props)
  },
  mounted() {
    this.updateSpinning()
  },
  updated() {
    nextTick(() => {
      this.debouncifyUpdateSpinning()
      this.updateSpinning()
    })
  },
  beforeUnmount() {
    this.cancelExistingSpin()
  },
  methods: {
    debouncifyUpdateSpinning(props?: any) {
      const { delay } = props || this.$props
      if (delay) {
        this.cancelExistingSpin()
        this.updateSpinning = useDebounceFn(this.originalUpdateSpinning, delay)
      }
    },
    updateSpinning() {
      const { spinning, sSpinning } = this
      if (sSpinning !== spinning) {
        this.sSpinning = spinning
      }
    },
    cancelExistingSpin() {
      const { updateSpinning } = this
      if (updateSpinning && (updateSpinning as any).cancel) {
        ;(updateSpinning as any).cancel()
      }
    },
    renderIndicator(prefixCls: string) {
      const dotClassName = `${prefixCls}-dot`
      let indicator = getComponent(this, 'indicator')
      // should not be render default indicator when indicator value is null
      if (indicator === null) {
        return null
      }
      if (Array.isArray(indicator)) {
        indicator = indicator.length === 1 ? indicator[0] : indicator
      }
      if (isVNode(indicator)) {
        return cloneVNode(indicator, { class: dotClassName })
      }

      if (defaultIndicator && isVNode(defaultIndicator())) {
        return cloneVNode(defaultIndicator(), { class: dotClassName })
      }

      return (
        <span class={`${dotClassName} ${prefixCls}-dot-spin`}>
          <i class={`${prefixCls}-dot-item`} />
          <i class={`${prefixCls}-dot-item`} />
          <i class={`${prefixCls}-dot-item`} />
          <i class={`${prefixCls}-dot-item`} />
        </span>
      )
    }
  },
  render() {
    const {
      size,
      prefixCls: customizePrefixCls,
      tip = this.$slots.tip?.(),
      wrapperClassName
    } = this.$props
    const { class: cls, style, ...divProps } = this.$attrs
    const { getPrefixCls, direction } = this.configProvider
    const prefixCls = getPrefixCls('spin', customizePrefixCls)

    const { sSpinning } = this
    const spinClassName = {
      [prefixCls]: true,
      [`${prefixCls}-sm`]: size === 'small',
      [`${prefixCls}-lg`]: size === 'large',
      [`${prefixCls}-spinning`]: sSpinning,
      [`${prefixCls}-show-text`]: !!tip,
      [`${prefixCls}-rtl`]: direction === 'rtl',
      [cls as string]: !!cls
    }

    const spinElement = (
      <div {...divProps} style={style} class={spinClassName}>
        {this.renderIndicator(prefixCls)}
        {tip ? <div class={`${prefixCls}-text`}>{tip}</div> : null}
      </div>
    )
    const children = getSlot(this)
    if (children && children.length) {
      const containerClassName = {
        [`${prefixCls}-container`]: true,
        [`${prefixCls}-blur`]: sSpinning
      }

      return (
        <div class={[`${prefixCls}-nested-loading`, wrapperClassName]}>
          {sSpinning && <div key="loading">{spinElement}</div>}
          <div class={containerClassName} key="container">
            {children}
          </div>
        </div>
      )
    }
    return spinElement
  }
})
