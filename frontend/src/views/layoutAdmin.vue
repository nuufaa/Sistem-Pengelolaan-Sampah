<template>
  <div class="admin-page">
    <!-- HEADER -->
    <header class="admin-header">
      <button class="hamburger-menu" @click="toggleSidebar">
        <span class="material-icons">menu</span>
      </button>
      <div class="header-title">
        <span class="material-icons">admin_panel_settings</span>
        <h1>Admin Dashboard</h1>
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
              Kelola TPS
            </router-link>

            <router-link
              to="/admin/jam-operasional"
              class="nav-item"
              exact-active-class="active"
              @click="sidebarOpen = false"
            >
              <span class="material-icons">event</span>
              Jam Operasional
            </router-link>

            <router-link
              to="/admin/dusun"
              class="nav-item"
              exact-active-class="active"
              @click="sidebarOpen = false"
            >
              <span class="material-icons">domain</span>
              Kelola Dusun
            </router-link>

            <router-link
              to="/admin/kendaraan"
              class="nav-item"
              exact-active-class="active"
              @click="sidebarOpen = false"
            >
              <span class="material-icons">local_shipping</span>
              Kelola Kendaraan
            </router-link>

            <router-link
              to="/admin/jadwal"
              class="nav-item"
              exact-active-class="active"
              @click="sidebarOpen = false"
            >
              <span class="material-icons">event</span>
              Kelola Jadwal
            </router-link>

            <router-link
              to="/admin/petugas"
              class="nav-item"
              exact-active-class="active"
              @click="sidebarOpen = false"
            >
              <span class="material-icons">badge</span>
              Kelola Petugas
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
import { ref } from 'vue'

const router = useRouter()
const sidebarOpen = ref(false)

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function logout() {
  localStorage.removeItem('token')
  router.push('/')
}

</script>

<style src="@/assets/styles/admin.css"></style>