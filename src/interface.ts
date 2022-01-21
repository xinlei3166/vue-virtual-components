import { Slots, VNodeChild, Ref, ComputedRef, InjectionKey } from 'vue'
import { TreeNode } from 'treemate'
import { RowItem, ColItem } from './hooks/useGroupHeader'

export type TableStyle = 'antd' | 'element'

export interface Locale {
  emptyText: string
}

export type ColumnKey = string | number
export type DataIndex = string | number
export type RowKey = string | number
export type RowData = Record<string, any>
export type CreateRowKey<T = InternalRowData> = (row: T) => RowKey
export type SortOrderFlag = 1 | -1 | 0

export interface InternalRowData {
  [key: string]: unknown
}

export type TmNode = TreeNode<InternalRowData>

export type OnHeaderRow = (column: TableColumn, index: number) => void
export type OnRow<T = InternalRowData> = (row: T, index: number) => void

export interface rowSelection {
  type: 'checkbox' | 'radio'
  selectedRowKeys: string[]
  onChange: (selectedRowKeys: string[], selectedRows: InternalRowData[]) => void
}

export interface CommonColumnInfo {
  className?: string
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
  width?: number
  colSpan?: never
  // ellipsis?: Ellipsis
}

export type TableColumnGroup<T = InternalRowData> = {
  title: string
  type?: never
  key: ColumnKey
  children: Array<TableBaseColumn<T>>

  // to suppress type error in utils
  dataIndex?: never
  sorter?: never
  sortOrder?: never
  colSpan?: never
  rowSpan?: never
} & CommonColumnInfo

export type CustomRender = (props: {
  text: any
  row: InternalRowData
  index: number
}) => VNodeChild

export type CompareFn<T = InternalRowData> = (a: T, b: T) => number
export type Sorter<T = InternalRowData> = CompareFn<T>
export type SortOrder = 'ascend' | 'descend' | false

export type TableBaseColumn<T = InternalRowData> = {
  colSpan?: (row: T, index: number) => number
  rowSpan?: (row: T, index: number) => number
  titleColSpan?: number
  type?: never
  dataIndex: DataIndex
  key: ColumnKey
  title: string
  customRender?: CustomRender | Slots
  sorter?: Sorter | boolean
  sortOrder?: SortOrder
  slots?: { customRender: string; [key: string]: string }
} & CommonColumnInfo

export type TableSelectionColumn<T = InternalRowData> = {
  type: 'selection'
  disabled?: (row: T) => boolean
  options?: any

  // to suppress type error in utils
  title?: never
  key?: never
  dataIndex?: never
  sorter?: never
  sortOrder?: never
  colSpan?: never
  rowSpan?: never
} & CommonColumnInfo

export interface TableExpandColumn<T = InternalRowData>
  extends Omit<TableSelectionColumn<T>, 'type'> {
  type: 'expand'
}

export type TableColumn<T = InternalRowData> =
  | TableColumnGroup<T>
  | TableBaseColumn<T>
  | TableSelectionColumn<T>
  | TableExpandColumn<T>

export type TableColumns<T = InternalRowData> = Array<TableColumn<T>>

export interface TableInjection {
  slots: Slots
  componentId: string
  rows: Ref<RowItem[][]>
  cols: Ref<ColItem[]>
  mergedData: ComputedRef<TmNode[]>
  mergedSortState: Ref<SortState | null>
}

export const tableInjectionKey: InjectionKey<TableInjection> = Symbol('table')

export interface SortState {
  column: TableColumn
  columnKey: ColumnKey
  field: DataIndex
  order: SortOrder
  sorter: Sorter | boolean
}

export type OnSort = (sortState: SortState) => void
