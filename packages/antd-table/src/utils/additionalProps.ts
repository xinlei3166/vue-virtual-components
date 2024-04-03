import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import type { AdditionalProps, RowData, TableColumn } from '../types'
import { useInjectHover } from '../context/HoverContext'
import eagerComputed from '../utils/eagerComputed'

export type MouseEventHandler = (e: MouseEvent) => void

function inHoverRange(
  cellStartRow: number,
  cellRowSpan: number,
  startRow: number,
  endRow: number
) {
  const cellEndRow = cellStartRow + cellRowSpan - 1
  return cellStartRow <= endRow && cellEndRow >= startRow
}

export const useAdditionalProps = (props: {
  index: number
  row: RowData
  column: TableColumn
  additionalProps: AdditionalProps
  colSpan: number
  rowSpan: number
}) => {
  const { onHover, startRow, endRow } = useInjectHover()

  const { index, row, column, additionalProps = {}, colSpan, rowSpan } = props
  const mergedColSpan: ComputedRef<number> = computed(
    () => (additionalProps.colSpan || colSpan || column.colSpan) as number
  )
  const mergedRowSpan: ComputedRef<number> = computed(
    () => (additionalProps.rowSpan || rowSpan || column.rowSpan) as number
  )
  const internalColSpan = computed(() => mergedColSpan.value || 1)
  const internalRowSpan = computed(() => mergedRowSpan.value || 1)

  const hovering = eagerComputed(() => {
    return inHoverRange(
      index,
      internalRowSpan.value,
      startRow.value,
      endRow.value
    )
  })

  const onMouseenter = (event: MouseEvent) => {
    if (row) {
      onHover(index, index + internalRowSpan.value - 1)
    }
    additionalProps?.onMouseenter?.(event)
  }

  const onMouseleave: MouseEventHandler = event => {
    if (row) {
      onHover(-1, -1)
    }
    additionalProps?.onMouseleave?.(event)
  }

  return {
    additionalProps: {
      ...additionalProps,
      class: additionalProps.class,
      style: additionalProps.style,
      onMouseenter,
      onMouseleave,
      colSpan: mergedColSpan,
      rowSpan: mergedRowSpan
    },
    hovering
  }
}
