import { defineComponent, inject, computed } from 'vue'
import type { PropType } from 'vue'
import { get } from 'lodash-es'
import type { InternalRowData, TableBaseColumn, TableColumn } from '../types'
import { tableInjectionKey } from '../types'
import { isValidElement } from '../utils/propsUtil'

function isInvalidRenderCellText(text) {
  return (
    text &&
    !isValidElement(text) &&
    Object.prototype.toString.call(text) === '[object Object]'
  )
}

export default defineComponent({
  props: {
    index: { type: Number, required: true },
    row: { type: Object as PropType<InternalRowData>, required: true },
    column: { type: Object as PropType<TableBaseColumn>, required: true }
  },
  setup(props) {
    const { slots } = inject(tableInjectionKey)!
    const slotName = computed(() => props.column.slot || props.column.key)
    const text = computed(() => {
      let _text = get(
        props.row,
        (props.column.dataIndex || props.column.key) as any
      )
      if (isInvalidRenderCellText(_text)) {
        _text = null
      }
      return _text
    })
    const slotProps = computed(() => ({
      text: text.value,
      record: props.row,
      row: props.row,
      index: props.index,
      column: props.column
    }))

    // return {
    //   slotName,
    //   text,
    //   slotProps,
    //   slots
    // }
    return () =>
      slotName.value && slots[slotName.value]
        ? slots[slotName.value]?.(slotProps.value)
        : slotProps.value.text
  }
})
