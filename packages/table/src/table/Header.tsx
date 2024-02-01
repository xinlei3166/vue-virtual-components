import {
  defineComponent,
  reactive,
  inject,
  ref,
  computed,
  watchEffect
} from 'vue'
import type { CSSProperties, ComputedRef } from 'vue'
import { pxfy } from 'seemly'
import type { TableColumn, ColumnKey } from '../types'
import { tableInjectionKey } from '../types'
import { getColKey } from '../utils'
import type { RowItem, ColItem } from '../hooks/useGroupHeader'

function useColWidth(
  colWidthsRef: ComputedRef<number[]>,
  colCountRef: ComputedRef<number>
) {
  return computed(() => {
    const cloneCols: number[] = []
    const colWidths = colWidthsRef.value
    const columCount = colCountRef.value
    for (let i = 0; i < columCount; i += 1) {
      const val = colWidths[i]
      if (val !== undefined) {
        cloneCols[i] = val
      } else {
        return null
      }
    }
    return cloneCols
  })
}

export default defineComponent({
  setup(props) {
    const {
      prefixCls,
      slots,
      rows: _rows,
      cols: _cols,
      componentId,
      mergedData,
      scrollbarSize,
      hasScrollbar,
      colWidths,
      fixedColumnLeftMap,
      fixedHeaderColumnRightMap,
      leftActiveFixedColKey,
      rightActiveFixedColKey,
      handleTableHeaderScroll
    } = inject(tableInjectionKey)!

    const rows = ref<RowItem[][]>([])
    const cols = ref<ColItem[]>([])

    watchEffect(() => {
      const width = pxfy(scrollbarSize.value.width)
      // 判断hasScrollbar，是否增加占位th。
      const lastCol = _cols.value[_cols.value.length - 1]
      const column = {
        key: `${prefixCls.value}Scrollbar`,
        fixed: lastCol ? lastCol.column.fixed : null,
        customHeaderCell: () => ({
          class: `${prefixCls.value}-th--scrollbar`
        }),
        width
      } as any as TableColumn

      const tRows = computed(() =>
        hasScrollbar.value
          ? ([
              ..._rows.value[0].slice(),
              {
                column,
                colSpan: 0,
                rowSpan: 1,
                isLast: false
              }
            ] as RowItem[])
          : _rows.value[0]
      )

      rows.value = [tRows.value]
      cols.value = hasScrollbar.value
        ? [
            ..._cols.value,
            {
              key: column.key as ColumnKey,
              style: { width, minWidth: width } as any,
              column: column
            }
          ]
        : _cols.value
    })

    const colCount = computed(() => _cols.value.length)
    const _mergedColWidth = useColWidth(colWidths, colCount)
    const mergedColWidth = computed(() =>
      _mergedColWidth.value
        ? [..._mergedColWidth.value, scrollbarSize.value.width]
        : []
    )
    const noData = computed(() => !mergedData.value.length)

    return () => (
      <div
        class={`${prefixCls.value}-header`}
        onScroll={handleTableHeaderScroll}
        style={{ overflow: noData.value ? 'auto' : 'hidden' }}
      >
        <table
          class={`${prefixCls.value}-table`}
          style={{
            tableLayout: 'fixed',
            visibility:
              noData.value || mergedColWidth.value ? undefined : 'hidden'
          }}
        >
          <colgroup>
            {cols.value.map((col, index) => (
              <col
                key={col.key}
                style={{
                  ...col.style,
                  width: pxfy(mergedColWidth.value[index] as any),
                  minWidth: undefined
                }}
              />
            ))}
          </colgroup>
          <thead class={`${prefixCls.value}-thead`} data-vuevt-id={componentId}>
            {rows.value.map(row => (
              <tr class={`${prefixCls.value}-tr`}>
                {row.map(({ column, colSpan, rowSpan, isLast }) => {
                  const key = getColKey(column)
                  const slotName = column.slots?.title as string
                  return (
                    <th
                      class={[
                        `${prefixCls.value}-th`,
                        column.fixed &&
                          `${prefixCls.value}-th--fixed-${column.fixed}`,
                        isLast ? `${prefixCls.value}-th--last` : '',
                        {
                          [`${prefixCls.value}-th--fixed-left--last`]:
                            leftActiveFixedColKey.value === key,
                          [`${prefixCls.value}-th--fixed-right--last`]:
                            rightActiveFixedColKey.value === key
                        }
                      ]}
                      key={key}
                      colspan={colSpan}
                      rowspan={rowSpan}
                      data-col-key={key}
                      style={{
                        textAlign: column.align,
                        left: pxfy(fixedColumnLeftMap.value[key]?.start),
                        right: pxfy(fixedHeaderColumnRightMap.value[key]?.start)
                      }}
                    >
                      {slots[slotName] ? slots[slotName]?.() : column.title}
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
