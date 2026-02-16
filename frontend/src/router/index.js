// import { createRouter, createWebHistory } from 'vue-router'
// import Home from '../views/Home.vue'
// import Petugas from '../views/Petugas.vue'

// const routes = [
//   {
//     path: '/',
//     name: 'home',
//     component: Home
//   },
//   {
//     path: '/petugas',
//     name: 'petugas',
//     component: Petugas
//   }
// ]

// const router = createRouter({
//   history: createWebHistory(),
//   routes
// })

// export default router

import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/home.vue'
// import Petugas from '../views/petugas/petugas.vue'
import LayoutPetugas from '../views/layoutPetugas.vue'

import Dashboard from '../views/petugas/dashboard.vue'
import PetugasPengambilan from '../views/petugas/pengambilan.vue'
// import PetugasPeta from '../views/petugas/Peta.vue'
import PetugasKepatuhan from '../views/petugas/kepatuhan.vue'
import PetugasLogbook from '../views/petugas/logbook.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/petugas',
    component: LayoutPetugas,
    children: [
      {
        path: '',
        name: 'petugas-dashboard',
        component: Dashboard
      },
      {
        path: 'pengambilan',
        name: 'petugas-pengambilan',
        component: PetugasPengambilan
      },
      {
        path: 'kepatuhan',
        name: 'petugas-kepatuhan',
        component: PetugasKepatuhan
      },
      {
        path: 'logbook',
        name: 'petugas-logbook',
        component: PetugasLogbook
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

