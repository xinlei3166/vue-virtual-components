import type {
  VNode,
  Slots,
  VNodeChild,
  Ref,
  ComputedRef,
  reactive,
  InjectionKey,
  ToRefs,
  CSSProperties,
  PropType,
  ExtractPropTypes,
  TdHTMLAttributes
} from 'vue'
import type { TooltipProps } from 'ant-design-vue'
import type { TreeNode, TreeMate } from 'treemate'
import type { RowItem, ColItem } from '../hooks/useGroupHeader'

export const tableProps = {
  prefixCls: { type: String as PropType<string>, default: undefined },
  tableStyle: { type: String as PropType<TableStyle>, default: 'antd' },
  childrenColumnName: { type: String, default: 'children' },
  bordered: { type: Boolean as PropType<boolean>, default: false },
  columns: { type: Array as PropType<TableColumns>, default: () => [] },
  data: { type: Array as PropType<RowData[]>, default: () => [] },
  loading: { type: Boolean, default: false },
  locale: {
    type: Object as PropType<Locale>,
    default: () => ({
      emptyText: '暂无数据',
      selectionNone: '清空所有',
      selectionInvert: '反选当页',
      selectionAll: '全选所有',
      triggerDesc: '点击降序',
      triggerAsc: '点击升序',
      cancelSort: '取消排序'
    })
  },
  rowKey: {
    type: [String, Function] as PropType<RowKey | CreateRowKey>,
    default: 'id'
  },
  rowClassName: [String, Function] as PropType<
    RowClassName | CreateRowClassName
  >,
  rowSelection: {
    type: Object as PropType<RowSelection>,
    default: () => undefined
  },
  getPopupContainer: {
    type: Function as PropType<GetPopupContainer>,
    default: undefined
  },
  scroll: Object as PropType<Scroll>,
  showSorterTooltip: [Boolean, Object] as PropType<boolean | TooltipProps>,
  size: { type: String as PropType<Size>, default: 'default' },
  tableLayout: { type: String as PropType<TableLayout>, default: 'fixed' },
  customHeaderRow: Function as PropType<CustomHeaderRow>,
  customRow: Function as PropType<CustomRow>,
  onSort: Function as PropType<OnSort>
}

export type GetPopupContainer = (triggerNode: HTMLElement) => HTMLElement

export type TableProps = ExtractPropTypes<typeof tableProps>

export type TableStyle = 'antd' | 'antd2'
export type Size = 'default' | 'middle' | 'small'
export type TableLayout = 'auto' | 'fixed'

export type AdditionalProps = TdHTMLAttributes & {
  colSpan?: number
  rowSpan?: number
}

export interface Locale {
  filterTitle?: string
  filterConfirm?: any
  filterReset?: any
  filterEmptyText?: any
  filterCheckall?: any
  filterSearchPlaceholder?: any
  emptyText?: any | (() => any)
  selectionNone?: any
  selectionInvert?: any
  selectionAll?: any
  sortTitle?: string
  expand?: string
  collapse?: string
  triggerDesc?: string
  triggerAsc?: string
  cancelSort?: string
}

export interface InternalRowData {
  [key: string]: unknown
}

export type ColumnKey = string | number
export type RowClassName = string
export type RowKey = string | number
export type RowData = Record<string, any>
export type SortOrderFlag = 1 | -1 | 0
export type CreateRowKey<T = InternalRowData> = (row: T) => RowKey
export type CreateRowClassName<T = InternalRowData> = (
  row: T,
  index: number
) => RowClassName

export type TmNode = TreeNode<InternalRowData>

export type CustomHeaderRow = (column: TableColumn, index: number) => void
export type CustomRow<T = InternalRowData> = (row: T, index: number) => void

export type SelectionItemSelectFn = (currentRowKeys: RowKey[]) => void
export interface SelectionItem {
  key?: string
  text?: string | VNode
  onSelect?: SelectionItemSelectFn
}
export const SELECTION_ALL = 'SELECT_ALL'
export const SELECTION_INVERT = 'SELECT_INVERT'
export const SELECTION_NONE = 'SELECT_NONE'
export type INTERNAL_SELECTION_ITEM =
  | SelectionItem
  | typeof SELECTION_ALL
  | typeof SELECTION_INVERT
  | typeof SELECTION_NONE

export interface RowSelection<T = InternalRowData> {
  checkStrictly?: boolean
  columnTitle?: string | VNode
  columnWidth?: string | number
  fixed?: boolean
  getCheckboxProps?: (row: T) => void
  hideDefaultSelections?: boolean
  hideSelectAll?: boolean
  preserveSelectedRowKeys?: boolean
  selectedRowKeys?: Array<RowKey>
  selections?: boolean | INTERNAL_SELECTION_ITEM[]
  type?: 'checkbox' | 'radio'
  onChange?: (selectedRowKeys: Array<RowKey>, selectedRows: Array<T>) => void
  onSelect?: (
    row: T,
    selected: boolean,
    selectedRows: Array<T>,
    nativeEvent: Event
  ) => void
  onSelectAll?: (
    selected: boolean,
    selectedRows: Array<T>,
    changeRows: Array<T>
  ) => void
  onSelectInvert?: (selectedRows: Array<T>) => void
  onSelectNone?: () => void
}

export interface Scroll {
  x?: string | number | true
  y?: string | number
}

export type CustomHeaderCell = (column: TableColumn) => AdditionalProps

export type CustomCell = (column: TableColumn) => Record<string, any>

export type CustomRender<T = InternalRowData> = (props: {
  text: any
  row: T
  record: T
  index: number
  column: TableColumn
}) => VNodeChild

export type CompareFn<T = InternalRowData> = (a: T, b: T) => number
export type Sorter<T = InternalRowData> = CompareFn<T> | SorterMultiple<T>
export interface SorterMultiple<T = InternalRowData> {
  multiple: number
  compare?: CompareFn<T> | 'default'
}
export type SortOrder = 'ascend' | 'descend' | false

export const ASCEND = 'ascend'
export const DESCEND = 'descend'

export interface CommonColumnInfo {
  className?: string
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
  width?: number
  minWidth?: number
  colSpan?: never
  // ellipsis?: Ellipsis
}

export type TableColumnTitle =
  | string
  | ((column: TableBaseColumn) => VNodeChild)

export type TableExpandColumnTitle =
  | string
  | ((column: TableExpandColumn) => VNodeChild)

export type TableColumnGroupTitle =
  | string
  | ((column: TableColumnGroup) => VNodeChild)

export type TableColumnGroup<T = InternalRowData> = {
  title: TableColumnGroupTitle
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
} & CommonColumnInfo

export type TableBaseColumn<T = InternalRowData> = {
  colSpan?: (row: T, index: number) => number
  rowSpan?: (row: T, index: number) => number
  titleColSpan?: number
  type?: never
  dataIndex?: ColumnKey
  key: ColumnKey
  title: TableColumnTitle
  customRender?: CustomRender
  sorter?: boolean | Sorter<T> | 'default'
  sortOrder?: SortOrder
  showSorterTooltip?: boolean | TooltipProps
  customCell?: CustomCell
  customHeaderCell?: CustomHeaderCell
} & CommonColumnInfo

export type TableSelectionColumn<T = InternalRowData> = {
  type: 'selection'
  multiple?: boolean
  disabled?: (row: T) => boolean

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
} & CommonColumnInfo

export interface TableExpandColumn<T = InternalRowData>
  extends Omit<TableSelectionColumn<T>, 'type' | 'title'> {
  type: 'expand'
  title?: TableExpandColumnTitle
}

export type TableColumn<T = InternalRowData> =
  | TableColumnGroup<T>
  | TableBaseColumn<T>
  | TableSelectionColumn<T>
  | TableExpandColumn<T>

export type TableColumns<T = InternalRowData> = Array<TableColumn<T>>

export type TableInjection = {
  props: TableProps
  prefixCls: Ref<string>
  slots: Slots
  componentId: string
  rows: Ref<RowItem[][]>
  cols: Ref<ColItem[]>
  treeMate: Ref<TreeMate<InternalRowData, InternalRowData, InternalRowData>>
  mergedData: ComputedRef<TmNode[]>
  rawMergedData: ComputedRef<InternalRowData[]>
  mergedSortState: ComputedRef<SortState | null>
  deriveNextSorter: (sorter: SortState | null) => void
  scrollbarSize: Ref<{ width: number; height: number }>
  hasScrollbar: Ref<boolean | undefined>

  // useCheck
  mergedRowSelection: ComputedRef<RowSelection>
  doUncheckAll: (checkWholeTable?: boolean) => void
  doCheckInvert: (checkWholeTable?: boolean) => void
  doCheckAll: (checkWholeTable?: boolean) => void
  doCheck: (
    rowKey: RowKey | RowKey[],
    single: boolean,
    rowInfo: RowData,
    nativeEvent: MouseEvent
  ) => void
  doUncheck: (
    rowKey: RowKey | RowKey[],
    rowInfo: RowData,
    nativeEvent: MouseEvent
  ) => void
  headerCheckboxDisabled: Ref<boolean>
  someRowsChecked: Ref<boolean>
  allRowsChecked: Ref<boolean>
  mergedCheckedRowKeySet: Ref<Set<RowKey>>
  mergedInderminateRowKeySet: Ref<Set<RowKey>>

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

  // override tableProps
  rowKey: CreateRowKey
  rowClassName: CreateRowClassName

  // events
  onChange: (changeEventInfo: ChangeEventInfo) => void
}

export const tableInjectionKey: InjectionKey<TableInjection> = Symbol(
  '@vue-virtual-components/antd-table'
)

export interface ChangeEventInfo {
  sorter: SortState
  currentDataSource: RowData[]
}

export interface SortState {
  columnKey: ColumnKey
  order: SortOrder
  sorter: Sorter | boolean | 'default'
  field: ColumnKey
  column: TableColumn
  // column columnKey field order
}

export type OnSort = (sortState: SortState) => void

export type OnUpdateSorterImpl = (
  sortState: SortState | SortState[] | null
) => void

export interface ScrollTo {
  (x: number, y: number): void
  (options: { left?: number; top?: number; behavior?: ScrollBehavior }): void
}

export type InternalTableRef = {
  getHeaderElement: () => HTMLElement | null
  getBodyElement: () => HTMLElement | null
  getTableElement: () => HTMLElement | null
  scrollTo: ScrollTo
}

export interface InternalTableBodyRef {
  getScrollContainer: () => HTMLElement | null
  getScrollContent: () => HTMLElement | null
  scrollTo: ScrollTo
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
