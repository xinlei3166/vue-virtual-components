import { defineComponent, ref, onMounted } from 'vue'
import type { PropType } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import type { ColumnKey } from '../types'

export default defineComponent({
  props: {
    colKey: { type: [String, Number] as PropType<ColumnKey>, required: true }
  },
  emits: ['colResize'],
  setup(props, { emit }) {
    const tdRef = ref()

    onMounted(() => {
      if (tdRef.value) {
        emit('colResize', props.colKey, tdRef.value.offsetWidth)
      }
    })

    useResizeObserver(tdRef, entries => {
      const entry = entries[0]
      // const { width, height } = entry.contentRect
      emit('colResize', props.colKey, (entry.target as any).offsetWidth)
    })

    return () => (
      <td ref={tdRef} style={{ padding: 0, border: 0, height: 0 }}>
        <div style={{ height: 0, overflow: 'hidden' }}>&nbsp;</div>
      </td>
    )
  }
})
