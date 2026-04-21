import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { Preferences } from '@capacitor/preferences'

export const Storage = {
  async get(key) {
    const { value } = await Preferences.get({ key })
    return value
  },
  async set(key, value) {
    await Preferences.set({ key, value: String(value) })
  },
  async remove(key) {
    await Preferences.remove({ key })
  }
}

export const api = axios.create({
  baseURL: 'https://srv1364430.hstgr.cloud/api'
})

let _token = null
export const setToken = (t) => { _token = t }
export const clearToken = () => { _token = null }
export const getToken = () => _token

api.interceptors.request.use((config) => {
  if (_token) config.headers.Authorization = `Bearer ${_token}`
  return config
})

api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401 && error.config?.url?.includes('/auth/me')) {
      await Storage.remove('token')
      await Storage.remove('user')
      clearToken()
      window.dispatchEvent(new Event('auth-changed'))
    }
    return Promise.reject(error)
  }
)

// ✅ CLAVE: carga el token en memoria durante el boot,
// antes de que cualquier componente se monte
export default boot(async ({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api

  const tokenValue = await Storage.get('token')
  if (tokenValue) {
    _token = tokenValue
    console.log('boot: token cargado en memoria')
  } else {
    console.log('boot: sin token')
  }
})