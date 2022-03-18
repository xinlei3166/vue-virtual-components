import { computed } from 'vue'
import type { CSSProperties, ComputedRef } from 'vue'
import type { TableProps } from '../table/Table'
import type { TableColumn, TableColumns } from '../interface'
import { getColKey, createCustomWidthStyle } from '../utils'

export interface RowItem {
  colSpan: number
  rowSpan: number
  column: TableColumn
  isLast: boolean
}

export interface ColItem {
  key: string | number
  style: CSSProperties
  column: TableColumn
}

type RowItemMap = WeakMap<TableColumn, RowItem>

// https://github.com/TuSimple/naive-ui/blob/main/src/data-table/src/use-group-header.ts
function getRowsAndCols(columns: TableColumns): {
  rows: RowItem[][]
  cols: ColItem[]
  relatedCols: Array<TableColumn>
} {
  const rows: RowItem[][] = []
  const cols: ColItem[] = []
  const relatedCols: Array<TableColumn> = []
  const rowItemMap: RowItemMap = new WeakMap()
  let maxDepth = -1
  let totalRowSpan = 0

  function ensureMaxDepth(columns: TableColumns, currentDepth: number): void {
    if (currentDepth > maxDepth) {
      rows[currentDepth] = []
      maxDepth = currentDepth
    }
    for (const column of columns) {
      if ('children' in column) {
        ensureMaxDepth(column.children, currentDepth + 1)
      } else {
        cols.push({
          key: getColKey(column),
          style: createCustomWidthStyle(column),
          column
        })
        totalRowSpan += 1
        relatedCols.push(column)
      }
    }
  }
  ensureMaxDepth(columns, 0)

  let currentLeafIndex = 0
  function ensureColLayout(columns: TableColumns, currentDepth: number): void {
    let hideUntilIndex = 0
    columns.forEach((column, index) => {
      if ('children' in column) {
        // do not allow colSpan > 1 for non-leaf th
        // we will execute the calculation logic
        const cachedCurrentLeafIndex = currentLeafIndex
        const rowItem: RowItem = {
          column,
          colSpan: 0,
          rowSpan: 1,
          isLast: false
        }
        ensureColLayout(column.children, currentDepth + 1)
        column.children.forEach(childColumn => {
          rowItem.colSpan += rowItemMap.get(childColumn)?.colSpan ?? 0
        })
        if (cachedCurrentLeafIndex + rowItem.colSpan === totalRowSpan) {
          rowItem.isLast = true
        }
        rowItemMap.set(column, rowItem)
        rows[currentDepth].push(rowItem)
      } else {
        if (currentLeafIndex < hideUntilIndex) {
          currentLeafIndex += 1
          return
        }
        let colSpan = 1
        if ('titleColSpan' in column) {
          colSpan = column.titleColSpan ?? 1
        }
        if (colSpan > 1) {
          hideUntilIndex = currentLeafIndex + colSpan
        }
        const isLast = currentLeafIndex + colSpan === totalRowSpan
        const rowItem: RowItem = {
          column,
          colSpan: colSpan,
          rowSpan: maxDepth - currentDepth + 1,
          isLast
        }
        rowItemMap.set(column, rowItem)
        rows[currentDepth].push(rowItem)
        currentLeafIndex += 1
      }
    })
  }
  ensureColLayout(columns, 0)

  return {
    rows,
    cols,
    relatedCols
  }
}

export function useGroupHeader(props: TableProps): {
  rows: ComputedRef<RowItem[][]>
  cols: ComputedRef<ColItem[]>
  relatedCols: ComputedRef<Array<TableColumn>>
} {
  const rowsAndCols = computed(() => getRowsAndCols(props.columns))
  return {
    rows: computed(() => rowsAndCols.value.rows),
    cols: computed(() => rowsAndCols.value.cols),
    relatedCols: computed(() => rowsAndCols.value.relatedCols)
  }
}
