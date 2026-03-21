import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { Preferences } from '@capacitor/preferences' // 👈 AGREGA ESTA LÍNEA

export default defineRouter(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // 🔥 AGREGA TODO ESTE BLOQUE (JUSTO AQUÍ)
  Router.beforeEach(async (to, from, next) => {
    try {
      const { value: token } = await Preferences.get({ key: 'token' })

      if (to.meta.requiresAuth && !token) {
        return next('/')
      }

      if ((to.path === '/' || to.path === '/verify') && token) {
        return next('/home')
      }

      next()
    } catch (error) {
      console.error('Router error:', error)
      next() // 🔥 evita pantalla blanca
    }
  })

  return Router
})