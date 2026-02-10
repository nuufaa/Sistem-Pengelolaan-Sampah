<template>
  <div class="login-wrapper">
    <div class="login-card">
      <h2>Login Sistem</h2>

      <form @submit.prevent="handleLogin">
        <input v-model="username" type="text" placeholder="Username" required />
        <input v-model="password" type="password" placeholder="Password" required />

        <button type="submit" :disabled="loading">
          {{ loading ? 'Memproses...' : 'Login' }}
        </button>
      </form>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import '@/assets/login.css'

const router = useRouter()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    const res = await api.post('/login', {
      username: username.value,
      password: password.value
    })

    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user_type', res.data.type)

    if (res.data.type === 'admin') {
      router.push('/admin/dashboard')
    } else if (res.data.type === 'petugas') {
      router.push('/petugas/dashboard')
    }
  } catch (err) {
    error.value = 'Username atau password salah'
  } finally {
    loading.value = false
  }
}
</script>
