import { ref, defineComponent } from 'vue'
import Table, { tableProps } from '../table/Table'

export default defineComponent({
  directives: {
    ElLoading: vLoading
  },
  props: tableProps,
  setup(props, { slots, attrs, expose }) {
    const tableRef = ref()

    // ====================== Expose ======================
    expose({ ...tableRef.value })

    // ====================== Render ======================
    return () => (
      <Table
        v-el-loading={props.loading}
        ref={tableRef}
        {...props}
        tableStyle="element"
        {...attrs}
        v-slots={{ ...slots }}
      />
    )
  }
})
