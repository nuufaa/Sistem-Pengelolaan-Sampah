<template>
  <div class="admin-page">
    <!-- HEADER -->
    <header class="admin-header">
      <div class="header-title">
        <span class="material-icons">admin_panel_settings</span>
        <h1>Admin Dashboard</h1>
      </div>

      <div class="header-actions">
        <span class="admin-name">Admin Desa</span>
        <button class="btn-logout" @click="logout">
          <span class="material-icons">logout</span>
          Keluar
        </button>
      </div>
    </header>

    <!-- CONTAINER -->
    <div class="admin-container">
      <!-- SIDEBAR -->
      <aside class="admin-sidebar">
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
            >
              <span class="material-icons">dashboard</span>
              Dashboard
            </router-link>

            <router-link
              to="/admin/tps"
              class="nav-item"
              active-class="active"
            >
              <span class="material-icons">delete</span>
              Kelola TPS
            </router-link>

            <router-link
              to="/admin/kendaraan"
              class="nav-item"
              active-class="active"
            >
              <span class="material-icons">local_shipping</span>
              Kelola Kendaraan
            </router-link>

            <!-- <router-link
              to="/admin/peta"
              class="nav-item"
              active-class="active"
            >
              <span class="material-icons">map</span>
              Peta TPS
            </router-link> -->

            <router-link
              to="/admin/jadwal"
              class="nav-item"
              active-class="active"
            >
              <span class="material-icons">event</span>
              Kelola Jadwal
            </router-link>

            <router-link
              to="/admin/petugas"
              class="nav-item"
              active-class="active"
            >
              <span class="material-icons">badge</span>
              Kelola Petugas
            </router-link>

            <router-link
              to="/admin/laporan"
              class="nav-item"
              active-class="active"
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
// layout only — logic nanti kalau perlu (logout, auth, dll)
import { useRouter } from 'vue-router';
const router = useRouter()

function logout() {
  localStorage.removeItem('token') // hapus token login
  router.push('/') // redirect ke halaman login
}

</script>

<style src="@/assets/styles/admin.css"></style>