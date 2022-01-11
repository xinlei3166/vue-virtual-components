import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    index: { type: Number, required: true },
    row: { type: String, required: true },
    column: { type: Object, required: true }
  },
  setup(props, { slots }) {
    return () => <>{props.row}</>
  }
})
