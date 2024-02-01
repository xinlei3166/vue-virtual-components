import type { App } from 'vue'
import Table from './Table'

export type { TableProps } from './Table'

Table.install = function (app: App) {
  app.component(Table.name, Table)
  return app
}

export default Table
