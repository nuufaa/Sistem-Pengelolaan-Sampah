<template>
  <div class="petugas-page">
    <!-- HEADER -->
    <header class="petugas-header">
      <div class="header-title">
        <span class="material-icons">local_shipping</span>
        <h1>Dashboard Petugas</h1>
      </div>

      <div class="header-actions">
        <span class="petugas-name">Petugas Desa</span>
        <button class="btn-logout">
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
              <h2>Ahmad Fauzi</h2>
              <p>Desa Sembalun Bumbung</p>
            </div>
          </div>

          <nav class="sidebar-nav">
            <router-link
              to="/petugas"
              class="nav-item"
              exact-active-class="active"
            >
              <span class="material-icons">dashboard</span>
              Dashboard
            </router-link>

            <router-link
              to="/petugas/pengambilan"
              class="nav-item"
              active-class="active"
            >
              <span class="material-icons">list_alt</span>
              Daftar Pengambilan
            </router-link>

            <!-- <router-link
              to="/petugas/peta"
              class="nav-item"
              active-class="active"
            >
              <span class="material-icons">map</span>
              Peta TPS
            </router-link> -->

            <router-link
              to="/petugas/kepatuhan"
              class="nav-item"
              active-class="active"
            >
              <span class="material-icons">schedule</span>
              Kepatuhan Jadwal
            </router-link>

            <router-link
              to="/petugas/logbook"
              class="nav-item"
              active-class="active"
            >
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
// layout only — logic nanti kalau perlu
</script>

<style scoped src="@/assets/styles/petugas.css"></style>
