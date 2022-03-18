import type { CSSProperties } from 'vue'
import { pxfy, depx } from 'seemly'
import type {
  TableColumn,
  SortOrder,
  SortOrderFlag,
  ColumnKey
} from '../interface'
import { formatLength } from './formatLength'

export const selectionColWidth = 40
export const expandColWidth = 40

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
  if (col.type === 'selection') return '__vt_selection__'
  if (col.type === 'expand') return '__vt_expand__'
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
