import DefaultTheme from 'vitepress/theme'
import 'vitepress-theme-demoblock/dist/theme/styles/index.css'
import { useComponents } from './useComponents'
import './style.css'
import { Table } from '@vue-virtual-components/antd-table'
import '@vue-virtual-components/antd-table/dist/styles/index.css'
import '../mock'

export default {
  extends: DefaultTheme,
  enhanceApp(ctx) {
    ctx.app.use(Table)
    useComponents(ctx.app)
  }
}
