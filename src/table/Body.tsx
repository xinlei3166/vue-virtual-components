import { defineComponent, ref, inject, computed, VNode, PropType } from 'vue'
import { VirtualList } from 'vueuc'
import { ColItem } from '../hooks/useGroupHeader'
import Cell from './Cell'
import {
  tableInjectionKey,
  InternalRowData,
  RowKey,
  TmNode
} from '../interface'

type RowInfo = {
  striped: boolean
  tmNode: TmNode
  key: RowKey
}

const VirtualListItemWrapper = defineComponent({
  props: {
    id: {
      type: String,
      required: true
    },
    cols: {
      type: Array as PropType<ColItem[]>,
      required: true
    }
  },
  setup(props, { slots }) {
    return () => (
      <table class="vue-virtual-table-table">
        <colgroup>
          {props.cols.map(col => (
            <col key={col.key} style={col.style} />
          ))}
        </colgroup>
        <tbody class="vue-virtual-table-tbody" data-n-id={props.id}>
          {slots.default?.()}
        </tbody>
      </table>
    )
  }
})

const renderRow = (row: InternalRowData, index: any): VNode => {
  const { tmNode, key: rowKey } = row

  return (
    <tr class="vue-virtual-table-tr">
      <td class="vue-virtual-table-td vue-virtual-table-td--fixed-left">
        <Cell index={index} row={'ID'} column={{}} />
      </td>
      <td class="vue-virtual-table-td">
        <Cell index={index} row={'姓名'} column={{}} />
      </td>
      <td class="vue-virtual-table-td">
        <Cell index={index} row={'年龄'} column={{}} />
      </td>
      <td class="vue-virtual-table-td">
        <Cell index={index} row={'爱好'} column={{}} />
      </td>
      <td class="vue-virtual-table-td">
        <Cell index={index} row={'时间'} column={{}} />
      </td>
      <td class="vue-virtual-table-td">
        <Cell index={index} row={'操作'} column={{}} />
      </td>
    </tr>
  )
}

export default defineComponent({
  setup(props) {
    const virtualListRef = ref()

    const allItems = Array.from(Array(99).keys()).map(i => ({
      height: i % 2 === 0 ? 42 : 84,
      size: i % 2 === 0 ? 'small' : 'large'
    }))

    const {
      slots,
      rows,
      cols,
      componentId,
      mergedData: _mergedData
    } = inject(tableInjectionKey)!

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

    return () => (
      <div class="vue-virtual-table-body" style={{ maxHeight: '300px' }}>
        <VirtualList
          ref={virtualListRef}
          items={displayedData.value}
          itemSize={55}
          visibleItemsTag={VirtualListItemWrapper}
          visibleItemsProps={{
            id: componentId,
            cols
          }}
          showScrollbar={true}
          itemResizable
        >
          {{
            default: ({ item, index }: any) => renderRow(item, index)
          }}
        </VirtualList>
      </div>
    )
  }
})
