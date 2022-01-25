import { createRouter, createWebHashHistory } from "vue-router"

const routes = [
  {
    path: '/',
    name: '/',
    component: () => import('../views/home.vue')
  }, {
    path: '/ash',
    name: 'Ash',
    component: () => import('../views/ash.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router