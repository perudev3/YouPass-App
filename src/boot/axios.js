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

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api'
  //baseURL: 'https://srv1364430.hstgr.cloud/api'
})

export default boot(async ({ app, router }) => {

  api.interceptors.request.use(async (config) => {
    try {
      const token = await Storage.get('token')
      if (token) config.headers.Authorization = `Bearer ${token}`
    } catch (e) {
      console.error('Error interceptor:', e)
    }
    return config
  })

  api.interceptors.response.use(
    response => response,
    async error => {
      if (error.response?.status === 401 && error.config.url.includes('/auth/me')) {
        await Storage.remove('token')
        await Storage.remove('user')
        router.replace('/')
      }
      return Promise.reject(error)
    }
  )

  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }