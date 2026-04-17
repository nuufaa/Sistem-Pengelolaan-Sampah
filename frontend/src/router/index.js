import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/home.vue'
// import Petugas from '../views/petugas/petugas.vue'
import LayoutPetugas from '../views/layoutPetugas.vue'

import Dashboard from '../views/petugas/dashboardPetugas.vue'
import PetugasPengambilan from '../views/petugas/pengambilan.vue'
import PetugasKepatuhan from '../views/petugas/kepatuhan.vue'
import PetugasLogbook from '../views/petugas/logbook.vue'

import LayoutAdmin from '@/views/layoutAdmin.vue'
import DashboardAdmin from '../views/admin/dashboardAdmin.vue'
import AdminTPS from '../views/admin/kelolaTPS.vue'
import AdminKendaraan from '../views/admin/kendaraan.vue'
import AdminDusun from '../views/admin/dusun.vue'
import AdminJadwal from '../views/admin/jadwal.vue'
import AdminPetugas from '../views/admin/petugas.vue'
import AdminLaporan from '../views/admin/laporan.vue'
import AdminJamOperasional from '../views/admin/jamOperasional.vue'
import AdminKepatuhan from '../views/admin/kepatuhan.vue'
import AdminRiwayatLogbook from '../views/admin/riwayatLogbook.vue'
// import AdminRiwayatPengambilan from '../views/admin/riwayatPengambilan.vue'


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
    {
      path: 'dusun',
      name: 'admin-dusun',
      component: AdminDusun
    },
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
    },
    {
      path: 'jam-operasional',
      name: 'admin-operasional',
      component: AdminJamOperasional
    },
    {
      path: 'kepatuhan',
      name: 'admin-kepatuhan',
      component: AdminKepatuhan
    },
    {
      path: 'riwayat-logbook',
      name: 'admin-riwayat-logbook',
      component: AdminRiwayatLogbook
    }
    // {
    //   path: 'riwayat-pengambilan',
    //   name: 'admin-riwayatPengambilan',
    //   component: AdminRiwayatPengambilan
    // }
  ]
}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

