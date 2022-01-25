import { createRouter, createWebHashHistory } from "vue-router"

const routes = [
  {
    path: '/demo',
    name: 'Demo',
    component: () => import('@/views/ash-demo/index.vue'),
    meta: {
      title: 'ashDemo'
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router