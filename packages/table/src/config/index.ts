import type { ExtractPropTypes, UnwrapRef } from 'vue'
import { reactive } from 'vue'

export const configProviderProps = {
  prefixCls: String,
  getPrefixCls: {
    type: Function as PropType<
      (suffixCls?: string, customizePrefixCls?: string) => string
    >
  },
  renderEmpty: {
    type: Function as PropType<RenderEmptyHandler>
  },
  direction: {
    type: String as PropType<'ltr' | 'rtl'>
  }
}

export type ConfigProviderProps = Partial<
  ExtractPropTypes<typeof configProviderProps>
>

export const defaultConfigProvider: UnwrapRef<ConfigProviderProps> = reactive({
  getPrefixCls: (suffixCls: string, customizePrefixCls?: string) => {
    if (customizePrefixCls) return customizePrefixCls
    return suffixCls ? `vuevc-${suffixCls}` : 'vuevc'
  },
  // renderEmpty: defaultRenderEmpty,
  direction: 'ltr'
})
