<template>
  <q-layout view="hHh Lpr lFf">

    <!-- HEADER -->
    <q-header v-if="!$route.meta.hideHeader" class="top-bar" elevated>
      <q-toolbar class="toolbar-inner">

        <q-btn flat round icon="menu" color="white" @click="leftDrawerOpen = true" />

        <div class="row items-center q-gutter-sm">
          <div v-if="isAuthenticated" class="fiesta-switch-container row items-center q-gutter-xs"
            :class="{ 'fiesta-active': modoFiesta }">
            <q-toggle
              :model-value="modoFiesta"
              color="amber"
              keep-color
              icon="celebration"
              @update:model-value="toggleModoFiesta"
            />
            <span class="fiesta-label" :class="{ 'fiesta-label--active': modoFiesta }">
              {{ modoFiesta ? '🎉 Modo Fiesta' : 'Modo Fiesta' }}
            </span>
          </div>
        </div>

      </q-toolbar>
    </q-header>

    <!-- DRAWER -->
    <q-drawer v-model="leftDrawerOpen" side="left" bordered class="drawer">

      <div v-if="isAuthenticated" class="drawer-header row items-center q-gutter-sm">
        <q-icon :name="profileIcon" size="32px" />
        <div class="column">
          <span class="text-weight-bold">{{ user?.name }}</span>
          <span class="text-caption">Mi perfil</span>
        </div>
      </div>

      <q-list padding>
        <q-item clickable to="/home">
          <q-item-section avatar><q-icon name="home" /></q-item-section>
          <q-item-section>Inicio</q-item-section>
        </q-item>
        <q-item clickable>
          <q-item-section avatar><q-icon name="local_bar" /></q-item-section>
          <q-item-section>Mis compras</q-item-section>
        </q-item>
        <q-item v-if="!modoFiesta" clickable to="/my-tickets">
          <q-item-section avatar><q-icon name="confirmation_number" /></q-item-section>
          <q-item-section>Mis Tickets</q-item-section>
        </q-item>
        <q-item v-if="!modoFiesta" clickable to="/my-invitations">
          <q-item-section avatar><q-icon name="confirmation_number" /></q-item-section>
          <q-item-section>Mis Invitaciones</q-item-section>
        </q-item>
        <q-separator spaced />
        <q-item clickable to="/configurations">
          <q-item-section avatar><q-icon name="settings" /></q-item-section>
          <q-item-section>Configuración</q-item-section>
        </q-item>
        <q-item v-if="isAuthenticated  && !modoFiesta" clickable @click="logout">
          <q-item-section avatar><q-icon name="logout" /></q-item-section>
          <q-item-section>Cerrar Sesión</q-item-section>
        </q-item>
      </q-list>

      <div class="q-pa-md text-center">
        <img src="/logo-2-sin-fondo.png" width="120" />
      </div>

    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { api, Storage } from 'boot/axios'
import Swal from 'sweetalert2'
import { Capacitor } from '@capacitor/core'

const leftDrawerOpen = ref(false)
const router = useRouter()

const token = ref(null)
const user = ref(null)
const loadingAuth = ref(true)
const modoFiesta = ref(false)

// ── AUTH ────────────────────────────────────────────────────
const loadToken = async () => {
  token.value = await Storage.get('token')
}

const loadUser = async () => {
  if (!token.value) {
    user.value = null
    loadingAuth.value = false
    return
  }
  try {
    const res = await api.get('/auth/me')
    user.value = res.data.user 
    // Sincronizar modoFiesta desde el estado del usuario en el servidor
    modoFiesta.value = !!user.value?.mood_partty
    // Persistir en Storage para que IndexPage lo lea
    await Storage.set('modoFiesta', modoFiesta.value)
  } catch (error) {
    if (error.response?.status === 401) {
      await Storage.remove('token')
      await Storage.remove('user')
      token.value = null
      user.value = null
    }
  } finally {
    loadingAuth.value = false
  }
}

const logout = async () => {
  await Storage.remove('token')
  await Storage.remove('user')
  await Storage.remove('modoFiesta')
  user.value = null
  token.value = null
  modoFiesta.value = false
  window.dispatchEvent(new Event('auth-changed'))
  router.replace('/')
}

// ── MODO FIESTA ────────────────────────────────────────────
const toggleModoFiesta = async (val) => {
  if (val) {
    try {
      const res = await api.post('/auth/mood_partty/status', { mood_partty: 1 })
      if (res.data.status === 'success') {
        modoFiesta.value = true
        if (user.value) user.value.mood_partty = 1
        await Storage.set('modoFiesta', 'true')
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
        })
      }
    } catch (error) {
      modoFiesta.value = false
      if (user.value) user.value.mood_partty = 0
      const msg = error.response?.data?.message || 'Compra entradas de algún evento para activar Modo Fiesta'
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
      })
      if (result.isConfirmed) { router.push('/home'); leftDrawerOpen.value = false }
    }
    return
  }

  try {
    await api.post('/auth/mood_partty/status', { mood_partty: 0 })
    modoFiesta.value = false
    if (user.value?.user) user.value.user.mood_partty = 0
    await Storage.set('modoFiesta', 'false')
    window.dispatchEvent(new CustomEvent('modo-fiesta-changed', { detail: false }))
  } catch (error) {
    console.error('Error desactivando mood:', error)
    modoFiesta.value = true
  }
}

// ── COMPUTED ───────────────────────────────────────────────
const isAuthenticated = computed(() => {
  if (loadingAuth.value) return true
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

// ── LIFECYCLE ──────────────────────────────────────────────
const handleAuthChange = async () => {
  await loadToken()
  await loadUser()
}

onMounted(async () => {
  if (Capacitor.isNativePlatform()) {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#020617' })
    await StatusBar.setOverlaysWebView({ overlay: true })
  }

  await loadToken()
  await loadUser()
  window.addEventListener('auth-changed', handleAuthChange)
})

onUnmounted(() => {
  window.removeEventListener('auth-changed', handleAuthChange)
})
</script>

<style scoped>
:deep(.q-layout) { padding-bottom: env(safe-area-inset-bottom); }
:deep(.q-page) {
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  min-height: calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
}
:deep(.q-page-container) {
  padding-bottom: calc(env(safe-area-inset-bottom)) !important;
  min-height: calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
}

/* TOP BAR */
.top-bar {
  z-index: 1000;
  background: linear-gradient(90deg, #020617 0%, #0F172A 60%, #020617 100%);
  color: #FFFFFF;
  border-bottom: 1px solid #1F2937;
  box-shadow: 0 2px 12px rgba(255, 194, 32, 0.08);
  backdrop-filter: blur(6px);
  padding-top: max(8px, env(safe-area-inset-top));
  min-height: calc(56px + env(safe-area-inset-top));
}
.top-bar::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; width: 100%; height: 2px;
  background: linear-gradient(90deg, transparent, #FFC220, #F5B300, #FFC220, transparent);
}

.toolbar-inner {
  height: 56px; min-height: 56px;
  padding-left: max(12px, env(safe-area-inset-left));
  padding-right: max(12px, env(safe-area-inset-right));
  display: flex; align-items: center; justify-content: space-between;
}

/* FIESTA SWITCH */
.fiesta-switch-container {
  border-radius: 14px;
  padding: 6px 12px;
  transition: all 0.4s ease;
  border: 1px solid transparent;
}
/* .fiesta-switch-container.fiesta-active {
  background: rgba(255, 194, 32, 0.08);
  border-color: rgba(255, 194, 32, 0.3);
  box-shadow: 0 0 16px rgba(255, 194, 32, 0.15);
  animation: fiesta-pulse 2s ease-in-out infinite;
} */
@keyframes fiesta-pulse {
  0%, 100% { box-shadow: 0 0 12px rgba(255, 194, 32, 0.15); }
  50%       { box-shadow: 0 0 24px rgba(255, 194, 32, 0.35); }
}
.fiesta-label {
  color: #9CA3AF;
  font-size: 0.82rem;
  font-weight: 500;
  transition: all 0.3s ease;
}
.fiesta-label--active {
  color: #FFC220;
  font-weight: 700;
}

/* DRAWER */
.drawer {
  background: #0F172A;
  color: #E5E7EB;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: border-box;
}
:deep(.q-drawer) {
  top: env(safe-area-inset-top) !important;
  height: calc(100% - env(safe-area-inset-top) - env(safe-area-inset-bottom)) !important;
  padding-bottom: env(safe-area-inset-bottom);
}
:deep(.q-drawer__content) {
  overflow-y: auto; height: 100%;
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: border-box;
}
:deep(.q-drawer--left.q-drawer--bordered) { border-right: 1px solid #1F2937 !important; }

.drawer-header {
  padding: 18px 16px; margin: 12px;
  border-radius: 16px;
  background: linear-gradient(135deg, #111827, #020617);
  border: 1px solid rgba(255, 194, 32, 0.25);
  box-shadow: 0 0 12px rgba(255, 194, 32, 0.15);
}
.drawer-header .q-icon {
  font-size: 32px; background: #FFC220; color: #1A1A1A;
  padding: 10px; border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 194, 32, 0.6);
}
.drawer-header .text-weight-bold { color: #FFFFFF; font-size: 0.95rem; }
.drawer-header .text-caption      { color: #9CA3AF; font-size: 0.75rem; }

:deep(.q-item) {
  background: #0F172A !important; color: #E5E7EB !important;
  border-radius: 12px; margin: 4px 8px; transition: all 0.25s ease;
}
:deep(.q-item__label), :deep(.q-item__section--main) { color: #E5E7EB !important; }
:deep(.q-item .q-icon) { color: #9CA3AF !important; }
:deep(.q-item:hover) { background: #1F2937 !important; }
:deep(.q-item:hover .q-icon) { color: #FFC220 !important; }
:deep(.q-item.q-router-link--active), :deep(.q-item--active) {
  background: #FFC220 !important; color: #1A1A1A !important; font-weight: 600;
}
:deep(.q-item.q-router-link--active .q-item__label),
:deep(.q-item--active .q-item__label) { color: #1A1A1A !important; }
:deep(.q-item.q-router-link--active .q-icon),
:deep(.q-item--active .q-icon) { color: #1A1A1A !important; }
:deep(.q-separator) { background: #000000; height: 1px; opacity: 1; }

.drawer img {
  opacity: 0.9;
  filter: drop-shadow(0 0 6px rgba(255, 194, 32, 0.35));
}
:deep(.q-drawer__backdrop) {
  background: rgba(2, 6, 23, 0.7);
  backdrop-filter: blur(4px);
}
</style>