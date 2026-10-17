import axios from 'axios'
import { AUTH_TOKEN_KEY } from '../constants/storage.js'

/**
 * Shared Axios instance for all API calls.
 * Base URL comes from VITE_API_URL, falling back to the /api/v1 contract path.
 */
const http = axios.create({
  baseURL: import.meta.env?.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // localStorage may be unavailable (SSR / privacy mode); ignore.
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // TODO: handle unauthorized (clear token, redirect to /login).
    }
    return Promise.reject(error)
  },
)

export default http
