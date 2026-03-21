<template>
  <q-layout view="hHh Lpr lFf">

    <!-- HEADER -->
    <q-header v-if="!$route.meta.hideHeader" class="top-bar" elevated>
      <q-toolbar class="toolbar-inner">

        <!-- BOTÓN MENU -->
        <q-btn flat round icon="menu" color="white" @click="leftDrawerOpen = true" />

        <!-- LOGO + MODO FIESTA -->
        <div class="row items-center q-gutter-sm">

          <!-- MODO FIESTA -->
          <div v-if="isAuthenticated" class="row items-center q-gutter-xs fiesta-switch-container">
            <q-toggle :model-value="modoFiesta" color="amber" keep-color icon="celebration"
              @update:model-value="toggleModoFiesta" />

            <span class="fiesta-label">
              Modo Fiesta
            </span>
          </div>

        </div>

      </q-toolbar>
    </q-header>


    <!-- DRAWER -->
    <q-drawer v-model="leftDrawerOpen" side="left" bordered class="drawer">

      <!-- PERFIL -->
      <div v-if="isAuthenticated" class="drawer-header row items-center q-gutter-sm">
        <q-icon :name="profileIcon" size="32px" />
        <div class="column">
          <span class="text-weight-bold">{{ user?.user?.name }}</span>
          <span class="text-caption">Mi perfil</span>
        </div>
      </div>

      <q-list padding>

        <q-item clickable to="/home">
          <q-item-section avatar><q-icon name="home" /></q-item-section>
          <q-item-section>Inicio</q-item-section>
        </q-item>

        <q-item clickable to="/my-tickets">
          <q-item-section avatar><q-icon name="confirmation_number" /></q-item-section>
          <q-item-section>Mis Tickets</q-item-section>
        </q-item>

        <q-item clickable to="/my-invitations">
          <q-item-section avatar><q-icon name="confirmation_number" /></q-item-section>
          <q-item-section>Mis Invitaciones</q-item-section>
        </q-item>

        <q-separator spaced />

        <q-item clickable to="/configurations">
          <q-item-section avatar><q-icon name="settings" /></q-item-section>
          <q-item-section>Configuración</q-item-section>
        </q-item>

        <q-item v-if="!loadingAuth && isAuthenticated" clickable @click="logout">
          <q-item-section avatar><q-icon name="logout" /></q-item-section>
          <q-item-section>Cerrar Sesión</q-item-section>
        </q-item>

      </q-list>

      <!-- LOGO ABAJO -->
      <div class="q-pa-md text-center">
        <img src="/logo-sin-fondo.png" width="120" />
      </div>

    </q-drawer>


    <!-- PÁGINAS -->
    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import Swal from 'sweetalert2'
import { Preferences } from '@capacitor/preferences'

const leftDrawerOpen = ref(false)
const router = useRouter()

const token = ref(null)
const user = ref(null)
const loadingAuth = ref(true)


const loadToken = async () => {
  const { value } = await Preferences.get({ key: 'token' })
  token.value = value
}

const modoFiesta = computed({
  get: () => !!user.value?.user?.mood_partty,
  set: (val) => {
    if (user.value?.user) user.value.user.mood_partty = val ? 1 : 0
  }
})

const toggleModoFiesta = async (val) => {
  if (val) {
    try {
      const res = await api.post('/auth/mood_partty/status', { mood_partty: 1 })
      if (res.data.status === 'success') {
        if (user.value?.user) user.value.user.mood_partty = 1
        localStorage.setItem('modoFiesta', true)
        window.dispatchEvent(new CustomEvent('modo-fiesta-changed', { detail: true }))
        await Swal.fire({
          title: '¡Modo Fiesta Activado! 🎉',
          text: res.data.message,
          icon: 'success',
          confirmButtonText: '¡Vamos!',
          confirmButtonColor: '#FFC220',
          background: '#0F172A',
          color: '#E5E7EB',
          iconColor: '#4ADE80',
          customClass: { popup: 'swal-dark-popup', confirmButton: 'swal-confirm-btn' }
        })
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Compra entradas de algún evento para activar Modo Fiesta'
      if (user.value?.user) user.value.user.mood_partty = 0
      const result = await Swal.fire({
        title: 'Modo Fiesta 🎟️',
        text: msg,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ver Eventos',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#FFC220',
        cancelButtonColor: '#374151',
        background: '#0F172A',
        color: '#E5E7EB',
        iconColor: '#FFC220',
        customClass: { popup: 'swal-dark-popup', confirmButton: 'swal-confirm-btn' }
      })
      if (result.isConfirmed) { router.push('/home'); leftDrawerOpen.value = false }
    }
    return
  }

  try {
    await api.post('/auth/mood_partty/status', { mood_partty: 0 })
    if (user.value?.user) user.value.user.mood_partty = 0
    localStorage.setItem('modoFiesta', false)
    window.dispatchEvent(new CustomEvent('modo-fiesta-changed', { detail: false }))
  } catch (error) {
    console.error('Error desactivando mood:', error)
    if (user.value?.user) user.value.user.mood_partty = 1
  }
}

const loadUser = async () => {
  if (!token.value) {
    user.value = null
    loadingAuth.value = false
    return
  }

  try {
    api.defaults.headers.common.Authorization = `Bearer ${token.value}`
    const res = await api.get('/auth/me')
    user.value = res.data
  } catch (error) {
    console.log('ERROR AUTH:', error.response?.status)
    if (error.response?.status === 401) {
      await Preferences.remove({ key: 'token' })
      await Preferences.remove({ key: 'user' })
      token.value = null
      user.value = null
    }
  } finally {
    loadingAuth.value = false
  }
}

const logout = async () => {
  await Preferences.remove({ key: 'token' })
  await Preferences.remove({ key: 'user' })

  user.value = null
  token.value = null

  window.dispatchEvent(new Event('auth-changed'))
  router.replace('/')
}


const isAuthenticated = computed(() => {
  if (loadingAuth.value) return true // 👈 CLAVE
  return !!user.value
})

const profileIcon = computed(() => {
  if (!user.value?.gender) return 'account_circle'
  switch (user.value.gender) {
    case 'Hombre': return 'male'
    case 'Mujer': return 'female'
    default: return 'person'
  }
})

const handleAuthChange = async () => {
  await loadToken()
  await loadUser()
}

onMounted(async () => {
  await loadToken()
  await loadUser()
  window.addEventListener('auth-changed', handleAuthChange)
})

onUnmounted(() => {
  window.removeEventListener('auth-changed', handleAuthChange)
})
</script>


<style scoped>
/* =========================================================
   LAYOUT FIX — header fijo, contenido scrolleable
   =========================================================
   La clave está en q-layout view="hHh Lpr lFf":
   - h = header fixed (mayúscula H = fixed, minúscula = scroll)
   - Quasar calcula automáticamente el padding-top del
     q-page-container para que el contenido no quede tapado.
   ========================================================= */

:deep(.q-page) {
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

:deep(.q-page-container) {
  padding-bottom: env(safe-area-inset-bottom);
}

/* =========================================================
   TOP BAR
========================================================= */
.top-bar {
  /* ✅ position: fixed lo maneja Quasar con view="hHh..." */
  z-index: 1000;

  background: linear-gradient(90deg,
      #020617 0%,
      #0F172A 60%,
      #020617 100%);
  color: #FFFFFF;
  border-bottom: 1px solid #1F2937;
  box-shadow: 0 2px 12px rgba(255, 194, 32, 0.08);
  backdrop-filter: blur(6px);

  /* ✅ Safe area iOS notch / Android cámara */
  padding-top: max(8px, env(safe-area-inset-top));
}

/* Línea dorada inferior */
.top-bar::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg,
      transparent,
      #FFC220,
      #F5B300,
      #FFC220,
      transparent);
}

/* =========================================================
   TOOLBAR INTERIOR
========================================================= */
.toolbar-inner {
  height: 56px;
  min-height: 56px;
  padding-left: max(12px, env(safe-area-inset-left));
  padding-right: max(12px, env(safe-area-inset-right));
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Botón menú */
.top-bar .q-btn {
  color: #E5E7EB;
  transition: all 0.25s ease;
  border-radius: 12px;
}

.top-bar .q-btn:hover {
  background: rgba(255, 194, 32, 0.12);
  color: #FFC220;
  transform: scale(1.05);
}

.top-bar .q-btn:active {
  transform: scale(0.95);
}

/* Logo */
.logo {
  font-weight: 900;
  font-size: 0.1rem;
  letter-spacing: 0.6px;
  background: linear-gradient(135deg, #FFC220, #FFD84D, #F5B300);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 10px rgba(255, 194, 32, 0.35);
  user-select: none;
  margin: -10px;
}

/* =========================================================
   DRAWER
========================================================= */
.drawer {
  background: #0F172A;
  color: #E5E7EB;
}

:deep(.q-drawer--left.q-drawer--bordered) {
  border-right: 1px solid #1F2937 !important;
}

/* PERFIL HEADER */
.drawer-header {
  padding: 18px 16px;
  margin: 12px;
  border-radius: 16px;
  background: linear-gradient(135deg, #111827, #020617);
  border: 1px solid rgba(255, 194, 32, 0.25);
  box-shadow: 0 0 12px rgba(255, 194, 32, 0.15);
  transition: all 0.3s ease;
}

.drawer-header:hover {
  box-shadow: 0 0 18px rgba(255, 194, 32, 0.35);
}

.drawer-header .q-icon {
  font-size: 32px;
  background: #FFC220;
  color: #1A1A1A;
  padding: 10px;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 194, 32, 0.6);
}

.drawer-header .text-weight-bold {
  color: #FFFFFF;
  font-size: 0.95rem;
  letter-spacing: 0.3px;
}

.drawer-header .text-caption {
  color: #9CA3AF;
  font-size: 0.75rem;
}

/* =========================================================
   ITEMS MENU
========================================================= */
:deep(.q-item) {
  background: #0F172A !important;
  color: #E5E7EB !important;
  border-radius: 12px;
  margin: 4px 8px;
  transition: all 0.25s ease;
}

:deep(.q-item__label),
:deep(.q-item__section--main) {
  color: #E5E7EB !important;
  opacity: 1 !important;
}

:deep(.q-item .q-icon) {
  color: #9CA3AF !important;
}

:deep(.q-item:hover) {
  background: #1F2937 !important;
  color: #FFFFFF !important;
}

:deep(.q-item:hover .q-icon) {
  color: #FFC220 !important;
}

:deep(.q-item.q-router-link--active),
:deep(.q-item--active) {
  background: #FFC220 !important;
  color: #1A1A1A !important;
  font-weight: 600;
}

:deep(.q-item.q-router-link--active .q-item__label),
:deep(.q-item--active .q-item__label) {
  color: #1A1A1A !important;
}

:deep(.q-item.q-router-link--active .q-icon),
:deep(.q-item--active .q-icon) {
  color: #1A1A1A !important;
}

/* =========================================================
   SEPARADOR
========================================================= */
:deep(.q-separator) {
  background: #000000;
  height: 1px;
  opacity: 1;
}

/* =========================================================
   LOGO INFERIOR DRAWER
========================================================= */
.drawer img {
  opacity: 0.9;
  filter: drop-shadow(0 0 6px rgba(255, 194, 32, 0.35));
  transition: all 0.3s ease;
}

.drawer img:hover {
  opacity: 1;
  transform: scale(1.05);
}

/* =========================================================
   SCROLLBAR DRAWER
========================================================= */
.drawer ::-webkit-scrollbar {
  width: 6px;
}

.drawer ::-webkit-scrollbar-thumb {
  background: #FFC220;
  border-radius: 10px;
}

.drawer ::-webkit-scrollbar-track {
  background: transparent;
}

/* =========================================================
   OVERLAY DRAWER MOBILE
========================================================= */
:deep(.q-drawer__backdrop) {
  background: rgba(2, 6, 23, 0.7);
  backdrop-filter: blur(4px);
}

/* =========================================================
   MODO FIESTA SWITCH
========================================================= */
.fiesta-switch-container {
  border-radius: 14px;
  padding: 10px 14px;
  transition: all 0.3s ease;
}

.fiesta-switch-container:hover {
  border-color: rgba(255, 194, 32, 0.35);
  box-shadow: 0 0 10px rgba(255, 194, 32, 0.12);
}

.fiesta-icon {
  color: #FFC220 !important;
  filter: drop-shadow(0 0 4px rgba(255, 194, 32, 0.5));
}

.fiesta-label {
  color: #E5E7EB;
  font-size: 0.88rem;
  font-weight: 500;
  letter-spacing: 0.2px;
}

.fiesta-dot {
  color: #4ADE80 !important;
  animation: pulse-dot 1.5s ease-in-out infinite;
}

.fiesta-status-text {
  color: #9CA3AF;
  font-size: 0.72rem;
  letter-spacing: 0.2px;
}

@keyframes pulse-dot {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}
</style>