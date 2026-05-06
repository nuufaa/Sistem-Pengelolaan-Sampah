// import axios from 'axios';

// const api = axios.create({
//     baseURL: 'http://localhost:3000/api',
//     headers: {
//     "Content-Type": "application/json"
//   }
// });

// export default api;

// src/api/api.js

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 15000, // 15 detik timeout untuk setiap request
})

api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export async function apiFetch(path, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    auth = true,
  } = options

  const finalHeaders = {
    Accept: 'application/json',
    ...headers,
  }

  if (auth) {
    const token = sessionStorage.getItem('token')
    if (token) {
      finalHeaders.Authorization = `Bearer ${token}`
    }
  }

  let finalBody = body
  if (body !== undefined && body !== null && typeof body === 'object' && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = finalHeaders['Content-Type'] || 'application/json'
    finalBody = JSON.stringify(body)
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: finalBody,
  })

  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => '')

  if (!res.ok) {
    const message = payload?.message || (typeof payload === 'string' ? payload : '') || `Request gagal (${res.status})`
    throw new Error(message)
  }

  return payload
}

export function decodeJwtPayload(token) {
  const part = token?.split?.('.')?.[1]
  if (!part) return null

  const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')

  try {
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}