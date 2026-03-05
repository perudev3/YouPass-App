import { boot } from 'quasar/wrappers'
import axios from 'axios'

const api = axios.create({
  //baseURL: 'http://127.0.0.1:8000/api'
  baseURL: 'https://srv1364430.hstgr.cloud/api'
})

export default boot(({ app }) => {

  // 🔹 INTERCEPTOR PARA AGREGAR TOKEN
  api.interceptors.request.use((config) => {

    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })


  // 🔹 INTERCEPTOR PARA TOKEN EXPIRADO
  api.interceptors.response.use(
    response => response,
    error => {

      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        window.location.href = '/'
      }

      return Promise.reject(error)
    }
  )

  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api

})

export { api }