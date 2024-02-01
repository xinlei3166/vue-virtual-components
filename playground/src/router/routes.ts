import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    meta: {
      title: 'home'
    },
    component: () => import('@/components/HelloWorld.vue'),
    redirect: { name: 'source-dev' }
  },
  {
    path: '/source-dev',
    name: 'source-dev',
    meta: {
      title: 'source-dev'
    },
    component: () => import('@/views/source-dev.vue')
  },
  {
    path: '/antd-style',
    name: 'antd-style',
    meta: {
      title: 'antd-style'
    },
    component: () => import('@/views/antd-style.vue')
  },
  {
    path: '/element-style',
    name: 'element-style',
    meta: {
      title: 'element-style'
    },
    component: () => import('@/views/element-style.vue')
  },
  {
    path: '/antd-table',
    name: 'antd-table',
    meta: {
      title: 'antd-table'
    },
    component: () => import('@/views/antd-table.vue')
  }
]

export default routes
