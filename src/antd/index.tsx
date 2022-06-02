import { ref, defineComponent } from 'vue'
import { Spin } from 'ant-design-vue'
import Table, { tableProps } from '../table/Table'

export default defineComponent({
  props: tableProps,
  setup(props, { slots, attrs, expose }) {
    const tableRef = ref()

    // ====================== Expose ======================
    expose({ ...tableRef.value })

    // ====================== Render ======================
    return () => (
      <Spin spinning={props.loading}>
        <Table
          ref={tableRef}
          {...props}
          tableStyle="antd"
          {...attrs}
          v-slots={{ ...slots }}
        />
      </Spin>
    )
  }
})
