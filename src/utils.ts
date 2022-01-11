import { TableColumn } from './interface'

// export function getColWidth(col: TableColumn): number | undefined {
//   if (col.type === 'selection') return selectionColWidth
//   if (col.type === 'expand') return expandColWidth
//   if ('children' in col) return undefined
//   return col.width
// }

export function getRowSelection(col: TableColumn): string | number {
  if (col.type === 'selection') return '__n_selection__'
  return col.key
}

export function getColKey(col: TableColumn): string | number {
  if (col.type === 'selection') return '__n_selection__'
  return col.key
}

// https://github.com/vueComponent/ant-design-vue/blob/2.x/components/vc-table/src/utils.js
let scrollbarVerticalSize: any
let scrollbarHorizontalSize: any

// Measure scrollbar width for padding body during modal show/hide
const scrollbarMeasure = {
  position: 'absolute',
  top: '-9999px',
  width: '50px',
  height: '50px'
}

export function measureScrollbar({
  direction = 'vertical',
  prefixCls
}: {
  direction: string
  prefixCls?: string
}) {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return 0
  }
  const isVertical = direction === 'vertical'
  if (isVertical && scrollbarVerticalSize) {
    return scrollbarVerticalSize
  }
  if (!isVertical && scrollbarHorizontalSize) {
    return scrollbarHorizontalSize
  }
  const scrollDiv = document.createElement('div')
  Object.keys(scrollbarMeasure).forEach(scrollProp => {
    // @ts-ignore
    scrollDiv.style[scrollProp] = scrollbarMeasure[scrollProp]
  })
  // apply hide scrollbar className ahead
  scrollDiv.className = `${prefixCls}-hide-scrollbar scroll-div-append-to-body`

  // Append related overflow style
  if (isVertical) {
    scrollDiv.style.overflowY = 'scroll'
  } else {
    scrollDiv.style.overflowX = 'scroll'
  }
  document.body.appendChild(scrollDiv)

  let size = 0
  if (isVertical) {
    size = scrollDiv.offsetWidth - scrollDiv.clientWidth
    scrollbarVerticalSize = size
  } else {
    size = scrollDiv.offsetHeight - scrollDiv.clientHeight
    scrollbarHorizontalSize = size
  }

  document.body.removeChild(scrollDiv)
  return size
}
