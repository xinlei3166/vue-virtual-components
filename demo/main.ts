import { createApp } from 'vue'
import App from './App.vue'
import { Card } from 'ant-design-vue'
import Table from 'ant-design-vue/es/table'
import 'ant-design-vue/es/card/style/css'
import 'ant-design-vue/es/table/style/css'
import './mock'

const app = createApp(App)

app.use(Card)
app.use(Table)

app.mount('#app')
