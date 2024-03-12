import type { ComputedRef } from 'vue'
import { computed, ref, watch } from 'vue'
import type { TreeMate } from 'treemate'
import type {
  TableProps,
  RowKey,
  RowSelection,
  RowData,
  TableSelectionColumn,
  InternalRowData,
  TmNode
} from '../types'
import { call } from '../utils/call'

export function useCheck(
  props: TableProps,
  data: {
    mergedRowSelection: ComputedRef<RowSelection>
    selectionColumn: ComputedRef<TableSelectionColumn | null>
    mergedData: ComputedRef<TmNode[]>
    treeMate: ComputedRef<TreeMate<InternalRowData>>
  }
) {
  const { mergedRowSelection, selectionColumn, mergedData, treeMate } = data
  const uncontrolledCheckedRowKeys = ref(
    mergedRowSelection.value.selectedRowKeys || []
  )
  watch(
    () => mergedRowSelection.value.selectedRowKeys,
    val => {
      uncontrolledCheckedRowKeys.value = val
    }
  )
  const mergedCheckState = computed(() => {
    const sourceKeys = uncontrolledCheckedRowKeys.value
    if (selectionColumn.value?.multiple === false) {
      return {
        checkedKeys: sourceKeys.slice(0, 1),
        indeterminateKeys: []
      }
    }
    return treeMate.value.getCheckedKeys(sourceKeys, {
      cascade: props.cascade,
      allowNotLoaded: props.allowCheckingNotLoaded
    })
  })

  const unCheckedRowKeys = computed(() =>
    treeMate.value.treeNodes
      .filter(x => !mergedCheckedRowKeySet.value.has(x.key) && !x.disabled)
      .map(x => x.key)
  )
  const mergedCheckedRowKeys = computed(
    () => mergedCheckState.value.checkedKeys
  )
  const mergedInderminateRowKeys = computed(
    () => mergedCheckState.value.indeterminateKeys
  )
  const mergedCheckedRowKeySet = computed<Set<RowKey>>(() => {
    return new Set(mergedCheckedRowKeys.value)
  })
  const mergedInderminateRowKeySet = computed<Set<RowKey>>(() => {
    return new Set(mergedInderminateRowKeys.value)
  })
  const countOfCurrentPageCheckedRows = computed(() => {
    return mergedData.value.reduce((total, tmNode) => {
      const { key, disabled } = tmNode
      return (
        total + (!disabled && mergedCheckedRowKeySet.value.has(key) ? 1 : 0)
      )
    }, 0)
  })
  const countOfCurrentPageDisabledRows = computed(() => {
    return mergedData.value.filter(item => item.disabled).length
  })
  const someRowsChecked = computed(() => {
    const { length } = mergedData.value
    return (
      (countOfCurrentPageCheckedRows.value > 0 &&
        countOfCurrentPageCheckedRows.value <
          length - countOfCurrentPageDisabledRows.value) ||
      mergedData.value.some(rowData =>
        mergedInderminateRowKeySet.value.has(rowData.key)
      )
    )
  })
  const allRowsChecked = computed(() => {
    const { length } = mergedData.value
    return (
      countOfCurrentPageCheckedRows.value !== 0 &&
      countOfCurrentPageCheckedRows.value ===
        length - countOfCurrentPageDisabledRows.value
    )
  })
  const headerCheckboxDisabled = computed(() => {
    return mergedData.value.length === 0
  })
  const getRowInfos = (rowKeys: RowKey[] = []) => {
    return rowKeys.map(rowKey => treeMate.value.getNode(rowKey)?.rawNode)
  }
  function doUpdateCheckedRowKeys(
    keys: RowKey[],
    row: RowData | undefined,
    action: 'check' | 'uncheck' | 'checkAll' | 'uncheckAll' | 'checkInvert'
  ): void {
    const {
      'onUpdate:checkedRowKeys': _onUpdateCheckedRowKeys,
      onUpdateCheckedRowKeys,
      onCheckedRowKeysChange
    } = props
    const rows: InternalRowData[] = []
    const {
      value: { getNode }
    } = treeMate
    keys.forEach(key => {
      const row = getNode(key)?.rawNode
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      rows.push(row!)
    })
    if (_onUpdateCheckedRowKeys) {
      call(_onUpdateCheckedRowKeys, keys, rows, { row, action })
    }
    if (onUpdateCheckedRowKeys) {
      call(onUpdateCheckedRowKeys, keys, rows, { row, action })
    }
    if (onCheckedRowKeysChange) {
      call(onCheckedRowKeysChange, keys, rows, { row, action })
    }
    // mergedRowSelection:onChange
    const selectedRowKeys = keys
    const selectedRows = getRowInfos(keys)
    mergedRowSelection.value.onChange?.(selectedRowKeys, selectedRows)
    uncontrolledCheckedRowKeys.value = keys
  }
  function doCheck(
    rowKey: RowKey | RowKey[],
    single: boolean = false,
    rowInfo: RowData,
    nativeEvent: MouseEvent
  ): void {
    if (props.loading) return
    let keys
    if (single) {
      keys = Array.isArray(rowKey) ? rowKey.slice(0, 1) : [rowKey]
      doUpdateCheckedRowKeys(keys, rowInfo, 'check')
    } else {
      keys = treeMate.value.check(rowKey, mergedCheckedRowKeys.value, {
        cascade: props.cascade,
        allowNotLoaded: props.allowCheckingNotLoaded
      }).checkedKeys
      doUpdateCheckedRowKeys(keys, rowInfo, 'check')
    }
    // mergedRowSelection:onSelect-true
    const selectedRows = getRowInfos(keys)
    mergedRowSelection.value.onSelect?.(
      rowInfo,
      true,
      selectedRows,
      nativeEvent
    )
  }
  function doUncheck(
    rowKey: RowKey | RowKey[],
    rowInfo: RowData,
    nativeEvent: MouseEvent
  ): void {
    if (props.loading) return
    const keys = treeMate.value.uncheck(rowKey, mergedCheckedRowKeys.value, {
      cascade: props.cascade,
      allowNotLoaded: props.allowCheckingNotLoaded
    }).checkedKeys
    doUpdateCheckedRowKeys(keys, rowInfo, 'uncheck')
    // mergedRowSelection:onSelect-false
    const selectedRows = getRowInfos(keys)
    mergedRowSelection.value.onSelect?.(
      rowInfo,
      false,
      selectedRows,
      nativeEvent
    )
  }
  function doCheckAll(checkWholeTable: boolean = false): void {
    const { value: column } = selectionColumn
    if (!column || props.loading) return
    const rowKeysToCheck: RowKey[] = []
    ;(checkWholeTable ? treeMate.value.treeNodes : mergedData.value).forEach(
      tmNode => {
        if (!tmNode.disabled) {
          rowKeysToCheck.push(tmNode.key)
        }
      }
    )
    // alway cascade, to emit correct row keys
    const keys = treeMate.value.check(
      rowKeysToCheck,
      mergedCheckedRowKeys.value,
      {
        cascade: true,
        allowNotLoaded: props.allowCheckingNotLoaded
      }
    ).checkedKeys
    const changeRows = getRowInfos(unCheckedRowKeys.value)
    doUpdateCheckedRowKeys(keys, undefined, 'checkAll')
    // mergedRowSelection:onSelectAll-true
    const selectedRows = getRowInfos(keys)
    mergedRowSelection.value.onSelectAll?.(true, selectedRows, changeRows)
  }
  function doCheckInvert(checkWholeTable: boolean = false): void {
    const { value: column } = selectionColumn
    if (!column || props.loading) return
    const rowKeysToCheck: RowKey[] = unCheckedRowKeys.value
    // alway cascade, to emit correct row keys
    doUpdateCheckedRowKeys(
      treeMate.value.check(rowKeysToCheck, [], {
        cascade: true,
        allowNotLoaded: props.allowCheckingNotLoaded
      }).checkedKeys,
      undefined,
      'checkInvert'
    )
    // mergedRowSelection:onSelectInvert
    // mergedRowSelection.value.onSelectInvert?.()
  }
  function doUncheckAll(
    checkWholeTable: boolean = false,
    isSelectNone = false
  ): void {
    const { value: column } = selectionColumn
    if (!column || props.loading) return
    const rowKeysToUncheck: RowKey[] = []
    ;(checkWholeTable ? treeMate.value.treeNodes : mergedData.value).forEach(
      tmNode => {
        if (!tmNode.disabled) {
          rowKeysToUncheck.push(tmNode.key)
        }
      }
    )
    // alway cascade, to emit correct row keys
    const keys = treeMate.value.uncheck(
      rowKeysToUncheck,
      mergedCheckedRowKeys.value,
      {
        cascade: true,
        allowNotLoaded: props.allowCheckingNotLoaded
      }
    ).checkedKeys
    doUpdateCheckedRowKeys(keys, undefined, 'uncheckAll')
    if (isSelectNone) {
      // mergedRowSelection:onSelectNone
      mergedRowSelection.value.onSelectNone?.()
    } else {
      // mergedRowSelection:onSelectAll-false
      const selectedRows = []
      const changeRows = getRowInfos(rowKeysToUncheck)
      mergedRowSelection.value.onSelectAll?.(false, selectedRows, changeRows)
    }
  }
  return {
    mergedCheckedRowKeySet,
    mergedCheckedRowKeys,
    mergedInderminateRowKeySet,
    someRowsChecked,
    allRowsChecked,
    headerCheckboxDisabled,
    doUpdateCheckedRowKeys,
    doCheckAll,
    doCheckInvert,
    doUncheckAll,
    doCheck,
    doUncheck
  }
}
