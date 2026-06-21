<template>
  <div class="admin-page">
    <header class="admin-header">
      <button class="hamburger-menu" @click="toggleSidebar">
        <span class="material-icons">menu</span>
      </button>
      <div class="header-title">
        <div class="logo-container-admin">
          <div class="logo-icon-wrapper">
            <img v-if="logoSrc" :src="logoSrc" alt="Logo Desa" class="logo-img-navbar" />
            <span v-else class="material-icons logo-icon">domain</span>
          </div>
          <div class="logo-text-admin">
            <h1>Kadus Dashboard</h1>
            <!-- <p>View-only akses</p> -->
          </div>
        </div>
      </div>

      <div class="header-actions">
        <!-- <span class="user-badge">{{ userName }}</span> -->
        <button class="btn-logout" @click="logout">
          <span class="material-icons">logout</span>
          Keluar
        </button>
      </div>
    </header>

    <div class="admin-container">
      <aside class="admin-sidebar" :class="{ open: sidebarOpen }">
        <div class="sidebar-content">
          <div class="sidebar-header">
            <span class="material-icons">domain</span>
            <div>
              <h2>Sistem Pengelolaan Sampah</h2>
              <p>Dashboard Kadus</p>
            </div>
          </div>

          <nav class="sidebar-nav">
            <router-link to="/kadus" class="nav-item" exact-active-class="active" @click="sidebarOpen = false">
              <span class="material-icons">dashboard</span>
              Dashboard
            </router-link>
            <router-link to="/kadus/tps" class="nav-item" exact-active-class="active" @click="sidebarOpen = false">
              <span class="material-icons">delete</span>
              Data TPS
            </router-link>
            <router-link to="/kadus/jam-operasional" class="nav-item" exact-active-class="active" @click="sidebarOpen = false">
              <span class="material-icons">event</span>
              Jam Operasional
            </router-link>
            <router-link to="/kadus/dusun" class="nav-item" exact-active-class="active" @click="sidebarOpen = false">
              <span class="material-icons">domain</span>
              Data Dusun
            </router-link>
            <router-link to="/kadus/kendaraan" class="nav-item" exact-active-class="active" @click="sidebarOpen = false">
              <span class="material-icons">local_shipping</span>
              Data Kendaraan
            </router-link>
            <router-link to="/kadus/jadwal" class="nav-item" exact-active-class="active" @click="sidebarOpen = false">
              <span class="material-icons">event</span>
              Jadwal Pengambilan
            </router-link>
            <router-link to="/kadus/petugas" class="nav-item" exact-active-class="active" @click="sidebarOpen = false">
              <span class="material-icons">badge</span>
              Data Petugas
            </router-link>
            <router-link to="/kadus/kepatuhan" class="nav-item" exact-active-class="active" @click="sidebarOpen = false">
              <span class="material-icons">check_circle</span>
              Kepatuhan Jadwal
            </router-link>
            <router-link to="/kadus/ranking-tps" class="nav-item" exact-active-class="active" @click="sidebarOpen = false">
              <span class="material-icons">emoji_events</span>
              Ranking TPS
            </router-link>
            <router-link to="/kadus/timbulan-perkapita" class="nav-item" exact-active-class="active" @click="sidebarOpen = false">
              <span class="material-icons">people</span>
              Timbulan Per Kapita
            </router-link>
            <router-link to="/kadus/riwayat-logbook" class="nav-item" exact-active-class="active" @click="sidebarOpen = false">
              <span class="material-icons">history</span>
              Riwayat Logbook
            </router-link>
            <router-link to="/kadus/laporan" class="nav-item" exact-active-class="active" @click="sidebarOpen = false">
              <span class="material-icons">report</span>
              Riwayat Laporan
            </router-link>
          </nav>
        </div>
      </aside>

      <main class="admin-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
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
  sessionStorage.removeItem('role')
  sessionStorage.removeItem('userName')
  router.push('/')
}

const userName = computed(() => sessionStorage.getItem('userName') || 'Kadus/Kades')
</script>

<style scoped>
.layout-kadus {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar {
  background-color: #34495e;
  width: 200px;
  position: fixed;
  top: 80px;
  left: 0;
  height: calc(100vh - 80px);
  overflow-y: auto;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  border-bottom: 1px solid #475569;
}

.sidebar a {
  display: block;
  color: white;
  text-decoration: none;
  padding: 1rem;
  transition: background-color 0.3s;
}

.sidebar a:hover,
.sidebar a.router-link-active {
  background-color: #475569;
}

.main-content {
  margin-left: 200px;
  margin-top: 80px;
  padding: 2rem;
  flex: 1;
}

.logout-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 4px;
}

.logout-btn:hover {
  background-color: #c0392b;
}
</style>