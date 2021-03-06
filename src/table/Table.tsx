import {
  defineComponent,
  provide,
  ref,
  computed,
  watch,
  nextTick,
  onMounted,
  toRefs,
  watchEffect
} from 'vue'
import type { PropType, ExtractPropTypes, CSSProperties } from 'vue'
import { reactivePick } from '@vueuse/core'
import { createId, pxfy } from 'seemly'
import { createTreeMate } from 'treemate'
import type {
  TableStyle,
  RowData,
  RowKey,
  CreateRowKey,
  TableColumns,
  ColumnKey,
  Scroll,
  Size,
  TableLayout,
  CustomHeaderRow,
  CustomRow,
  Locale,
  InternalRowData,
  OnSort,
  TmNode,
  InternalTableRef,
  InternalTableHeaderRef,
  InternalTableBodyRef
} from '../interface'
import { tableInjectionKey } from '../interface'
import { useGroupHeader } from '../hooks/useGroupHeader'
import { useSorter } from '../hooks/useSorter'
import { useLayoutState } from '../hooks/useFrame'
import { useScroll } from '../hooks/useScroll'
import TableHeader from './Header'
import TableBody from './Body'
import '../styles/index.less'
import {
  getTargetScrollBarSize,
  validateValue,
  isVisible,
  getColsKey
} from '../utils'

const prefixCls = ref('vuevt')

export const tableProps = {
  tableStyle: { type: String as PropType<TableStyle>, default: 'antd' },
  childrenKey: { type: String, default: 'children' },
  bordered: Boolean as PropType<boolean>,
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
  scroll: Object as PropType<Scroll>,
  size: { type: String as PropType<Size>, default: 'default' },
  tableLayout: { type: String as PropType<TableLayout>, default: 'fixed' },
  customHeaderRow: Function as PropType<CustomHeaderRow>,
  customRow: Function as PropType<CustomRow>,
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

    const hasScrollbar = ref<boolean>()
    const scrollbarSize = ref<{ width: number; height: number }>({
      width: 0,
      height: 0
    })

    onMounted(() => {
      const el = document.querySelector('.v-vl--show-scrollbar') as any
      // set scrollbarSize
      scrollbarSize.value = getTargetScrollBarSize(el)
    })

    // ====================== GroupHeader ======================
    const { rows, cols, relatedCols } = useGroupHeader(props)

    // ====================== TreeMate ======================
    const treeMate = computed(() => {
      return createTreeMate<InternalRowData>(props.data, {
        ignoreEmptyChildren: true,
        getKey: getRowKey,
        getChildren: rowData => rowData[props.childrenKey],
        getDisabled: rowData => {
          // if (selectionColumn.value?.disabled?.(rowData)) {
          //   return true
          // }
          return false
        }
      })
    })

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

    watch(mergedData, () => {
      nextTick(() => {
        const el = document.querySelector('.v-vl--show-scrollbar') as any
        hasScrollbar.value =
          el.scrollHeight > el.clientHeight || el.offsetHeight > el.clientHeight
      })
    })

    // ====================== InternalTableRef ======================
    const tableRef = ref<InternalTableRef>({
      getHeaderElement,
      getBodyElement,
      getTableElement
    })
    const headerRef = ref<InternalTableHeaderRef>()
    const bodyRef = ref<InternalTableBodyRef>()

    function getHeaderElement(): HTMLElement | null {
      if (headerRef.value) {
        return headerRef.value.$el
      }
      return null
    }

    function getBodyElement(): HTMLElement | null {
      if (bodyRef.value) {
        return bodyRef.value.getScrollContainer()
      }
      return null
    }

    function getTableElement(): HTMLElement | null {
      if (bodyRef.value) {
        return bodyRef.value.getScrollContent()
          ?.firstChild as HTMLElement | null
      }
      return null
    }

    // ====================== Scroll ======================
    const fixHeader = computed(() => validateValue(props.scroll?.y))
    const horizonScroll = computed(() => validateValue(props.scroll?.x))
    const scrollXStyle = ref<CSSProperties>({})
    const scrollYStyle = ref<CSSProperties>({})
    const scrollTableStyle = ref<CSSProperties>({})
    const measureColWidth = computed(
      () => fixHeader.value || horizonScroll.value
    )
    const [colsWidths, updateColsWidths] = useLayoutState(
      new Map<ColumnKey, number>()
    )

    // Convert map to number width
    const colsKeys = computed(() => getColsKey(cols.value.map(c => c.column)))
    const colWidths = computed(() =>
      colsKeys.value.map(colKey => colsWidths.value.get(colKey) as number)
    )

    watchEffect(() => {
      if (fixHeader.value) {
        scrollYStyle.value = {
          maxHeight: pxfy(props.scroll?.y)
        }
      }

      if (horizonScroll.value) {
        scrollXStyle.value = { overflowX: 'auto' }
        // When no vertical scrollbar, should hide it
        if (!fixHeader.value) {
          scrollYStyle.value = { overflowY: 'hidden' }
        }
        scrollTableStyle.value = {
          width:
            props.scroll?.x === true
              ? 'auto'
              : props.scroll?.x === 'max-content'
              ? 'max-content'
              : pxfy(props.scroll?.x),
          minWidth: '100%'
        }
      }
    })

    const selfRef = ref<HTMLDivElement>()
    const scrollPartRef = ref<'header' | 'body'>('body')
    const bodyWidth = ref<number | null>(null)

    const {
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
    } = useScroll(props, {
      tableRef,
      scrollPartRef,
      bodyWidth,
      hasScrollbar,
      scrollbarSize,
      colsWidths,
      prefixCls
    })

    const fixedStateInitialized = ref(
      !(leftFixedColumns.value.length || rightFixedColumns.value.length)
    )

    const onBodyResize = (entry: ResizeObserverEntry): void => {
      bodyWidth.value = entry.contentRect.width
      syncScrollState()
      if (!fixedStateInitialized.value) {
        fixedStateInitialized.value = true
      }
    }

    const onColResize = (colKey: ColumnKey, width: number) => {
      if (isVisible(selfRef.value!)) {
        updateColsWidths(widths => {
          if (widths.get(colKey) !== width) {
            const newWidths = new Map(widths)
            newWidths.set(colKey, width)
            return newWidths
          }
          return widths
        })
      }
    }

    // ====================== Provide ======================
    const propsKeys: any = ['scroll', 'tableLayout']
    provide(tableInjectionKey, {
      prefixCls,
      ...toRefs(reactivePick(props, propsKeys)),
      slots,
      componentId: createId(),
      rows,
      cols,
      mergedData,
      mergedSortState,
      scrollbarSize,
      hasScrollbar,
      // scroll
      fixHeader,
      horizonScroll,
      scrollXStyle,
      scrollYStyle,
      scrollTableStyle,
      measureColWidth,
      onColResize,
      colsWidths,
      colsKeys,
      colWidths,
      bodyWidth,
      scrollPartRef,
      // useScroll
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
    })

    // ====================== Expose ======================
    expose({
      sort,
      clearSorter
    })

    // ====================== Render ======================
    return () => (
      <div
        ref={selfRef}
        class={[
          prefixCls.value,
          `${prefixCls.value}--${props.tableStyle}`,
          {
            [`${prefixCls.value}--middle`]: props.size === 'middle',
            [`${prefixCls.value}--small`]: props.size === 'small',
            [`${prefixCls.value}--bordered`]: props.bordered,
            [`${prefixCls.value}--fixed-header`]: fixHeader.value
          }
        ]}
      >
        <TableHeader ref={headerRef} />
        <TableBody ref={bodyRef} onResize={onBodyResize} />
      </div>
    )
  }
})
