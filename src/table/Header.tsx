import { defineComponent, CSSProperties, renderSlot, reactive, inject, onMounted } from 'vue'
import { pxfy } from 'seemly'
import { tableInjectionKey } from '../interface'
import { measureScrollbar, getColKey } from '../utils'

export default defineComponent({
  setup(props) {
    const { slots, rows, cols, componentId } = inject(tableInjectionKey)!

    const headStyle = reactive<CSSProperties>({})
    const prefixCls = 'vue-virtual-table'
    const scrollbarWidth = measureScrollbar({ direction: 'vertical' })
    const scrollbarWidthOfHeader = measureScrollbar({ direction: 'horizontal', prefixCls })

    // Add negative margin bottom for scroll bar overflow bug
    if (scrollbarWidthOfHeader > 0) {
      headStyle.marginBottom = `-${scrollbarWidthOfHeader}px`
      headStyle.paddingBottom = '0px'
      // https://github.com/ant-design/ant-design/pull/19986
      headStyle.minWidth = `${scrollbarWidth}px`
      // https://github.com/ant-design/ant-design/issues/17051
      headStyle.overflowX = 'scroll'
      headStyle.overflowY = scrollbarWidth === 0 ? 'hidden' : 'scroll'
    }

    onMounted(() => {
      if (!scrollbarWidth) return
      const el = document.querySelector('.v-vl--show-scrollbar') as any
      const hasScrollbar = el.scrollHeight > el.clientHeight || el.offsetHeight > el.clientHeight
      headStyle.overflowY = hasScrollbar ? 'scroll' : 'hidden'
    })

    return () => (
      <div
        class={['vue-virtual-table-header', { 'vue-virtual-table-hide-scrollbar': true }]}
        style={headStyle}
      >
        <table class="vue-virtual-table-table">
          <colgroup>
            {cols.value.map(col => (
              <col key={col.key} style={col.style}></col>
            ))}
          </colgroup>
          <thead class="vue-virtual-table-thead" data-vt-id={componentId}>
            {rows.value.map(row => (
              <tr class="vue-virtual-table-tr">
                {row.map(({ column, colSpan, rowSpan, isLast }) => {
                  const key = getColKey(column)
                  // @ts-ignore
                  // @ts-ignore
                  return (
                    // vue-virtual-table-th--fixed-left
                    <th
                      class="vue-virtual-table-th"
                      key={key}
                      colspan={colSpan}
                      rowspan={rowSpan}
                      data-col-key={key}
                      style={{
                        textAlign: column.align
                        // left: pxfy(fixedColumnLeftMap[key]?.start),
                        // right: pxfy(fixedColumnRightMap[key]?.start)
                      }}
                    >
                      {renderSlot(slots, column.title!, undefined, () => [column.title])}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
        </table>
      </div>
    )
  }
})
