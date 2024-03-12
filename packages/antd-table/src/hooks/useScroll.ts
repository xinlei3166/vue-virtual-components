// modified from https://github.com/TuSimple/naive-ui/blob/main/src/data-table/src/use-scroll.ts
import { beforeNextFrameOnce, depx } from 'seemly'
import type { Ref, ComputedRef } from 'vue'
import { computed, watch, ref } from 'vue'
import type {
  TableProps,
  ColumnKey,
  TableColumn,
  InternalTableRef
} from '../types'
import { getNumberColWidth, getColKey } from '../utils'
import type { TableColumns } from '../types'

export function useScroll(
  props: TableProps,
  {
    tableRef,
    scrollPartRef,
    bodyWidth,
    scrollbarSize,
    hasScrollbar,
    colsWidths,
    prefixCls,
    mergedColumns
  }: {
    tableRef: Ref<InternalTableRef>
    scrollPartRef: Ref<'header' | 'body'>
    bodyWidth: Ref<null | number>
    scrollbarSize: Ref<{ width: number; height: number }>
    hasScrollbar: Ref<boolean | undefined>
    colsWidths: Ref<Map<ColumnKey, number>>
    prefixCls: Ref<string>
    mergedColumns: ComputedRef<TableColumns>
  }
) {
  let lastScrollLeft = 0
  const leftActiveFixedColKey = ref<ColumnKey | null>(null)
  const leftActiveFixedChildrenColKeys = ref<ColumnKey[]>([])
  const rightActiveFixedColKey = ref<ColumnKey | null>(null)
  const rightActiveFixedChildrenColKeys = ref<ColumnKey[]>([])

  const leftFixedColumns = computed(() => {
    return mergedColumns.value.filter(column => column.fixed === 'left')
  })
  const rightFixedColumns = computed(() => {
    return mergedColumns.value.filter(column => column.fixed === 'right')
  })

  const fixedColumnLeftMap = computed(() => {
    const columns: Record<
      ColumnKey,
      { start: number; end: number } | undefined
    > = {}
    let left = 0
    function traverse(cols: TableColumn[]): void {
      cols.forEach(col => {
        console.log(cols)
        const positionInfo = { start: left, end: 0 }
        const colKey = getColKey(col)
        const width = colsWidths.value.get(colKey)
        columns[colKey] = positionInfo
        if ('children' in col) {
          traverse(col.children)
          positionInfo.end = left
        } else {
          left += width || getNumberColWidth(col) || 0
          positionInfo.end = left
        }
      })
    }
    traverse(leftFixedColumns.value)
    return columns
  })

  const fixedColumnRightMap = computed(() => {
    const columns: Record<
      ColumnKey,
      { start: number; end: number } | undefined
    > = {}
    const right = 0
    traverse(rightFixedColumns.value, columns, right)
    return columns
  })

  const fixedHeaderColumnRightMap = computed(() => {
    const columns: Record<
      ColumnKey,
      { start: number; end: number } | undefined
    > = {}
    const right = 0
    const rightFixedColumnsWithScrollbar = computed(() =>
      getRightFixedColumnsWithScrollbar(rightFixedColumns.value)
    )
    traverse(rightFixedColumnsWithScrollbar.value, columns, right)
    return columns
  })

  function traverse(
    cols: TableColumn[],
    columns: Record<ColumnKey, { start: number; end: number } | undefined>,
    right: number
  ): void {
    for (let i = cols.length - 1; i >= 0; --i) {
      const col = cols[i]
      const positionInfo = { start: right, end: 0 }
      const colKey = getColKey(col)
      const width = colsWidths.value.get(colKey)
      columns[colKey] = positionInfo
      if ('children' in col) {
        traverse(col.children, columns, right)
        positionInfo.end = right
      } else {
        right += width || getNumberColWidth(col) || 0
        positionInfo.end = right
      }
    }
  }

  function getRightFixedColumnsWithScrollbar(rightFixedColumns: TableColumns) {
    const lastColumn = rightFixedColumns[rightFixedColumns.length - 1]
    const column = {
      key: `${prefixCls.value}Scrollbar`,
      fixed: lastColumn ? lastColumn.fixed : null,
      customHeaderCell: () => ({
        class: `${prefixCls.value}-th-scrollbar`
      }),
      width: scrollbarSize.value.width
    } as any as TableColumn

    return hasScrollbar.value
      ? [...rightFixedColumns, column]
      : rightFixedColumns
  }

  function deriveActiveLeftFixedColumn(): void {
    // target is header element
    let leftWidth = 0
    let _leftActiveFixedColKey: string | number | null = null
    for (let i = 0; i < leftFixedColumns.value.length; ++i) {
      const key = getColKey(leftFixedColumns.value[i])
      if (
        lastScrollLeft >
        (fixedColumnLeftMap.value[key]?.start || 0) - leftWidth
      ) {
        _leftActiveFixedColKey = key
        leftWidth = fixedColumnLeftMap.value[key]?.end || 0
      } else {
        break
      }
    }
    leftActiveFixedColKey.value = _leftActiveFixedColKey
  }

  function deriveActiveLeftFixedChildrenColumns(): void {
    leftActiveFixedChildrenColKeys.value = []
    let activeLeftFixedColumn = mergedColumns.value.find(
      col => getColKey(col) === leftActiveFixedColKey.value
    )
    while (activeLeftFixedColumn && 'children' in activeLeftFixedColumn) {
      const length: number = activeLeftFixedColumn.children.length
      if (length === 0) break
      const nextActiveLeftFixedColumn =
        activeLeftFixedColumn.children[length - 1]
      leftActiveFixedChildrenColKeys.value.push(
        getColKey(nextActiveLeftFixedColumn)
      )
      activeLeftFixedColumn = nextActiveLeftFixedColumn
    }
  }

  function deriveActiveRightFixedColumn(): void {
    const { table } = getScrollElements()
    const scrollWidth = table?.clientWidth || depx(props.scroll?.x as any)
    const { value: tableWidth } = bodyWidth
    if (tableWidth === null) return
    let rightWidth = 0
    let _rightActiveFixedColKey: string | number | null = null
    for (let i = rightFixedColumns.value.length - 1; i >= 0; --i) {
      const key = getColKey(rightFixedColumns.value[i])
      if (
        Math.round(
          lastScrollLeft +
            (fixedColumnRightMap.value[key]?.start || 0) +
            tableWidth -
            rightWidth
        ) < scrollWidth
      ) {
        _rightActiveFixedColKey = key
        rightWidth = fixedColumnRightMap.value[key]?.end || 0
      } else {
        break
      }
    }
    rightActiveFixedColKey.value = _rightActiveFixedColKey
  }

  function deriveActiveRightFixedChildrenColumns(): void {
    rightActiveFixedChildrenColKeys.value = []
    let activeRightFixedColumn = mergedColumns.value.find(
      col => getColKey(col) === rightActiveFixedColKey.value
    )
    while (
      activeRightFixedColumn &&
      'children' in activeRightFixedColumn &&
      activeRightFixedColumn.children.length
    ) {
      const nextActiveRightFixedColumn = activeRightFixedColumn.children[0]
      rightActiveFixedChildrenColKeys.value.push(
        getColKey(nextActiveRightFixedColumn)
      )
      activeRightFixedColumn = nextActiveRightFixedColumn
    }
  }

  function getScrollElements(): {
    header: HTMLElement | null
    body: HTMLElement | null
    table: HTMLElement | null
  } {
    const header = tableRef.value ? tableRef.value.getHeaderElement() : null
    const body = tableRef.value ? tableRef.value.getBodyElement() : null
    const table = tableRef.value ? tableRef.value.getTableElement() : null
    return {
      header,
      body,
      table
    }
  }

  // function scrollTableBodyToTop(): void {
  //   const { body } = getScrollElements()
  //   if (body) {
  //     body.scrollTop = 0
  //   }
  // }

  function handleTableHeaderScroll(): void {
    if (scrollPartRef.value !== 'body') {
      beforeNextFrameOnce(syncScrollState)
    } else {
      scrollPartRef.value = undefined
    }
  }

  function handleTableBodyScroll(): void {
    // props.onScroll?.(e)
    if (scrollPartRef.value !== 'header') {
      beforeNextFrameOnce(syncScrollState)
    } else {
      scrollPartRef.value = undefined
    }
  }

  function syncScrollState(): void {
    const { header, body } = getScrollElements()
    if (!body) return
    const { value: tableWidth } = bodyWidth
    if (tableWidth === null) return
    if (props.scroll?.y) {
      if (!header) return
      // we need to deal with overscroll
      const directionHead = lastScrollLeft - header.scrollLeft
      scrollPartRef.value = directionHead !== 0 ? 'head' : 'body'
      if (scrollPartRef.value === 'header') {
        lastScrollLeft = header.scrollLeft
        body.scrollLeft = lastScrollLeft
      } else {
        lastScrollLeft = body.scrollLeft
        header.scrollLeft = lastScrollLeft
      }
    } else {
      lastScrollLeft = body.scrollLeft
    }
    deriveActiveLeftFixedColumn()
    deriveActiveLeftFixedChildrenColumns()
    deriveActiveRightFixedColumn()
    deriveActiveRightFixedChildrenColumns()
  }

  // watch(mergedCurrentPageRef, () => {
  //   scrollTableBodyToTop()
  // })

  return {
    fixedColumnLeftMap,
    fixedColumnRightMap,
    fixedHeaderColumnRightMap,
    leftFixedColumns,
    rightFixedColumns,
    leftActiveFixedColKey,
    leftActiveFixedChildrenColKeys,
    rightActiveFixedColKey,
    rightActiveFixedChildrenColKeys,
    syncScrollState,
    handleTableBodyScroll,
    handleTableHeaderScroll
  }
}
