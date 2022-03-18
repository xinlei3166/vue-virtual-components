import { defineComponent, inject, computed } from 'vue'
import type { PropType } from 'vue'
import { get } from 'lodash-es'
import type { InternalRowData, TableColumn } from '../interface'
import { tableInjectionKey } from '../interface'

export default defineComponent({
  props: {
    index: { type: Number, required: true },
    row: { type: Object as PropType<InternalRowData>, required: true },
    column: { type: Object as PropType<TableColumn>, required: true }
  },
  setup(props) {
    const { slots } = inject(tableInjectionKey)!
    const slotName = computed(() => props.column.slots?.customRender as string)

    return () => (
      <>
        {slots[slotName.value]
          ? slots[slotName.value]?.()
          : get(props.row, (props.column.dataIndex || props.column.key) as any)}
      </>
    )
  }
})
