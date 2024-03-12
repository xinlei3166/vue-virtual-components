import type { PropType } from 'vue'
import { defineComponent, computed, inject } from 'vue'
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons-vue'
import type { TableBaseColumn } from '../../types'
import { tableInjectionKey, ASCEND, DESCEND } from '../../types'

export default defineComponent({
  props: {
    column: {
      type: Object as PropType<TableBaseColumn>,
      required: true
    }
  },
  setup(props) {
    const { prefixCls, mergedSortState } = inject(tableInjectionKey)
    const sortState = computed(() =>
      mergedSortState.value?.find(state => state.columnKey === props.column.key)
    )
    const active = computed(() => {
      return sortState.value !== undefined
    })
    const mergedSortOrder = computed(() => {
      if (sortState.value && active.value) {
        return sortState.value.order
      }
      return false
    })

    return () => (
      <div
        class={[
          `${prefixCls.value}-sorter`,
          { [`${prefixCls.value}-sorter-full`]: true }
        ]}
      >
        <span class={`${prefixCls.value}-sorter-inner`}>
          <CaretUpOutlined
            class={[
              `${prefixCls.value}-sorter--asc`,
              {
                active: mergedSortOrder.value === ASCEND
              }
            ]}
          />
          <CaretDownOutlined
            class={[
              `${prefixCls.value}-sorter--desc`,
              {
                active: mergedSortOrder.value === DESCEND
              }
            ]}
          />
        </span>
      </div>
    )
  }
})
