import { defineComponent, PropType } from 'vue'
import {
  TableStyle,
  RowData,
  RowKey,
  CreateRowKey,
  TableColumns,
  CustomHeaderRow,
  CustomRow
} from '../interface'
import TableHeader from './Header'
import TableBody from './Body'
import '../styles/index.less'

export const tableProps = {
  style: { type: String as PropType<TableStyle>, default: 'antd' },
  maxHeight: [Number, String] as PropType<string | number>,
  bordered: Boolean as PropType<boolean>,
  singleLine: { type: Boolean, default: true },
  columns: { type: Array as PropType<TableColumns>, default: () => [] },
  dataSource: { type: Array as PropType<RowData[]>, default: () => [] },
  loading: { type: Boolean, default: false },
  rowClassName: String as PropType<string>,
  rowKey: { type: [String, Function] as PropType<RowKey | CreateRowKey<any>>, default: 'id' },
  rowSelection: Object,
  customHeaderRow: Function as PropType<CustomHeaderRow>,
  customRow: Function as PropType<CustomRow>
}

export default defineComponent({
  props: tableProps,
  setup(props) {
    return () => (
      <div
        class={[
          'vue-virtual-table',
          'vue-virtual-table-' + props.style,
          {
            'vue-virtual-table-bordered': props.bordered,
            'vue-virtual-table-single-line': props.singleLine,
            'vue-virtual-table-fixed-header': true
          }
        ]}
      >
        <TableHeader />
        <TableBody />
      </div>
    )
  }
})
