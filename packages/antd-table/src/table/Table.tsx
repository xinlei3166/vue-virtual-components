import {
  defineComponent,
  provide,
  inject,
  ref,
  computed,
  watch,
  nextTick,
  onMounted,
  watchEffect
} from 'vue'
import type { CSSProperties } from 'vue'
import { createId, pxfy } from 'seemly'
import { createTreeMate } from 'treemate'
import type {
  InternalRowData,
  RowKey,
  ColumnKey,
  TmNode,
  InternalTableRef,
  InternalTableHeaderRef,
  InternalTableBodyRef,
  TableSelectionColumn
} from '../types'
import { tableProps } from '../types'
import { tableInjectionKey } from '../types'
import { useRowSelection } from '../hooks/useRowSelection'
import { useGroupHeader } from '../hooks/useGroupHeader'
import { useSorter } from '../hooks/useSorter'
import { useLayoutState } from '../hooks/useFrame'
import { useScroll } from '../hooks/useScroll'
import { useCheck } from '../hooks/useCheck'
import TableHeader from './Header'
import TableBody from './Body'
import {
  getTargetScrollBarSize,
  validateValue,
  isVisible,
  getColsKey
} from '../utils'
import { configProviderInjectionKey, defaultConfigProvider } from '../config'
import Spin from 'ant-design-vue/es/spin'

const Table = defineComponent({
  props: tableProps,
  emits: ['change'],
  setup(props, { emit, slots, attrs, expose }) {
    // ====================== Customize ======================
    const configProvider = inject(
      configProviderInjectionKey,
      defaultConfigProvider
    )
    const prefixCls = computed(() => configProvider.getPrefixCls('table'))

    const getRowKey = () =>
      typeof props.rowKey === 'function'
        ? props.rowKey
        : (row: InternalRowData) => row[props.rowKey as string] as RowKey
    const getRowClassName = () =>
      typeof props.rowClassName === 'function'
        ? props.rowClassName
        : (row: InternalRowData) => props.rowClassName as string

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

    // ====================== RowSelection ======================
    const { mergedColumns, mergedRowSelection } = useRowSelection(props)

    // ====================== GroupHeader ======================
    const { rows, cols, dataRelatedCols } = useGroupHeader(props, {
      mergedColumns
    })

    // ====================== selectionColumn ======================
    const selectionColumn = computed<TableSelectionColumn | null>(() => {
      const getSelectionColumn = (
        cols: typeof props.columns
      ): TableSelectionColumn | null => {
        for (let i = 0; i < cols.length; ++i) {
          const col = cols[i]
          if ('children' in col) {
            return getSelectionColumn(col.children)
          } else if (col.type === 'selection') {
            return col
          }
        }
        return null
      }
      return getSelectionColumn(mergedColumns.value)
    })

    // ====================== TreeMate ======================
    const treeMate = computed(() => {
      return createTreeMate<InternalRowData>(props.data, {
        ignoreEmptyChildren: true,
        getKey: getRowKey(),
        getChildren: rowData => rowData[props.childrenColumnName],
        getDisabled: rowData => {
          return !!selectionColumn.value?.disabled?.(rowData)
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
      clearSorter,
      sort,
      sortedData: mergedData,
      mergedSortState,
      deriveNextSorter
    } = useSorter(props, {
      dataRelatedCols,
      filteredData
    })
    const rawMergedData = computed<InternalRowData[]>(() => {
      return mergedData.value.map(tmNode => tmNode.rawNode)
    })

    watch(mergedData, () => {
      nextTick(() => {
        const el = document.querySelector('.v-vl--show-scrollbar') as any
        if (!el) return
        hasScrollbar.value =
          el.scrollHeight > el.clientHeight || el.offsetHeight > el.clientHeight
      })
    })

    // ====================== Check ======================
    const {
      doCheckAll,
      doUncheckAll,
      doCheckInvert,
      doCheck,
      doUncheck,
      headerCheckboxDisabled,
      someRowsChecked,
      allRowsChecked,
      mergedCheckedRowKeySet,
      mergedInderminateRowKeySet
    } = useCheck(props, {
      mergedRowSelection,
      selectionColumn,
      mergedData,
      treeMate
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
      prefixCls,
      mergedColumns
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

    // ====================== Events ======================
    const onChange = changeEventInfo => {
      emit('change', {
        ...changeEventInfo,
        currentDataSource: rawMergedData.value
      })
    }

    // ====================== Provide ======================
    const provideValue = {
      // override props
      rowKey: getRowKey(),
      rowClassName: getRowClassName(),

      // current
      props,
      prefixCls,
      slots,
      componentId: createId(),
      rows,
      cols,
      treeMate,
      mergedData,
      rawMergedData,
      mergedSortState,
      deriveNextSorter,
      scrollbarSize,
      hasScrollbar,

      // useCheck
      mergedRowSelection,
      doCheckAll,
      doUncheckAll,
      doCheckInvert,
      doCheck,
      doUncheck,
      headerCheckboxDisabled,
      someRowsChecked,
      allRowsChecked,
      mergedCheckedRowKeySet,
      mergedInderminateRowKeySet,

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
      handleTableHeaderScroll,

      //events
      onChange
    }
    console.log('provideValue', provideValue)
    provide(tableInjectionKey, provideValue)

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
          },
          attrs.class
        ]}
      >
        <TableHeader ref={headerRef} />
        <TableBody ref={bodyRef} onResize={onBodyResize} />
      </div>
    )
  }
})

export default defineComponent({
  name: 'VirtualTable',
  inheritAttrs: false,
  props: tableProps,
  setup(props, { slots, attrs, expose }) {
    const configProvider = inject(
      configProviderInjectionKey,
      defaultConfigProvider
    )
    const prefixCls = ref(configProvider.getPrefixCls('table'))

    const tableRef = ref()

    // ====================== Expose ======================
    expose({ ...tableRef.value })

    // ====================== Render ======================
    return () => (
      <Spin class={`${prefixCls.value}-spin`} spinning={props.loading}>
        <Table ref={tableRef} {...props} {...attrs} v-slots={{ ...slots }} />
      </Spin>
    )
  }
})
