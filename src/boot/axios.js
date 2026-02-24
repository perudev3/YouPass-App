import { boot } from 'quasar/wrappers'
import axios from 'axios'

const api = axios.create({
  //baseURL: 'http://127.0.0.1:8000/api'
  baseURL: 'https://srv1364430.hstgr.cloud/api'
})

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }
