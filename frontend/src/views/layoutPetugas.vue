<template>
  <div class="petugas-page">
    <!-- HEADER -->
    <header class="petugas-header">
      <div class="header-title">
        <span class="material-icons">local_shipping</span>
        <h1>Dashboard Petugas</h1>
      </div>

      <div class="header-actions">
        <button class="btn-logout" @click="logout">
          <span class="material-icons">logout</span>
          Keluar
        </button>
      </div>
    </header>

    <!-- CONTAINER -->
    <div class="petugas-container">
      <!-- SIDEBAR -->
      <aside class="petugas-sidebar">
        <div class="sidebar-content">
          <div class="sidebar-header">
            <span class="material-icons">badge</span>
            <div>
              <h2>{{ petugas?.nama || 'Petugas Desa' }}</h2>
              <p>Desa Sembalun Bumbung</p>
            </div>
          </div>

          <nav class="sidebar-nav">
            <router-link to="/petugas" class="nav-item" exact-active-class="active">
              <span class="material-icons">dashboard</span>
              Dashboard
            </router-link>

            <router-link to="/petugas/pengambilan" class="nav-item" active-class="active">
              <span class="material-icons">list_alt</span>
              Daftar Pengambilan
            </router-link>

            <router-link to="/petugas/kepatuhan" class="nav-item" active-class="active">
              <span class="material-icons">schedule</span>
              Kepatuhan Jadwal
            </router-link>

            <router-link to="/petugas/logbook" class="nav-item" active-class="active">
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

// Fungsi decode JWT manual
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch (e) {
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