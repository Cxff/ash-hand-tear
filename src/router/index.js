// import { createRouter, createWebHashHistory } from "vue-router";
import { createRouter, createWebHashHistory } from "./ashRouter";

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