import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/home.vue'
// import Petugas from '../views/petugas/petugas.vue'
import LayoutPetugas from '../views/layoutPetugas.vue'

import Dashboard from '../views/petugas/dashboard.vue'
import PetugasPengambilan from '../views/petugas/pengambilan.vue'
import PetugasKepatuhan from '../views/petugas/kepatuhan.vue'
import PetugasLogbook from '../views/petugas/logbook.vue'

import LayoutAdmin from '@/views/layoutAdmin.vue'
import DashboardAdmin from '../views/admin/dashboard.vue'
import AdminTPS from '../views/admin/kelolaTPS.vue'
import AdminKendaraan from '../views/admin/kendaraan.vue'
// import AdminPeta from '../views/admin/peta.vue'
import AdminJadwal from '../views/admin/jadwal.vue'
import AdminPetugas from '../views/admin/petugas.vue'
import AdminLaporan from '../views/admin/laporan.vue'


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
  },
  {
  path: '/admin',
  component: LayoutAdmin,
  children: [
    {
      path: '',
      name: 'admin-dashboard',
      component: DashboardAdmin
    },
    {
      path: 'tps',
      name: 'admin-tps',
      component: AdminTPS
    },
    {
      path: 'kendaraan',
      name: 'admin-kendaraan',
      component: AdminKendaraan
    },
    // {
    //   path: 'peta',
    //   name: 'admin-peta',
    //   component: AdminPeta
    // },
    {
      path: 'jadwal',
      name: 'admin-jadwal',
      component: AdminJadwal
    },
    {
      path: 'petugas',
      name: 'admin-petugas',
      component: AdminPetugas
    },
    {
      path: 'laporan',
      name: 'admin-laporan',
      component: AdminLaporan
    }
  ]
}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

