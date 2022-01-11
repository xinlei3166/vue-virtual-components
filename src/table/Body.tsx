import { defineComponent, ref, VNode } from 'vue'
import { VirtualList } from 'vueuc'
import Cell from './Cell'

const VirtualListItemWrapper = defineComponent({
  setup(props, { slots }) {
    return () => (
      <table class="vue-virtual-table-table">
        <colgroup>
          <col style={{ minWidth: '200px' }} />
          <col style={{ minWidth: '200px' }} />
          <col style={{ minWidth: '200px' }} />
          <col style={{ minWidth: '200px' }} />
          <col style={{ minWidth: '200px' }} />
        </colgroup>
        <tbody class="vue-virtual-table-tbody">{slots.default?.()}</tbody>
      </table>
    )
  }
})

const renderRow = (data: any, index: any): VNode => {
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
    </tr>
  )
}

export default defineComponent({
  setup(props, { slots }) {
    const virtualListRef = ref()

    const allItems = Array.from(Array(99).keys()).map(i => ({
      height: i % 2 === 0 ? 42 : 84,
      size: i % 2 === 0 ? 'small' : 'large'
    }))

    return () => (
      <div class="vue-virtual-table-body" style={{ maxHeight: '300px' }}>
        <VirtualList
          ref={virtualListRef}
          items={allItems}
          itemSize={55}
          visibleItemsTag={VirtualListItemWrapper}
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
