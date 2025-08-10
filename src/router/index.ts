import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Layout from '../components/Layout.vue'
import Dashboard from '../views/Dashboard.vue'
import CustomerService from '../views/CustomerService.vue'
import KnowledgeBase from '../views/KnowledgeBase.vue'
import Settings from '../views/Settings.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: '运营看板', icon: 'DataBoard' }
      },
      {
        path: '/customer-service',
        name: 'CustomerService',
        component: CustomerService,
        meta: { title: '客服坐席', icon: 'Service' }
      },
      {
        path: '/knowledge-base',
        name: 'KnowledgeBase',
        component: KnowledgeBase,
        meta: { title: '知识库', icon: 'Document' }
      },
      {
        path: '/settings',
        name: 'Settings',
        component: Settings,
        meta: { title: '设置', icon: 'Setting' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router