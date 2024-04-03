import { defineComponent, ref, inject, computed, watchEffect } from 'vue'
import type { VNode, PropType, CSSProperties } from 'vue'
import { VirtualList } from 'vueuc'
import { pxfy } from 'seemly'
import type { ColItem } from '../hooks/useGroupHeader'
import MeasureCell from './MeasureCell'
import Cell from './Cell'
import BodyCheckbox from './BodyCheckbox'
import BodyRadio from './BodyRadio'
import type { RowKey, TmNode, RowData } from '../types'
import { tableInjectionKey } from '../types'
import { getColKey, isColumnSorting } from '../utils'
import { warning } from '../utils/warning'
import { configProviderInjectionKey, defaultConfigProvider } from '../config'
import { useProvideHover } from '../context/HoverContext'

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

    // ====================== Function ======================
    function getRowInfo(key: RowKey): RowData | undefined {
      return treeMate.value.getNode(key)?.rawNode
    }

    let lastSelectedKey: string | number = ''
    function handleCheckboxUpdateChecked(
      tmNode: { key: RowKey },
      checked: boolean,
      shiftKey: boolean,
      nativeEvent: MouseEvent
    ): void {
      const rowInfo = getRowInfo(tmNode.key)
      if (!rowInfo) {
        warning(false, 'table', `fail to get row data with key ${tmNode.key}`)
        return
      }
      if (shiftKey) {
        const lastIndex = mergedData.value.findIndex(
          item => item.key === lastSelectedKey
        )
        if (lastIndex !== -1) {
          const currentIndex = mergedData.value.findIndex(
            item => item.key === tmNode.key
          )
          const start = Math.min(lastIndex, currentIndex)
          const end = Math.max(lastIndex, currentIndex)
          const rowKeysToCheck: RowKey[] = []
          mergedData.value.slice(start, end + 1).forEach(r => {
            if (!r.disabled) {
              rowKeysToCheck.push(r.key)
            }
          })
          if (checked) {
            doCheck(rowKeysToCheck, false, rowInfo, nativeEvent)
          } else {
            doUncheck(rowKeysToCheck, rowInfo, nativeEvent)
          }
          lastSelectedKey = tmNode.key
          return
        }
      }
      if (checked) {
        doCheck(tmNode.key, false, rowInfo, nativeEvent)
      } else {
        doUncheck(tmNode.key, rowInfo, nativeEvent)
      }
      lastSelectedKey = tmNode.key
    }

    function handleRadioUpdateChecked(
      tmNode: { key: RowKey },
      nativeEvent: MouseEvent
    ): void {
      const rowInfo = getRowInfo(tmNode.key)
      if (!rowInfo) {
        warning(false, 'table', `fail to get row data with key ${tmNode.key}`)
        return
      }
      doCheck(tmNode.key, true, rowInfo, nativeEvent)
    }

    // ====================== Provide ======================
    const startRow = ref(-1)
    const endRow = ref(-1)
    let timeoutId: any
    useProvideHover({
      startRow,
      endRow,
      onHover: (start, end) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          startRow.value = start
          endRow.value = end
        }, 100)
      }
    })

    // ====================== Inject ======================
    const {
      rowClassName: createRowClassName,
      props: tableProps,
      prefixCls,
      slots,
      rows,
      cols,
      componentId,
      treeMate,
      mergedData,
      scrollYStyle,
      scrollTableStyle,
      measureColWidth,
      onColResize,
      leftActiveFixedColKey,
      rightActiveFixedColKey,
      fixedColumnLeftMap,
      fixedColumnRightMap,
      handleTableBodyScroll,
      doCheck,
      doUncheck,
      mergedCheckedRowKeySet,
      mergedSortState
    } = inject(tableInjectionKey)!

    const configProvider = inject(
      configProviderInjectionKey,
      defaultConfigProvider
    )
    const renderEmpty = computed(() => configProvider.renderEmpty)

    // ====================== Data ======================
    const displayedData = computed<RowInfo[]>(() => {
      const striped = false
      return mergedData.value.map(
        (tmNode, index): RowInfo => ({
          tmNode,
          key: tmNode.key as RowKey,
          striped: striped ? index % 2 === 1 : false
        })
      )
    })

    // ====================== RenderRow ======================
    const renderRow = (row: RowInfo, rowIndex: any): VNode => {
      const { tmNode, key: rowKey } = row
      const { rawNode: rowData } = tmNode
      const rowClassName = createRowClassName(rowData, rowIndex)

      return (
        <tr
          class={[
            `${prefixCls.value}-tr`,
            rowClassName,
            {
              [`${prefixCls.value}-tr-selected`]:
                mergedCheckedRowKeySet.value.has(rowKey)
            }
          ]}
        >
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
                    [`${prefixCls.value}-td--selection`]:
                      column.type === 'selection',
                    [`${prefixCls.value}-td--hover`]: isColumnSorting(
                      column,
                      mergedSortState.value!
                    ),
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
                {column.type === 'selection' ? (
                  column.multiple === false ? (
                    <BodyRadio
                      key={`${rowIndex}-BodyRadio`}
                      row={rowData}
                      rowKey={rowKey}
                      disabled={tmNode.disabled}
                      onUpdateChecked={(checked: boolean, e) => {
                        handleRadioUpdateChecked(tmNode, e.nativeEvent)
                      }}
                    />
                  ) : (
                    <BodyCheckbox
                      key={`${rowIndex}-BodyCheckbox`}
                      row={rowData}
                      rowKey={rowKey}
                      disabled={tmNode.disabled}
                      onUpdateChecked={(checked: boolean, e) => {
                        handleCheckboxUpdateChecked(
                          tmNode,
                          checked,
                          e.nativeEvent.shiftKey,
                          e.nativeEvent
                        )
                      }}
                    />
                  )
                ) : (
                  <Cell index={rowIndex} row={rowData} column={column} />
                )}
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
    // const empty = useMemo(() => mergedData.value.length === 0)
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

    function scrollTo(arg0: any, arg1?: any) {
      virtualListRef.value?.scrollTo(arg0, arg1)
    }

    expose({ getScrollContainer, getScrollContent, scrollTo })

    // ====================== Render ======================
    const empty = computed(() => displayedData.value.length === 0)

    return () =>
      empty.value ? (
        slots.emptyText?.() || (
          <div class={`${prefixCls.value}-empty`}>
            {renderEmpty.value?.('Table', tableProps.locale.emptyText)}
          </div>
        )
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
              tableLayout: tableProps.tableLayout!
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
