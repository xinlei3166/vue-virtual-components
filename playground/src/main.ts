import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import {
  Button as AButton,
  Table as ATable,
  Card as ACard
} from 'ant-design-vue'

import { Table } from '@vue-virtual-components/table'
// only dev
import '../../packages/table/src/styles/index.less'
// import '@vue-virtual-components/table/dist/styles/index.css'

import './mock'

const app = createApp(App)

app.use(router)

app.use(AButton)
app.use(ATable)
app.use(ACard)

app.use(Table)

app.mount('#app')
