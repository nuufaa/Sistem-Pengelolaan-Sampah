<template>
  <div class="petugas-page">
    <!-- HEADER -->
    <header class="petugas-header">
      <button class="hamburger-menu" @click="isSidebarOpen = !isSidebarOpen">
        <span class="material-icons">menu</span>
      </button>
      <div class="header-title">
        <span class="material-icons">local_shipping</span>
        <h1>Dashboard Petugas</h1>
      </div>

      <div class="header-actions">
        <button class="btn-logout" @click="logout">
          <span class="material-icons">logout</span>
          <span>Keluar</span>
        </button>
      </div>
    </header>

    <div 
      v-if="isSidebarOpen" 
      class="sidebar-overlay"
      @click="isSidebarOpen = false">
  </div>

    <!-- CONTAINER -->
    <div class="petugas-container">
      <!-- SIDEBAR -->
      <!-- <aside class="petugas-sidebar"> -->
      <aside :class="['petugas-sidebar', { open: isSidebarOpen }]">
        <div class="sidebar-content">
          <div class="sidebar-header">
            <span class="material-icons">badge</span>
            <div>
              <h2>{{ petugas?.nama || 'Petugas Desa' }}</h2>
              <p>Desa Sembalun Bumbung</p>
            </div>
          </div>

          <nav class="sidebar-nav">
            <router-link to="/petugas" class="nav-item" exact-active-class="active" @click="isSidebarOpen = false">
              <span class="material-icons">dashboard</span>
              Dashboard
            </router-link>

            <router-link to="/petugas/pengambilan" class="nav-item" active-class="active" @click="isSidebarOpen = false">
              <span class="material-icons">list_alt</span>
              Daftar Pengambilan
            </router-link>

            <router-link to="/petugas/kepatuhan" class="nav-item" active-class="active" @click="isSidebarOpen = false">
              <span class="material-icons">schedule</span>
              Kepatuhan Jadwal
            </router-link>

            <router-link to="/petugas/logbook" class="nav-item" active-class="active" @click="isSidebarOpen = false">
              <span class="material-icons">description</span>
              Logbook Kendaraan
            </router-link>
          </nav>
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <main class="petugas-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const petugas = ref(null)
const isSidebarOpen = ref(false)


// Fungsi decode JWT manual
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

// Ambil nama petugas dari token saat mounted
onMounted(() => {
  const token = localStorage.getItem('token')
  if (!token) return

  const decoded = parseJwt(token)
  if (decoded) {
    petugas.value = {
      nama: decoded.name,
      role: decoded.role
    }
  }
})

// Logout
function logout() {
  localStorage.removeItem('token')
  router.push('/')
}
</script>

<style scoped src="@/assets/styles/petugas.css"></style>