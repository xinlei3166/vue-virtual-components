import {
  defineComponent,
  reactive,
  inject,
  ref,
  computed,
  watchEffect
} from 'vue'
import type { CSSProperties, ComputedRef } from 'vue'
import type { TooltipProps } from 'ant-design-vue'
import { Tooltip } from 'ant-design-vue'
import { happensIn, pxfy } from 'seemly'
import type { TableColumn, ColumnKey } from '../types'
import { tableInjectionKey, ASCEND, DESCEND } from '../types'
import {
  getColKey,
  isColumnSortable,
  isColumnSorting,
  createNextSorter,
  getNextOrderOf
} from '../utils'
import type { RowItem, ColItem } from '../hooks/useGroupHeader'
import { useAdditionalProps } from '../utils/additionalProps'
import HeaderCheckbox from './HeaderCheckbox'
import SortButton from './HeaderButton/SortButton'

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

export const Wrapper = defineComponent({
  props: {
    column: Object,
    tooltipProps: Object,
    showSorterTooltip: [Object, Boolean]
  },
  setup(props, { slots }) {
    return () =>
      isColumnSortable(props.column) && props.showSorterTooltip ? (
        <Tooltip {...props.tooltipProps} key={props.column.key}>
          {slots.default?.()}
        </Tooltip>
      ) : (
        <>{slots.default?.()}</>
      )
  }
})

export default defineComponent({
  setup(props) {
    function handleColHeaderClick(
      e: MouseEvent,
      column: TableBaseColumn
    ): void {
      if (happensIn(e, 'tableFilter') || happensIn(e, 'tableResizable')) {
        return
      }
      if (!isColumnSortable(column)) return
      const activeSorter =
        mergedSortState.value.find(state => state.columnKey === column.key) ||
        null
      const nextSorter = createNextSorter(column, activeSorter)
      deriveNextSorter(nextSorter)
      onChange({ sorter: nextSorter })
    }

    const {
      props: tableProps,
      prefixCls,
      slots,
      rows: _rows,
      cols: _cols,
      componentId,
      mergedData,
      scrollbarSize,
      hasScrollbar,
      scrollTableStyle,
      colWidths,
      fixedColumnLeftMap,
      fixedHeaderColumnRightMap,
      leftActiveFixedColKey,
      rightActiveFixedColKey,
      handleTableHeaderScroll,
      mergedRowSelection,
      mergedSortState,
      deriveNextSorter,
      onChange
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
            ...scrollTableStyle.value,
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
            {rows.value.map((row, index) => (
              <tr class={`${prefixCls.value}-tr`}>
                {row.map(
                  ({
                    column,
                    colSpan: _colSpan,
                    rowSpan: _rowSpan,
                    isLast
                  }) => {
                    let _additionalProps
                    if (column.customHeaderCell) {
                      _additionalProps = column.customHeaderCell(column)
                    }
                    const { additionalProps, hovering } = useAdditionalProps({
                      index,
                      row,
                      column,
                      additionalProps: _additionalProps,
                      colSpan: _colSpan,
                      rowSpan: _rowSpan
                    })
                    const key = getColKey(column)
                    const slotName = column.slots?.title as string
                    const createColumnVNode = (): VNode | null => {
                      if (column.type === 'selection') {
                        return column.multiple !== false &&
                          !mergedRowSelection.value.hideSelectAll ? (
                          <HeaderCheckbox />
                        ) : null
                      }
                      return (
                        <div class={`${prefixCls.value}-th--title-wrap`}>
                          <span class={`${prefixCls.value}-th--title`}>
                            {slots[slotName]
                              ? slots[slotName]?.()
                              : column.title}
                          </span>
                          {isColumnSortable(column) ? (
                            <SortButton column={column} />
                          ) : null}
                        </div>
                      )
                    }

                    const showSorterTooltip =
                      column.showSorterTooltip === undefined
                        ? tableProps.showSorterTooltip
                        : column.showSorterTooltip
                    const { cancelSort, triggerAsc, triggerDesc } =
                      tableProps.locale || {}
                    let sortTip: string | undefined = cancelSort
                    const sorterState =
                      mergedSortState.value.find(
                        state => state.columnKey === column.key
                      ) || null
                    const sorterOrder = sorterState ? sorterState.order : null
                    const nextSortOrder = getNextOrderOf(sorterOrder)
                    if (nextSortOrder === DESCEND) {
                      sortTip = triggerDesc
                    } else if (nextSortOrder === ASCEND) {
                      sortTip = triggerAsc
                    }
                    const tooltipProps: TooltipProps =
                      typeof showSorterTooltip === 'object'
                        ? showSorterTooltip
                        : { title: sortTip }

                    // todo additionalProps.class duplication problem
                    return (
                      <Wrapper
                        column={column}
                        tooltipProps={tooltipProps}
                        showSorterTooltip={showSorterTooltip}
                      >
                        <th
                          {...additionalProps}
                          colspan={additionalProps.colSpan.value}
                          rowspan={additionalProps.rowSpan.value}
                          class={[
                            additionalProps.class,
                            `${prefixCls.value}-th`,
                            column.fixed &&
                              `${prefixCls.value}-th--fixed-${column.fixed}`,
                            isLast ? `${prefixCls.value}-th--last` : '',
                            {
                              [`${prefixCls.value}-th--fixed-left--last`]:
                                leftActiveFixedColKey.value === key,
                              [`${prefixCls.value}-th--fixed-right--last`]:
                                rightActiveFixedColKey.value === key,
                              [`${prefixCls.value}-th--selection`]:
                                column.type === 'selection',
                              [`${prefixCls.value}-th--sortable`]:
                                isColumnSortable(column),
                              [`${prefixCls.value}-th--hover`]: isColumnSorting(
                                column,
                                mergedSortState.value
                              )
                            }
                          ]}
                          key={key}
                          data-col-key={key}
                          style={{
                            textAlign: column.align,
                            left: pxfy(fixedColumnLeftMap.value[key]?.start),
                            right: pxfy(
                              fixedHeaderColumnRightMap.value[key]?.start
                            )
                          }}
                          onClick={
                            column.type !== 'selection' &&
                            column.type !== 'expand' &&
                            !('children' in column)
                              ? e => {
                                  handleColHeaderClick(e, column)
                                }
                              : undefined
                          }
                        >
                          {createColumnVNode()}
                        </th>
                      </Wrapper>
                    )
                  }
                )}
              </tr>
            ))}
          </thead>
        </table>
      </div>
    )
  }
})
