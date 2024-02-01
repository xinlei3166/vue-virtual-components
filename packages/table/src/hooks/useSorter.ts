import { computed, ref } from 'vue'
import type { ComputedRef } from 'vue'
import type {
  TableColumn,
  TableBaseColumn,
  Sorter,
  SortOrder,
  SortState,
  ColumnKey,
  TmNode
} from '../types'
import type { TableProps } from '../table/Table'
import { getFlagOfOrder } from '../utils'

function getNextOrder(order: SortOrder): SortOrder {
  if (!order) return 'ascend'
  else if (order === 'ascend') return 'descend'
  return false
}

function getSortFunction(
  sorter: TableBaseColumn['sorter'],
  sortOrder?: SortOrder
): Sorter | false {
  if (!sortOrder || typeof sorter !== 'function') {
    return false
  }

  return (a, b) => {
    const result = sorter(a, b)
    if (result !== 0) {
      return result * getFlagOfOrder(sortOrder)
    }
    return 0
  }
}

export function useSorter(
  props: TableProps,
  {
    relatedCols,
    filteredData
  }: {
    relatedCols: ComputedRef<Array<TableColumn>>
    filteredData: ComputedRef<TmNode[]>
  }
) {
  // return first column which sortOrder is not falsy
  const sortedColumn = relatedCols.value.filter(
    column =>
      column.type &&
      column.type !== 'selection' &&
      ['ascend', 'descend', false].includes(column.sortOrder!)
  )[0] as TableBaseColumn

  const sortState = ref<SortState | null>(null)

  if (sortedColumn) {
    const { key: columnKey, sorter, sortOrder, dataIndex: field } = sortedColumn
    sortState.value = {
      column: sortedColumn,
      columnKey,
      field: field!,
      order: sortOrder!,
      sorter: sorter!
    }
  }

  const sortedData = computed<TmNode[]>(() => {
    if (sortState.value) {
      const { sorter, order: sortOrder } = sortState.value
      const sorterFunction = getSortFunction(sorter, sortOrder) as any
      const _filteredData = filteredData.value.slice()
      return _filteredData.sort(sorterFunction)
    }
    return filteredData.value
  })

  function clearSorter(): void {
    sortState.value = null
  }

  function sort(columnKey: ColumnKey, order: SortOrder = 'ascend'): void {
    const column = relatedCols.value.find(
      column =>
        column.type !== 'selection' &&
        column.type !== 'expand' &&
        column.key === columnKey
    )
    if (!column || !column.sorter) return

    const { sorter } = column
    if (column.type === 'selection' || column.type === 'expand') return

    if (sortState.value === null || sortState.value?.columnKey !== columnKey) {
      sortState.value = {
        column,
        columnKey,
        field: column.dataIndex!,
        order: getNextOrder(false),
        sorter
      }
    } else {
      sortState.value = {
        ...sortState.value,
        order: getNextOrder(order)
      }
    }

    const { onSort } = props
    if (onSort) {
      onSort(sortState.value!)
    }
  }

  return { sortedData, mergedSortState: sortState, sort, clearSorter }
}
