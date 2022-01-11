import { defineComponent, CSSProperties, reactive, onMounted } from 'vue'
import { measureScrollbar } from '../utils'

export default defineComponent({
  setup(props, { slots }) {
    const headStyle = reactive<CSSProperties>({})
    const prefixCls = 'vue-virtual-table'
    const scrollbarWidth = measureScrollbar({ direction: 'vertical' })
    const scrollbarWidthOfHeader = measureScrollbar({ direction: 'horizontal', prefixCls })

    // Add negative margin bottom for scroll bar overflow bug
    if (scrollbarWidthOfHeader > 0) {
      headStyle.marginBottom = `-${scrollbarWidthOfHeader}px`
      headStyle.paddingBottom = '0px'
      // https://github.com/ant-design/ant-design/pull/19986
      headStyle.minWidth = `${scrollbarWidth}px`
      // https://github.com/ant-design/ant-design/issues/17051
      headStyle.overflowX = 'scroll'
      headStyle.overflowY = scrollbarWidth === 0 ? 'hidden' : 'scroll'
    }

    onMounted(() => {
      if (!scrollbarWidth) return
      const el = document.querySelector('.v-vl--show-scrollbar') as any
      const hasScrollbar = el.scrollHeight > el.clientHeight || el.offsetHeight > el.clientHeight
      headStyle.overflowY = hasScrollbar ? 'scroll' : 'hidden'
    })

    return () => (
      <div
        class={['vue-virtual-table-header', { 'vue-virtual-table-hide-scrollbar': true }]}
        style={headStyle}
      >
        <table class="vue-virtual-table-table">
          <colgroup>
            <col style={{ minWidth: '200px' }} />
            <col style={{ minWidth: '200px' }} />
            <col style={{ minWidth: '200px' }} />
            <col style={{ minWidth: '200px' }} />
            <col style={{ minWidth: '200px' }} />
          </colgroup>
          <thead class="vue-virtual-table-thead">
            <tr class="vue-virtual-table-tr">
              <th class="vue-virtual-table-th vue-virtual-table-th--fixed-left">ID</th>
              <th class="vue-virtual-table-th">姓名</th>
              <th class="vue-virtual-table-th">年龄</th>
              <th class="vue-virtual-table-th">爱好</th>
              <th class="vue-virtual-table-th">时间</th>
            </tr>
          </thead>
        </table>
      </div>
    )
  }
})
