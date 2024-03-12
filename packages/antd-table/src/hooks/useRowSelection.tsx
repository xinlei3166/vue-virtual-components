import type { ComputedRef, Ref } from 'vue'
import { computed } from 'vue'
import type { TableProps, TableColumn, TmNode, TableColumns } from '../types'

export function useRowSelection(props: TableProps) {
  const mergedRowSelection = computed(() => {
    return props.rowSelection || {}
  })

  const mergedColumns = computed<TableColumns>(() => {
    if (!props.rowSelection) return props.columns

    const cloneColumns = props.columns.slice()
    const nextColumn = cloneColumns[1] || {}
    const fixed = mergedRowSelection.value.fixed || nextColumn.fixed
    const getCheckboxProps = mergedRowSelection.value.getCheckboxProps
    const selectionColumn = {
      type: 'selection',
      multiple: mergedRowSelection.value.type !== 'radio',
      disabled: (row: Record<string, any>) => {
        if (!getCheckboxProps) return false
        const { disabled } = getCheckboxProps(row)
        return disabled
      },
      fixed
    }
    cloneColumns.unshift(selectionColumn)

    return cloneColumns
  })

  return {
    mergedColumns,
    mergedRowSelection
  }
}
