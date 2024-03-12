import type { PropType } from 'vue'
import { computed, defineComponent, inject } from 'vue'
import { DownOutlined } from '@ant-design/icons-vue'
import type {
  INTERNAL_SELECTION_ITEM,
  InternalRowData,
  RowKey,
  SelectionItem
} from '../types'
import {
  SELECTION_ALL,
  SELECTION_INVERT,
  SELECTION_NONE,
  tableInjectionKey
} from '../types'
import { Checkbox, Dropdown, Menu } from 'ant-design-vue'

export const SelectionMenu = defineComponent({
  props: {},
  setup(props) {
    const {
      props: tableProps,
      prefixCls,
      mergedRowSelection,
      mergedData,
      rawMergedData,
      doCheckAll,
      doUncheckAll,
      doCheckInvert
    } = inject(tableInjectionKey)

    const mergedDataKeys = computed(() =>
      mergedData.value.map(x => !x.disabled && x.key)
    )

    const mergedSelections = computed(() => {
      const selections = mergedRowSelection.value.selections
      const hideSelectAll = mergedRowSelection.value.hideSelectAll
      if (!selections || hideSelectAll) {
        return null
      }

      const selectionList: INTERNAL_SELECTION_ITEM[] =
        selections === true
          ? [SELECTION_ALL, SELECTION_INVERT, SELECTION_NONE]
          : selections
      return selectionList.map(selection => {
        switch (selection) {
          case SELECTION_ALL:
            return {
              key: 'all',
              text: tableProps.locale.selectionAll,
              onSelect() {
                doCheckAll(true)
              }
            }
          case SELECTION_INVERT:
            return {
              key: 'invert',
              text: tableProps.locale.selectionInvert,
              onSelect() {
                doCheckInvert(true)
              }
            }
          case SELECTION_NONE:
            return {
              key: 'none',
              text: tableProps.locale.selectionNone,
              onSelect() {
                doUncheckAll(true, true)
              }
            }
          default:
            return selection as SelectionItem
        }
      })
    })

    return () => {
      if (!mergedSelections.value) return null
      const menu = (
        <Menu getPopupContainer={tableProps.getPopupContainer}>
          {mergedSelections.value.map((selection, index) => {
            const { key, text, onSelect: onSelectionClick } = selection
            return (
              <Menu.Item
                key={key || index}
                onClick={() => {
                  onSelectionClick?.(mergedDataKeys.value)
                }}
              >
                {text}
              </Menu.Item>
            )
          })}
        </Menu>
      )

      return (
        <div class={`${prefixCls.value}-selection-extra`}>
          <Dropdown
            overlay={menu}
            getPopupContainer={tableProps.getPopupContainer}
          >
            <span>
              <DownOutlined />
            </span>
          </Dropdown>
        </div>
      )
    }
  }
})

export default defineComponent({
  props: {},
  setup(props) {
    const {
      prefixCls,
      mergedRowSelection,
      headerCheckboxDisabled,
      allRowsChecked,
      someRowsChecked,
      doUncheckAll,
      doCheckAll
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    } = inject(tableInjectionKey)!

    function handleCheckboxUpdateChecked(): void {
      if (allRowsChecked.value) {
        doUncheckAll()
      } else {
        doCheckAll()
      }
    }

    const showSelectionMenu = computed(
      () =>
        !!mergedRowSelection.value.selections ||
        !mergedRowSelection.value.hideSelectAll
    )

    return () => {
      const getCheckboxProps = mergedRowSelection.value.getCheckboxProps
      const checkboxProps =
        (getCheckboxProps ? getCheckboxProps(props.row) : null) || {}

      return (
        <div class={`${prefixCls.value}-selection`}>
          <Checkbox
            {...checkboxProps}
            key="HeaderCheckbox"
            disabled={headerCheckboxDisabled.value}
            checked={allRowsChecked.value}
            indeterminate={someRowsChecked.value}
            skipGroup
            onClick={e => e.stopPropagation()}
            onChange={handleCheckboxUpdateChecked}
          />
          {showSelectionMenu.value ? <SelectionMenu /> : null}
        </div>
      )
    }
  }
})
