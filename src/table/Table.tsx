import {
  defineComponent,
  PropType,
  ExtractPropTypes,
  provide,
  toRef,
  computed
} from 'vue'
import { createId } from 'seemly'
import { createTreeMate } from 'treemate'
import {
  TableStyle,
  RowData,
  RowKey,
  CreateRowKey,
  TableColumns,
  OnHeaderRow,
  OnRow,
  Locale,
  tableInjectionKey,
  InternalRowData,
  OnSort,
  TmNode
} from '../interface'
import { useGroupHeader } from '../hooks/useGroupHeader'
import { useSorter } from '../hooks/useSorter'
import TableHeader from './Header'
import TableBody from './Body'
import '../styles/index.less'

export const tableProps = {
  style: { type: String as PropType<TableStyle>, default: 'antd' },
  maxHeight: [Number, String] as PropType<string | number>,
  childrenKey: { type: String, default: 'children' },
  bordered: Boolean as PropType<boolean>,
  singleLine: { type: Boolean, default: true },
  columns: { type: Array as PropType<TableColumns>, default: () => [] },
  data: { type: Array as PropType<RowData[]>, default: () => [] },
  loading: { type: Boolean, default: false },
  locale: {
    type: Object as PropType<Locale>,
    default: () => ({
      emptyText: '暂无数据'
    })
  },
  rowClassName: String as PropType<string>,
  rowKey: {
    type: [String, Function] as PropType<RowKey | CreateRowKey<any>>,
    default: 'id'
  },
  rowSelection: Object,
  onHeaderRow: Function as PropType<OnHeaderRow>,
  onRow: Function as PropType<OnRow>,
  onSort: Function as PropType<OnSort>
}

export type TableProps = ExtractPropTypes<typeof tableProps>

export default defineComponent({
  props: tableProps,
  setup(props, { slots, expose }) {
    // ====================== Customize ======================
    const getRowKey = (
      props.rowKey === 'function'
        ? props.rowKey
        : (row: InternalRowData) => row[props.rowKey as string]
    ) as CreateRowKey

    // ====================== GroupHeader ======================
    const { rows, cols, relatedCols } = useGroupHeader(props)

    // ====================== TreeMate ======================
    const treeMate = computed(() => {
      const { childrenKey } = props
      return createTreeMate<InternalRowData>(props.data, {
        ignoreEmptyChildren: true,
        getKey: getRowKey,
        getChildren: rowData => rowData[childrenKey],
        getDisabled: rowData => {
          // if (selectionColumn.value?.disabled?.(rowData)) {
          //   return true
          // }
          return false
        }
      })
    })

    console.log(treeMate.value)

    // ====================== Filter ======================
    const filteredData = computed<TmNode[]>(() => {
      const { treeNodes: data } = treeMate.value
      return data || []
    })

    // ====================== Sorter ======================
    const {
      sortedData: mergedData,
      mergedSortState,
      sort,
      clearSorter
    } = useSorter(props, {
      relatedCols,
      filteredData
    })

    // ====================== Provide ======================
    provide(tableInjectionKey, {
      slots,
      componentId: createId(),
      rows,
      cols,
      mergedData,
      mergedSortState
    })

    // ====================== Expose ======================
    expose({
      sort,
      clearSorter
    })

    return () => (
      <div
        class={[
          'vue-virtual-table',
          'vue-virtual-table--' + props.style,
          {
            'vue-virtual-table--bordered': props.bordered,
            'vue-virtual-table--single-line': props.singleLine,
            'vue-virtual-table--fixed-header': true
          }
        ]}
      >
        <TableHeader />
        <TableBody />
      </div>
    )
  }
})
