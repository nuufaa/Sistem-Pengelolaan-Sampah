import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/home.vue'
import LayoutPetugas from '../views/layoutPetugas.vue'
import LayoutAdmin from '@/views/layoutAdmin.vue'

// Lazy loaded routes (Code Splitting)
const Dashboard = () => import('../views/petugas/dashboardPetugas.vue')
const PetugasPengambilan = () => import('../views/petugas/pengambilan.vue')
const PetugasKepatuhan = () => import('../views/petugas/kepatuhan.vue')
const PetugasLogbook = () => import('../views/petugas/logbook.vue')

const DashboardAdmin = () => import('../views/admin/dashboardAdmin.vue')
const AdminTPS = () => import('../views/admin/kelolaTPS.vue')
const AdminKendaraan = () => import('../views/admin/kendaraan.vue')
const AdminDusun = () => import('../views/admin/dusun.vue')
const AdminJadwal = () => import('../views/admin/jadwal.vue')
const AdminPetugas = () => import('../views/admin/petugas.vue')
const AdminLaporan = () => import('../views/admin/laporan.vue')
const AdminJamOperasional = () => import('../views/admin/jamOperasional.vue')
const AdminKepatuhan = () => import('../views/admin/kepatuhan.vue')
const AdminRiwayatLogbook = () => import('../views/admin/riwayatLogbook.vue')
const AdminRankingTPS = () => import('../views/admin/rankingTPS.vue')
const AdminTimbulanPerKapita = () => import('../views/admin/timbulanPerKapita.vue')


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
    },
    {
      path: 'ranking-tps',
      name: 'admin-ranking-tps',
      component: AdminRankingTPS
    },
    {
      path: 'timbulan-perkapita',
      name: 'admin-timbulan-perkapita',
      component: AdminTimbulanPerKapita
    }
  ]
  },
  {
    path: '/kadus',
    component: () => import('../views/layoutKadus.vue'),
    meta: { requiresAuth: true, roles: ['kadus', 'kades'] },
    children: [
      {
        path: '',
        name: 'kadus-dashboard',
        component: DashboardAdmin
      },
      {
        path: 'laporan',
        name: 'kadus-laporan',
        component: AdminLaporan
      },
      {
        path: 'jam-operasional',
        name: 'kadus-jam-operasional',
        component: AdminJamOperasional
      },
      {
        path: 'dusun',
        name: 'kadus-dusun',
        component: AdminDusun
      },
      {
        path: 'tps',
        name: 'kadus-tps',
        component: AdminTPS
      },
      {
        path: 'jadwal',
        name: 'kadus-jadwal',
        component: AdminJadwal
      },
      {
        path: 'kendaraan',
        name: 'kadus-kendaraan',
        component: AdminKendaraan
      },
      {
        path: 'petugas',
        name: 'kadus-petugas',
        component: AdminPetugas
      },
      {
        path: 'kepatuhan',
        name: 'kadus-kepatuhan',
        component: AdminKepatuhan
      },
      {
        path: 'ranking-tps',
        name: 'kadus-ranking-tps',
        component: AdminRankingTPS
      },
      {
        path: 'timbulan-perkapita',
        name: 'kadus-timbulan-perkapita',
        component: AdminTimbulanPerKapita
      },
      {
        path: 'riwayat-logbook',
        name: 'kadus-riwayat-logbook',
        component: AdminRiwayatLogbook
      }
    ]
  },
  {
    path: '/dashboard',
    redirect: () => {
      const role = sessionStorage.getItem('role')
      if (role === 'admin') return '/admin'
      if (role === 'kadus' || role === 'kades') return '/kadus'
      return '/petugas'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!sessionStorage.getItem('token')
  const userRole = sessionStorage.getItem('role')

  if (to.meta?.requiresAuth && !isAuthenticated) {
    return next('/')
  }

  if (to.meta?.roles && !to.meta.roles.includes(userRole)) {
    if (userRole === 'admin') return next('/admin')
    if (userRole === 'kadus' || userRole === 'kades') return next('/kadus')
    return next('/petugas')
  }

  next()
})

export default router
