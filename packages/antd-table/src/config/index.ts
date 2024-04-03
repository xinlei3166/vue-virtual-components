import type { ExtractPropTypes, InjectionKey, UnwrapRef, PropType } from 'vue'
import { reactive } from 'vue'
import defaultRenderEmpty from './renderEmpty'
import type { RenderEmptyHandler } from './renderEmpty'
import type { TableInjection } from '../types'

export const defaultPrefixCls = 'vuevct'

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
  getPrefixCls: (suffixCls?: string, customizePrefixCls?: string) => {
    if (customizePrefixCls) return customizePrefixCls
    return suffixCls ? `${defaultPrefixCls}-${suffixCls}` : defaultPrefixCls
  },
  renderEmpty: defaultRenderEmpty,
  direction: 'ltr'
})

export const configProviderInjectionKey: InjectionKey<ConfigProviderProps> =
  Symbol('@vue-virtual-components/antd-table::configProvider')
