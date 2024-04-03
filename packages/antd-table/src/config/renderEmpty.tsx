import { Empty } from 'ant-design-vue'
import { computed } from 'vue'
import type { VueNode } from '../types/type'
import { defaultConfigProvider } from './index'

export interface RenderEmptyProps {
  componentName?: string
  description?: any
  className?: string
}

const RenderEmpty = (props: RenderEmptyProps) => {
  const className = props.className
  const description = props.description
  // @ts-ignore
  const prefixCls = computed(() => defaultConfigProvider.getPrefixCls('empty'))
  const renderHtml = (componentName?: string) => {
    switch (componentName) {
      case 'Table':
      case 'List':
        return (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={description}
            class={className}
          />
        )

      case 'Select':
      case 'TreeSelect':
      case 'Cascader':
      case 'Transfer':
      case 'Mentions':
        return (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            class={[`${prefixCls.value}-small`, className]}
            description={description}
          />
        )

      default:
        return <Empty description={description} class={className} />
    }
  }
  return renderHtml(props.componentName)
}

function renderEmpty(
  componentName?: string,
  description?: string,
  className = ''
): VueNode {
  return (
    <RenderEmpty
      componentName={componentName}
      description={description}
      className={className}
    />
  )
}

export type RenderEmptyHandler = typeof renderEmpty

export default renderEmpty
