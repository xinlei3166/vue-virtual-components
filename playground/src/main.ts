import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { Table } from '@vue-virtual-components/antd-table'
// only dev
// import '../../packages/antd-table/src/styles/index.less'
import '@vue-virtual-components/antd-table/dist/styles/index.css'

import './mock'

const app = createApp(App)

app.use(router)

app.component(Table as any)

app.mount('#app')
