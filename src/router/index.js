import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: '/',
    name: '/',
    component: () => import('../views/home.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router