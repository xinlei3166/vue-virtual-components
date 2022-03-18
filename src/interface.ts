import type {
  Slots,
  VNodeChild,
  Ref,
  ComputedRef,
  reactive,
  InjectionKey,
  ToRefs,
  CSSProperties
} from 'vue'
import type { TreeNode } from 'treemate'
import type { RowItem, ColItem } from './hooks/useGroupHeader'
import type { TableProps } from './table/Table'

export type TableStyle = 'antd2' | 'antd' | 'element'

export interface Locale {
  emptyText: string
}

export type ColumnKey = string | number
export type RowKey = string | number
export type RowData = Record<string, any>
export type CreateRowKey<T = InternalRowData> = (row: T) => RowKey
export type SortOrderFlag = 1 | -1 | 0

export interface InternalRowData {
  [key: string]: unknown
}

export type TmNode = TreeNode<InternalRowData>

export type CustomHeaderRow = (column: TableColumn, index: number) => void
export type CustomRow<T = InternalRowData> = (row: T, index: number) => void

export interface rowSelection {
  type: 'checkbox' | 'radio'
  selectedRowKeys: string[]
  onChange: (selectedRowKeys: string[], selectedRows: InternalRowData[]) => void
}

export interface Scroll {
  x?: string | number | true
  y?: string | number
}

export type Size = 'default' | 'middle' | 'small'
export type TableLayout = 'auto' | 'fixed'

export interface CommonColumnInfo {
  className?: string
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
  width?: number
  minWidth?: number
  colSpan?: never
  // ellipsis?: Ellipsis
}

export type TableColumnGroup<T = InternalRowData> = {
  title: string
  key: ColumnKey
  children: Array<TableBaseColumn<T>>

  // to suppress type error in utils
  type?: never
  dataIndex?: never
  sorter?: never
  sortOrder?: never
  colSpan?: never
  rowSpan?: never
  customCell?: never
  customHeaderCell?: never
  slots?: never
} & CommonColumnInfo

export interface RenderedCell<T = InternalRowData> {
  props?: Record<string, any>
  children?: any
}

export type customRender = (props: {
  text: any
  row: InternalRowData
  index: number
}) => RenderedCell

export type CompareFn<T = InternalRowData> = (a: T, b: T) => number
export type Sorter<T = InternalRowData> = CompareFn<T>
export type SortOrder = 'ascend' | 'descend' | false
export type CustomCell<T = InternalRowData> = (
  row: T,
  index: number,
  column: TableColumn
) => Record<string, any>
export type CustomHeaderCell<T = InternalRowData> = (
  row: T,
  index: number,
  column: TableColumn
) => Record<string, any>

export type TableBaseColumn<T = InternalRowData> = {
  colSpan?: (row: T, index: number) => number
  rowSpan?: (row: T, index: number) => number
  titleColSpan?: number
  type?: never
  dataIndex?: ColumnKey
  key: ColumnKey
  title: string
  customRender?: customRender | Slots
  sorter?: Sorter | boolean
  sortOrder?: SortOrder
  customCell?: CustomCell
  customHeaderCell?: CustomHeaderCell
  slots?: { customRender: string; title: string; [key: string]: string }
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
  customCell?: never
  customHeaderCell?: never
  slots?: never
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

export type TableInjection = {
  prefixCls: Ref<string>
  slots: Slots
  componentId: string
  rows: Ref<RowItem[][]>
  cols: Ref<ColItem[]>
  mergedData: ComputedRef<TmNode[]>
  mergedSortState: Ref<SortState | null>
  scrollbarSize: Ref<{ width: number; height: number }>
  hasScrollbar: Ref<boolean | undefined>
  // scroll
  fixHeader: ComputedRef<boolean>
  horizonScroll: ComputedRef<boolean>
  scrollXStyle: Ref<CSSProperties>
  scrollYStyle: Ref<CSSProperties>
  scrollTableStyle: Ref<CSSProperties>
  measureColWidth: ComputedRef<boolean>
  onColResize: (columnKey: ColumnKey, width: number) => void
  colsWidths: Ref<Map<ColumnKey, number>>
  colsKeys: ComputedRef<ColumnKey[]>
  colWidths: ComputedRef<number[]>
  bodyWidth: Ref<number | null>
  scrollPartRef: Ref<'header' | 'body'>
  // useScroll
  fixedColumnLeftMap: ComputedRef<
    Record<ColumnKey, { start: number; end: number } | undefined>
  >
  fixedColumnRightMap: ComputedRef<
    Record<ColumnKey, { start: number; end: number } | undefined>
  >
  fixedHeaderColumnRightMap: ComputedRef<
    Record<ColumnKey, { start: number; end: number } | undefined>
  >
  leftFixedColumns: ComputedRef<TableColumns>
  rightFixedColumns: ComputedRef<TableColumns>
  leftActiveFixedColKey: Ref<ColumnKey | null>
  leftActiveFixedChildrenColKeys: Ref<ColumnKey[]>
  rightActiveFixedColKey: Ref<ColumnKey | null>
  rightActiveFixedChildrenColKeys: Ref<ColumnKey[]>
  syncScrollState: (deltaX?: number, deltaY?: number) => void
  handleTableBodyScroll: (e: Event) => void
  handleTableHeaderScroll: (e: Event) => void
} & ToRefs<Partial<TableProps>>

export const tableInjectionKey: InjectionKey<TableInjection> = Symbol('table')

export interface SortState {
  column: TableColumn
  columnKey: ColumnKey
  field: ColumnKey
  order: SortOrder
  sorter: Sorter | boolean
}

export type OnSort = (sortState: SortState) => void

export type InternalTableRef = {
  getHeaderElement: () => HTMLElement | null
  getBodyElement: () => HTMLElement | null
  getTableElement: () => HTMLElement | null
}

export interface InternalTableBodyRef {
  getScrollContainer: () => HTMLElement | null
  getScrollContent: () => HTMLElement | null
}

export interface InternalTableHeaderRef {
  $el: HTMLElement | null
}

export type TableRef = {
  // filter: (filters: FilterState | null) => void
  // filters: (filters: FilterState | null) => void
  // clearFilters: () => void
  clearSorter: () => void
  // page: (page: number) => void
  sort: (columnKey: ColumnKey, order: SortOrder) => void
}
