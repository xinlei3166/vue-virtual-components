import type { App } from 'vue'
import Table from './Table'
import { SELECTION_ALL, SELECTION_INVERT, SELECTION_NONE } from '../types'

export type { TableProps } from '../types'

Table.SELECTION_ALL = SELECTION_ALL
Table.SELECTION_INVERT = SELECTION_INVERT
Table.SELECTION_NONE = SELECTION_NONE

Table.install = function (app: App) {
  app.component(Table.name, Table)
  return app
}

export default Table
