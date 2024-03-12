import { defineComponent, type PropType, inject } from 'vue'
import { Radio } from 'ant-design-vue'
import { tableInjectionKey } from '../types'
import type { RowKey, InternalRowData } from '../types'

export default defineComponent({
  props: {
    row: {
      type: Object as PropType<InternalRowData>,
      required: true
    },
    rowKey: {
      type: [String, Number] as PropType<RowKey>,
      required: true
    },
    disabled: {
      type: Boolean,
      required: true
    },
    onUpdateChecked: {
      type: Function as PropType<(checked: boolean) => void>,
      required: true
    }
  },
  setup(props) {
    const {
      mergedCheckedRowKeySet,
      componentId,
      mergedRowSelection
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    } = inject(tableInjectionKey)!

    return () => {
      const { rowKey } = props
      const getCheckboxProps = mergedRowSelection.value.getCheckboxProps
      const checkboxProps =
        (getCheckboxProps ? getCheckboxProps(props.row) : null) || {}

      return (
        <Radio
          {...checkboxProps}
          name={componentId}
          disabled={props.disabled}
          checked={mergedCheckedRowKeySet.value.has(rowKey)}
          onClick={e => e.stopPropagation()}
          onChange={e => props.onUpdateChecked(e.target.checked, e)}
        />
      )
    }
  }
})
