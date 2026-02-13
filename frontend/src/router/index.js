import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Petugas from '../views/Petugas.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/petugas',
    name: 'petugas',
    component: Petugas
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
