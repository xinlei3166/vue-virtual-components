import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// only build
import { Table } from '@vue-virtual-components/antd-table'
import '@vue-virtual-components/antd-table/dist/styles/index.css'

// only dev
// import '../../packages/antd-table/src/styles/index.less'

import './mock'

const app = createApp(App)

app.use(router)
console.log('Table', Table.name)

app.use(Table as any)

app.mount('#app')
