<template>
  <!-- Overlay -->
  <div
    class="modal-login-overlay"
    :class="{ active: isOpen }"
    @click="close"
  ></div>

  <!-- Modal -->
  <div class="modal-login" :class="{ active: isOpen }">
    <!-- Header -->
    <div class="modal-login-header">
      <div class="modal-login-logo">
        <span class="material-icons">domain</span>
      </div>

      <div>
        <h2>Masuk ke Sistem</h2>
        <p>Sistem Pengelolaan Sampah Desa</p>
      </div>

      <button class="modal-login-close" @click="close">
        <span class="material-icons">close</span>
      </button>
    </div>

    <!-- Role Tabs -->
    <div class="modal-login-roles">
      <button
        class="login-role-tab"
        :class="{ active: role === 'petugas' }"
        @click="switchRole('petugas')"
      >
        <span class="material-icons">badge</span>
        <span>Petugas</span>
      </button>

      <button
        class="login-role-tab"
        :class="{ active: role === 'admin' }"
        @click="switchRole('admin')"
      >
        <span class="material-icons">admin_panel_settings</span>
        <span>Admin</span>
      </button>
    </div>

    <!-- Body -->
    <div class="modal-login-body">
      <p class="login-role-desc">
        {{ role === 'petugas'
          ? 'Kelola jadwal & status pengambilan sampah'
          : 'Kelola sistem & data desa'
        }}
      </p>

      <form @submit.prevent="submit">
        <!-- Username -->
        <div class="login-field">
          <label>
            <span class="material-icons">person</span>
            Username
          </label>
          <input
            v-model="username"
            type="text"
            placeholder="Masukkan username..."
            :class="{ error: errorUser }"
          />
          <span class="login-error">{{ errorUser }}</span>
        </div>

        <!-- Password -->
        <div class="login-field">
          <label>
            <span class="material-icons">lock</span>
            Password
          </label>

          <div class="login-pw-wrap">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              placeholder="Masukkan password..."
              :class="{ error: errorPass }"
            />
            <button type="button" @click="togglePassword">
              <span class="material-icons">
                {{ showPassword ? 'visibility_off' : 'visibility' }}
              </span>
            </button>
          </div>

          <span class="login-error">{{ errorPass }}</span>
        </div>

        <!-- Hint -->
        <div class="login-hint">
          <span class="material-icons">tips_and_updates</span>
          <span>
            Demo:
            <code>{{ role }}</code> /
            <code>{{ role === 'admin' ? 'admin123' : '1234' }}</code>
          </span>
        </div>

        <!-- Submit -->
        <button class="login-submit-btn" :disabled="loading">
          <span v-if="!loading">
            <span class="material-icons">login</span>
            Masuk
          </span>
          <span v-else>
            <span class="login-spinner"></span>
            Memverifikasi...
          </span>
        </button>
      </form>

      <div class="login-divider"><span>atau</span></div>

      <p class="login-public-note">
        Anda sudah berada di halaman publik.<br />
        Masyarakat tidak perlu login.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import '@/assets/styles/login.css'

const isOpen = ref(false)
const role = ref('petugas')

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)

const errorUser = ref('')
const errorPass = ref('')

const dummyAccounts = {
  petugas: { username: 'petugas', password: '1234', redirect: '/petugas' },
  admin: { username: 'admin', password: 'admin123', redirect: '/admin' }
}

function open() {
  isOpen.value = true
  document.body.style.overflow = 'hidden'
}

function close() {
  isOpen.value = false
  document.body.style.overflow = ''
  reset()
}

function switchRole(r) {
  role.value = r
  reset()
}

function togglePassword() {
  showPassword.value = !showPassword.value
}

function reset() {
  username.value = ''
  password.value = ''
  errorUser.value = ''
  errorPass.value = ''
  loading.value = false
}

function submit() {
  errorUser.value = ''
  errorPass.value = ''

  if (!username.value) {
    errorUser.value = 'Username tidak boleh kosong'
    return
  }
  if (!password.value) {
    errorPass.value = 'Password tidak boleh kosong'
    return
  }

  loading.value = true

  setTimeout(() => {
    const acc = dummyAccounts[role.value]
    if (
      acc.username === username.value &&
      acc.password === password.value
    ) {
      sessionStorage.setItem('loggedIn', 'true')
      sessionStorage.setItem('role', role.value)
      window.location.href = acc.redirect
    } else {
      errorPass.value = 'Username atau password salah'
      loading.value = false
      password.value = ''
    }
  }, 900)
}

defineExpose({ open })
</script>
