<template>
  <div
    class="modal-login-overlay"
    :class="{ active: isOpen }"
    @click.self="close"
  > </div>

  <div class="modal-login" :class="{ active: isOpen }">
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
        :class="{ active: role === 'kadus' }"
        @click="switchRole('kadus')"
      >
        <span class="material-icons">supervisor_account</span>
        <span>Kadus</span>
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

    <div class="modal-login-body">
      <p class="login-role-desc">
        {{ role === 'petugas'
          ? 'Kelola jadwal & status pengambilan sampah'
          : 'Lihat data desa'
        }}
      </p>

      <form @submit.prevent="submit">
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
import { useRouter } from 'vue-router'
import { apiFetch, decodeJwtPayload } from '../services/api'
// import '@/assets/styles/login.css'

const router = useRouter();

const isOpen = ref(false)
const role = ref('petugas')

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)

const errorUser = ref('')
const errorPass = ref('')

function open() {
  isOpen.value = true
  document.body.style.overflow = 'hidden'
}

const emit = defineEmits(['closed'])

function close() {
  isOpen.value = false
  document.body.style.overflow = ''
  emit('closed')
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

async function submit() {
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

    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        auth: false,
        body: {
          username: username.value,
          password: password.value,
          role: role.value,
        },
    })

    if (!data?.token) {
      throw new Error('Login gagal')
    }

    const payload = decodeJwtPayload(data.token)
    const normalizedRole = payload?.role ? payload.role.toLowerCase() : 'petugas'

    sessionStorage.setItem('token', data.token)
    sessionStorage.setItem('role', normalizedRole)
    sessionStorage.setItem('userName', payload?.name || 'Kadus/Kades')

    const dest =
      normalizedRole === 'admin'
        ? '/admin'
        : normalizedRole === 'kadus' || normalizedRole === 'kades'
        ? '/kadus'
        : '/petugas'

    router.push(dest)
  } catch (err) {
    errorPass.value = err?.message || 'Username atau password salah'
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>

<style src="@/assets/styles/login.css" scoped></style>