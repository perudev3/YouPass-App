import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { Preferences } from '@capacitor/preferences'
import { Platform } from 'quasar'

const api = axios.create({
  //baseURL: 'http://127.0.0.1:8000/api'
  baseURL: 'https://srv1364430.hstgr.cloud/api'
})

export default boot(async ({ app, router }) => {

  let token = null

  try {
    if (Platform.is.capacitor) {
      // SOLO en móvil
      const res = await Preferences.get({ key: 'token' })
      token = res.value
    } else {
      // fallback web
      token = localStorage.getItem('token')
    }
  } catch (e) {
    console.error('Error obteniendo token:', e)
  }

  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  api.interceptors.request.use(async (config) => {
    try {
      let token = null

      if (Platform.is.capacitor) {
        const res = await Preferences.get({ key: 'token' })
        token = res.value
      } else {
        token = localStorage.getItem('token')
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (e) {
      console.error('Error interceptor:', e)
    }

    return config
  })

  api.interceptors.response.use(
    response => response,
    async error => {
      if (
        error.response &&
        error.response.status === 401 &&
        error.config.url.includes('/auth/me')
      ) {
        if (Platform.is.capacitor) {
          await Preferences.remove({ key: 'token' })
          await Preferences.remove({ key: 'user' })
        } else {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }

        router.replace('/')
      }
      return Promise.reject(error)
    }
  )

  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }