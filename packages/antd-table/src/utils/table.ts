import type { CSSProperties } from 'vue'
import { depx } from 'seemly'
import type {
  ColumnKey,
  SortOrder,
  SortOrderFlag,
  SortState,
  TableBaseColumn,
  TableColumn
} from '../types'
import { formatLength } from './formatLength'

export const selectionColWidth = 32
export const expandColWidth = 48

export function getNumberColWidth(col: TableColumn): number | undefined {
  if (col.type === 'selection') return selectionColWidth
  if (col.type === 'expand') return expandColWidth
  if ('children' in col) return undefined
  return depx(col.width as any)
}

function getStringWidth(col: TableColumn, key = 'width'): string | undefined {
  if (col.type === 'selection') return formatLength(selectionColWidth)
  if (col.type === 'expand') return formatLength(expandColWidth)
  if ('children' in col) return undefined
  // @ts-ignore
  return formatLength(col[key])
}

export function getStringColWidth(col: TableColumn): string | undefined {
  return getStringWidth(col, 'width')
}

export function getStringColMinWidth(col: TableColumn): string | undefined {
  return getStringWidth(col, 'minWidth')
}

export function getColKey(col: TableColumn): ColumnKey {
  if (col.type === 'selection') return '__vuevct_table_selection__'
  if (col.type === 'expand') return '__vuevct_table_expand__'
  return col.key
}

export function getColsKey(cols: TableColumn[]): ColumnKey[] {
  return cols.map(col => getColKey(col as any))
}

export function createCustomWidthStyle(column: TableColumn): CSSProperties {
  const width = getStringColWidth(column)
  const minWidth = getStringColMinWidth(column)
  return { width, minWidth }
}

export function getFlagOfOrder(sortOrder: SortOrder): SortOrderFlag {
  if (sortOrder === 'ascend') return 1
  else if (sortOrder === 'descend') return -1
  return 0
}

export function isColumnSortable(column: TableColumn): boolean {
  if ('children' in column) return false
  return !!column.sorter
}

export function isColumnSorting(
  column: TableColumn,
  mergedSortState: SortState[]
): boolean {
  return (
    mergedSortState.find(
      state =>
        state.columnKey === (column as TableBaseColumn).key && state.order
    ) !== undefined
  )
}

export function getNextOrderOf(order: SortOrder): SortOrder {
  if (!order) return 'ascend'
  else if (order === 'ascend') return 'descend'
  return false
}

export const genSortState = (
  column: TableColumn,
  sortState: SortState = {}
) => {
  return {
    columnKey: column.key,
    sorter: column.sorter,
    order: column.sortOrder!,
    field: column.dataIndex,
    column,
    ...sortState
  }
}

export function createNextSorter(
  column: TableBaseColumn,
  currentSortState: SortState | null
): SortState | null {
  if (column.sorter === undefined) return null
  if (currentSortState === null || currentSortState.columnKey !== column.key) {
    return genSortState(column, {
      columnKey: column.key,
      sorter: column.sorter,
      order: getNextOrderOf(false)
    })
  } else {
    return {
      ...currentSortState,
      order: getNextOrderOf(currentSortState.order)
    }
  }
}
