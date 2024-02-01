import { defineComponent, ref, inject, computed, watchEffect } from 'vue'
import type { VNode, PropType, CSSProperties } from 'vue'
import { VirtualList } from 'vueuc'
import { pxfy } from 'seemly'
import type { ColItem } from '../hooks/useGroupHeader'
import MeasureCell from './MeasureCell'
import Cell from './Cell'
import EmptyIcon from '../icons/empty'
import type { InternalRowData, RowKey, TmNode } from '../types'
import { tableInjectionKey } from '../types'
import { getColKey } from '../utils'
import { defaultConfigProvider } from '../config'

type RowInfo = {
  striped: boolean
  tmNode: TmNode
  key: RowKey
}

const VirtualListItemWrapper = defineComponent({
  props: {
    prefixCls: { type: String, required: true },
    id: { type: String, required: true },
    cols: { type: Array as PropType<ColItem[]>, required: true },
    scrollTableStyle: {
      type: Object as PropType<CSSProperties>,
      default: () => ({})
    },
    measureColWidth: { type: Boolean, default: false },
    onColResize: { type: Function, default: () => {} },
    tableLayout: {
      type: String as PropType<CSSProperties['tableLayout']>,
      default: 'fixed'
    }
  },
  setup(props, { slots }) {
    return () => (
      <table
        class={`${props.prefixCls}-table`}
        style={{ ...props.scrollTableStyle, tableLayout: props.tableLayout }}
      >
        <colgroup>
          {props.cols.map(col => (
            <col key={col.key} style={col.style} />
          ))}
        </colgroup>
        <tbody class={`${props.prefixCls}-tbody`} data-vuevt-id={props.id}>
          {props.measureColWidth && (
            <tr
              aria-hidden="true"
              class={`${props.prefixCls}-tr--measure`}
              style={{ height: 0, fontSize: 0 }}
            >
              {props.cols.map((col, colIndex) => {
                const { column } = col
                const colKey = getColKey(col as any)
                return (
                  <MeasureCell
                    colKey={colKey}
                    onColResize={props.onColResize as any}
                  />
                )
              })}
            </tr>
          )}
          {slots.default?.()}
        </tbody>
      </table>
    )
  }
})

export default defineComponent({
  props: {
    onResize: Function as PropType<(e: ResizeObserverEntry) => void>
  },
  setup(props, { expose }) {
    const virtualListRef = ref()

    // ====================== Inject ======================
    const {
      rowClassName: createRowClassName,
      locale,
      prefixCls,
      tableLayout,
      slots,
      rows,
      cols,
      componentId,
      mergedData: _mergedData,
      scrollYStyle,
      scrollTableStyle,
      measureColWidth,
      onColResize,
      leftActiveFixedColKey,
      rightActiveFixedColKey,
      fixedColumnLeftMap,
      fixedColumnRightMap,
      handleTableBodyScroll
    } = inject(tableInjectionKey)!

    // ====================== Data ======================
    const mergedData = computed<RowInfo[]>(() => {
      const striped = false
      return _mergedData.value.map(
        (tmNode, index): RowInfo => ({
          tmNode,
          key: tmNode.key as RowKey,
          striped: striped ? index % 2 === 1 : false
        })
      )
    })

    const displayedData = mergedData

    // ====================== RenderRow ======================
    const renderRow = (row: RowInfo, rowIndex: any): VNode => {
      const { tmNode, key: rowKey } = row
      const { rawNode: rowData } = tmNode
      const rowClassName = createRowClassName(rowData, rowIndex)

      return (
        <tr class={[`${prefixCls.value}-tr`, rowClassName]}>
          {cols.value.map((col, colIndex) => {
            const { column } = col
            const colKey = getColKey(col as any)
            return (
              <td
                class={[
                  `${prefixCls.value}-td`,
                  column.fixed &&
                    `${prefixCls.value}-td--fixed-${column.fixed}`,
                  {
                    [`${prefixCls.value}-td--fixed-left--last`]:
                      leftActiveFixedColKey.value === colKey,
                    [`${prefixCls.value}-td--fixed-right--last`]:
                      rightActiveFixedColKey.value === colKey
                  }
                ]}
                style={{
                  textAlign: column.align,
                  left: pxfy(fixedColumnLeftMap.value[colKey]?.start),
                  right: pxfy(fixedColumnRightMap.value[colKey]?.start)
                }}
                key={colKey}
                data-col-key={colKey}
              >
                <Cell index={rowIndex} row={rowData} column={column} />
              </td>
            )
          })}
        </tr>
      )
    }

    // ====================== Expose ======================
    function virtualListContainer(): HTMLElement {
      return virtualListRef.value?.listElRef as HTMLElement
    }

    function virtualListContent(): HTMLElement {
      return virtualListRef.value?.itemsElRef as HTMLElement
    }

    // const emptyRef = ref<HTMLElement | null>(null)
    // const empty = useMemo(() => paginatedDataRef.value.length === 0)
    // const shouldDisplaySomeTablePartRef = useMemo(
    //   () => props.showHeader || !empty.value
    // )

    function getScrollContainer(): HTMLElement | null {
      // todo handle empty
      // if (!shouldDisplaySomeTablePartRef.value) {
      // return emptyRef.value ?? null
      // }
      return virtualListContainer() ?? null
    }

    function getScrollContent(): HTMLElement | null {
      // todo handle empty
      // if (!shouldDisplaySomeTablePartRef.value) {
      // return emptyRef.value ?? null
      // }
      return virtualListContent() ?? null
    }

    expose({ getScrollContainer, getScrollContent })

    // ====================== Render ======================
    const empty = computed(() => displayedData.value.length === 0)
    const configProvider = inject('configProvider', defaultConfigProvider)
    const emptyPrefixCls = ref(configProvider.getPrefixCls('empty'))
    const emptyText = computed(() => locale.value.emptyText)

    return () =>
      empty.value ? (
        <div class={`${prefixCls.value}-empty`}>
          <div
            class={[
              `${emptyPrefixCls.value}`,
              `${emptyPrefixCls.value}-normal`
            ]}
          >
            <div class={`${emptyPrefixCls.value}-image`}>
              <EmptyIcon class={`${emptyPrefixCls.value}-img-simple`} />
            </div>
            <p class={`${emptyPrefixCls.value}-description`}>
              {emptyText.value}
            </p>
          </div>
        </div>
      ) : (
        <div
          class={`${prefixCls.value}-body`}
          style={{ maxHeight: scrollYStyle.value.maxHeight }}
        >
          <VirtualList
            ref={virtualListRef}
            items={displayedData.value}
            itemSize={28}
            visibleItemsTag={VirtualListItemWrapper}
            visibleItemsProps={{
              prefixCls: prefixCls.value,
              id: componentId,
              cols: cols.value,
              scrollTableStyle: scrollTableStyle.value,
              measureColWidth: measureColWidth.value,
              onColResize,
              tableLayout: tableLayout.value!
            }}
            showScrollbar={true}
            onResize={(e: ResizeObserverEntry) => props.onResize?.(e)}
            onScroll={(e: Event) => handleTableBodyScroll(e)}
            itemResizable={true}
          >
            {{
              default: ({ item, index }: any) => renderRow(item, index)
            }}
          </VirtualList>
        </div>
      )
  }
})
