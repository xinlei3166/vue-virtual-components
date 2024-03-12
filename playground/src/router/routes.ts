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
    path: '/dev1',
    name: 'dev1',
    meta: {
      title: 'dev1'
    },
    component: () => import('@/views/dev1.vue')
  },
  {
    path: '/dev2',
    name: 'dev2',
    meta: {
      title: 'dev2'
    },
    component: () => import('@/views/dev2.vue')
  },
  {
    path: '/table',
    name: 'table',
    meta: {
      title: 'table'
    },
    component: () => import('@/views/table.vue')
  },
  {
    path: '/antdv',
    name: 'antdv',
    meta: {
      title: 'antdv'
    },
    component: () => import('@/views/antdv.vue')
  }
]

export default routes
