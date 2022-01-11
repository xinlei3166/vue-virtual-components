import { Slots, VNodeChild } from 'vue'

export type TableStyle = 'antd' | 'element'
export type CustomHeaderRow = (column: TableColumn, index: number) => void
export type CustomRow = (record: RowData, index: number) => void

export interface rowSelection {
  type: 'checkbox' | 'radio'
  selectedRowKeys: string[]
  onChange: (selectedRowKeys: string[], selectedRows: RowData[]) => void
}

export type ColumnKey = string | number
export type RowKey = string | number
export type RowData = Record<string, any>

export type CreateRowKey<T = RowData> = (row: T) => RowKey

export interface CommonColumnInfo {
  className?: string
  align?: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
  width?: number
}

export type CustomRender = (props: { text: any; record: RowData; index: number }) => VNodeChild

export type Sorter = (a: RowData, b: RowData) => boolean

export type TableColumn<T = RowData> = {
  dataIndex: string
  key: ColumnKey
  title: string | Slots
  customRender?: CustomRender | Slots
  sorter?: Sorter | boolean
  sortOrder?: 'ascend' | 'descend' | false
  slots?: { customRender: string; [key: string]: string }
} & CommonColumnInfo

export type TableColumns<T = RowData> = Array<TableColumn<T>>
