<template>
  <div class="admin-page">
    <!-- HEADER -->
    <header class="admin-header">
      <button class="hamburger-menu" @click="toggleSidebar">
        <span class="material-icons">menu</span>
      </button>
      <div class="header-title">
        <div class="logo-container-admin">
          <div class="logo-icon-wrapper">
            <img 
              v-if="logoSrc" 
              :src="logoSrc" 
              alt="Logo Desa"
              class="logo-img-navbar"
            />
            <!-- <span v-else class="material-icons logo-icon">domain</span> -->
          </div>
          <div class="logo-text-admin">
            <h1>Admin Dashboard</h1>
            <!-- <p>Desa Sembalun Bumbung</p> -->
          </div>
        </div>
      </div>

      <div class="header-actions">
        <button class="btn-logout" @click="logout">
          <span class="material-icons">logout</span>
          Keluar
        </button>
      </div>
    </header>

    <!-- CONTAINER -->
    <div class="admin-container">
      <!-- SIDEBAR -->
      <aside class="admin-sidebar" :class="{ open: sidebarOpen }">
        <div class="sidebar-content">
          <div class="sidebar-header">
            <span class="material-icons">domain</span>
            <div>
              <h2>Sistem Pengelolaan Sampah</h2>
              <p>Desa Sembalun Bumbung</p>
            </div>
          </div>

          <nav class="sidebar-nav">
            <router-link
              to="/admin"
              class="nav-item"
              exact-active-class="active"
              @click="sidebarOpen = false"
            >
              <span class="material-icons">dashboard</span>
              Dashboard
            </router-link>

            <router-link
              to="/admin/tps"
              class="nav-item"
              exact-active-class="active"
              @click="sidebarOpen = false"
            >
              <span class="material-icons">delete</span>
              Data TPS
            </router-link>

            <router-link
              to="/admin/jam-operasional"
              class="nav-item"
              exact-active-class="active"
              @click="sidebarOpen = false"
            >
              <span class="material-icons">event</span>
              Pengaturan Sistem
            </router-link>

            <router-link
              to="/admin/dusun"
              class="nav-item"
              exact-active-class="active"
              @click="sidebarOpen = false"
            >
              <span class="material-icons">domain</span>
              Data Dusun
            </router-link>

            <router-link
              to="/admin/kendaraan"
              class="nav-item"
              exact-active-class="active"
              @click="sidebarOpen = false"
            >
              <span class="material-icons">local_shipping</span>
              Data Kendaraan
            </router-link>

            <router-link
              to="/admin/jadwal"
              class="nav-item"
              exact-active-class="active"
              @click="sidebarOpen = false"
            >
              <span class="material-icons">event</span>
              Jadwal Pengambilan
            </router-link>

            <router-link
              to="/admin/petugas"
              class="nav-item"
              exact-active-class="active"
              @click="sidebarOpen = false"
            >
              <span class="material-icons">badge</span>
              Data Petugas
            </router-link>

            <router-link
              to="/admin/kepatuhan"
              class="nav-item"
              exact-active-class="active"
              @click="sidebarOpen = false"
            >
              <span class="material-icons">check_circle</span>
              Kepatuhan Jadwal
            </router-link>

            <router-link
              to="/admin/ranking-tps"
              class="nav-item"
              exact-active-class="active"
              @click="sidebarOpen = false"
            >
              <span class="material-icons">emoji_events</span>
              Ranking TPS
            </router-link>

            <router-link
              to="/admin/timbulan-perkapita"
              class="nav-item"
              exact-active-class="active"
              @click="sidebarOpen = false"
            >
              <span class="material-icons">people</span>
              Timbulan Perkapita
            </router-link>

            <router-link
              to="/admin/riwayat-logbook"
              class="nav-item"
              exact-active-class="active"
              @click="sidebarOpen = false"
            >
              <span class="material-icons">history</span>
              Riwayat Logbook
            </router-link>

            <router-link
              to="/admin/laporan"
              class="nav-item"
              exact-active-class="active"
              @click="sidebarOpen = false"
            >
              <span class="material-icons">report</span>
              Riwayat Laporan
            </router-link>

            <!-- <router-link
              to="/admin/riwayat-pengambilan"
              class="nav-item"
              exact-active-class="active"
              @click="sidebarOpen = false"
            >
              <span class="material-icons">report</span>
              Riwayat Pengambilan
            </router-link> -->

          </nav>
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <main class="admin-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRouter} from 'vue-router';
import { ref, onMounted } from 'vue'
import { useDesaLogo } from '@/services/useDesaLogo'

const router = useRouter()
const sidebarOpen = ref(false)
const { logoSrc, fetchLogo } = useDesaLogo()

onMounted(() => {
  fetchLogo()
})

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function logout() {
  sessionStorage.removeItem('token')
  router.push('/')
}

</script>

<style src="@/assets/styles/admin.css"></style>