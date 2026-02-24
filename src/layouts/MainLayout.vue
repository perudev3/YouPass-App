<template>
  <q-layout view="lHh Lpr lFf">

    <!-- HEADER -->
    <q-header
      v-if="!$route.meta.hideHeader"
      class="top-bar"
    >
      <q-toolbar class="row items-center justify-between q-px-md">
        <q-btn
          flat
          round
          icon="menu"
          color="white"
          @click="leftDrawerOpen = true"
        />
        <span class="logo">
          <img src="/logo-sin-fondo.png" width="120" />
        </span>
      </q-toolbar>
    </q-header>


    <!-- DRAWER -->
    <q-drawer v-model="leftDrawerOpen" side="left" bordered class="drawer">

      <!-- PERFIL -->
      <div v-if="isAuthenticated" class="drawer-header row items-center q-gutter-sm">
        <q-icon :name="profileIcon" size="32px" />
        <div class="column">
          <span class="text-weight-bold">{{ user.user.name }}</span>
          <span class="text-caption">Mi perfil</span>
        </div>

        <!-- MODO FIESTA SWITCH -->
        <div v-if="isAuthenticated" class="fiesta-switch-container q-mx-md q-mb-sm">
          <div class="fiesta-switch-row row items-center justify-between">
            <div class="row items-center q-gutter-xs">
              <span class="fiesta-label">Modo Fiesta</span>
            </div>
            <q-toggle
              :model-value="modoFiesta"
              color="amber"
              keep-color
              @update:model-value="toggleModoFiesta"
            />
          </div>
          <div v-if="modoFiesta" class="fiesta-badge row items-center q-gutter-xs q-mt-xs">
            <span class="fiesta-status-text">Activo · Listo para la fiesta 🎉</span>
          </div>
        </div>
      </div>

      <q-list padding>

        <q-item clickable to="/home">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>Inicio</q-item-section>
        </q-item>

        <q-item clickable to="/my-tickets">
          <q-item-section avatar>
            <q-icon name="confirmation_number" />
          </q-item-section>
          <q-item-section>Mis Tickets</q-item-section>
        </q-item>

        <q-item clickable to="/my-invitations">
          <q-item-section avatar>
            <q-icon name="confirmation_number" />
          </q-item-section>
          <q-item-section>Mis Invitaciones</q-item-section>
        </q-item>

        <q-separator spaced />

        <q-item clickable to="/configuracion">
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>Configuración</q-item-section>
        </q-item>

        <!-- LOGIN / LOGOUT -->
        <q-item
          v-if="!loadingAuth && isAuthenticated"
          clickable
          @click="logout"
        >
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section>Salir</q-item-section>
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
import { ref, computed, onMounted,onUnmounted, watch} from 'vue'
import {  useRouter } from 'vue-router'
import { api } from 'boot/axios' 
import Swal from 'sweetalert2'

const leftDrawerOpen = ref(false)
const router = useRouter()

const token = ref(localStorage.getItem('token'))
const user = ref(null)
const loadingAuth = ref(true)


// Modo Fiesta — basado en el dato del usuario
const modoFiesta = computed({
  get: () => !!user.value?.user?.mood_partty,
  set: (val) => {
    if (user.value?.user) {
      user.value.user.mood_partty = val ? 1 : 0
    }
  }
})

const toggleModoFiesta = async (val) => {
  if (val) {
    try {
      const res = await api.post('/auth/mood_partty/status', { mood_partty: 1 })

      if (res.data.status === 'success') {
        if (user.value?.user) {
          user.value.user.mood_partty = 1
        }
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
          customClass: {
            popup: 'swal-dark-popup',
            confirmButton: 'swal-confirm-btn',
          }
        })

      }
    } catch (error) {
      // El backend retorna error — el usuario no tiene entradas
      const msg = error.response?.data?.message || 'Compra entradas de algún evento para activar Modo Fiesta'

      if (user.value?.user) {
        user.value.user.mood_partty = 0
      }

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
        customClass: {
          popup: 'swal-dark-popup',
          confirmButton: 'swal-confirm-btn',
        }
      })

      if (result.isConfirmed) {
        router.push('/home')
        leftDrawerOpen.value = false
      }
    }

    return
  }

  // Desactivar
  try {
    await api.post('/auth/mood_partty/status', { mood_partty: 0 })
    if (user.value?.user) {
      user.value.user.mood_partty = 0
    }
    window.dispatchEvent(new CustomEvent('modo-fiesta-changed', { detail: false }))
  } catch (error) {
    console.error('Error desactivando mood:', error)
    if (user.value?.user) {
      user.value.user.mood_partty = 1
    }
  }
}
const loadUser = async () => {
  if (!token.value) {
    user.value = null
    loadingAuth.value = false
    return
  }

  try {
    api.defaults.headers.common.Authorization =
      `Bearer ${token.value}`

    const res = await api.get(
      '/auth/me'
    )

    user.value = res.data

  } catch (error) {
    console.log(error)

    // ⚠️ NO borres token si es throttle
    if (error.response?.status === 429) return

    localStorage.removeItem('token')
    token.value = null
    user.value = null

  } finally {
    loadingAuth.value = false
  }
}


const logout = () => {
  localStorage.removeItem('token')
  user.value = null
  token.value = null

  window.dispatchEvent(new Event('auth-changed'))

  router.replace('/')
}


watch(token, () => {
  loadUser()
})

const isAuthenticated = computed(() => {
  return !!user.value
})

const profileIcon = computed(() => {
  if (!user.value?.gender) return 'account_circle'

  switch (user.value.gender) {
    case 'Hombre':
      return 'male'
    case 'Mujer':
      return 'female'
    default:
      return 'person'
  }
})

const handleAuthChange = () => {
  token.value = localStorage.getItem('token')
  loadUser()
}

onMounted(() => {
  loadUser()
  window.addEventListener('auth-changed', handleAuthChange)
})

onUnmounted(() => {
  window.removeEventListener('auth-changed', handleAuthChange)
})


</script>

<style scoped>
.q-page-container{  
  padding-top: 0px !important;
}
.top-bar {
  height: 56px;
  position: relative;
  z-index: 1000;

  background: linear-gradient(
    90deg,
    #020617 0%,
    #0F172A 60%,
    #020617 100%
  );

  color: #FFFFFF;

  border-bottom: 1px solid #1F2937;

  box-shadow: 0 2px 12px rgba(255, 194, 32, 0.08);

  backdrop-filter: blur(6px);
}

.q-toolbar {
  min-height: 56px;
  padding-left: 12px;
  padding-right: 12px;
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

/* Logo texto */
.logo {
  font-weight: 900;
  font-size: 1.15rem;
  letter-spacing: 0.6px;

  background: linear-gradient(
    135deg,
    #FFC220,
    #FFD84D,
    #F5B300
  );

  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  text-shadow: 0 0 10px rgba(255, 194, 32, 0.35);
  user-select: none;
  margin: -10px;
}

/* Línea dorada inferior */
.top-bar::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;

  background: linear-gradient(
    90deg,
    transparent,
    #FFC220,
    #F5B300,
    #FFC220,
    transparent
  );
}


/* =========================================================
   DRAWER BASE
========================================================= */
.drawer {
  background: #0F172A;
  color: #E5E7EB;
}

.q-drawer--left.q-drawer--bordered {
  border-right: 1px solid #1F2937 !important;
}


/* =========================================================
   PERFIL HEADER
========================================================= */
.drawer-header {
  padding: 18px 16px;
  margin: 12px;
  border-radius: 16px;

  background: linear-gradient(
    135deg,
    #111827,
    #020617
  );

  border: 1px solid rgba(255, 194, 32, 0.25);

  box-shadow: 0 0 12px rgba(255, 194, 32, 0.15);

  transition: all 0.3s ease;
}

.drawer-header:hover {
  box-shadow: 0 0 18px rgba(255, 194, 32, 0.35);
}

/* Icono perfil */
.drawer-header .q-icon {
  font-size: 32px;

  background: #FFC220;
  color: #1A1A1A;

  padding: 10px;
  border-radius: 50%;

  box-shadow: 0 0 10px rgba(255, 194, 32, 0.6);
}

/* Nombre */
.drawer-header .text-weight-bold {
  color: #FFFFFF;
  font-size: 0.95rem;
  letter-spacing: 0.3px;
}

/* Subtexto */
.drawer-header .text-caption {
  color: #9CA3AF;
  font-size: 0.75rem;
}


/* =========================================================
   GÉNERO COLORES PERFIL
   (usa clase dinámica hombre / mujer)
========================================================= */
.drawer-header.hombre .q-icon {
  background: #2D8CFF;
  color: white;
  box-shadow: 0 0 10px rgba(45, 140, 255, 0.6);
}

.drawer-header.mujer .q-icon {
  background: #FF4DB8;
  color: white;
  box-shadow: 0 0 10px rgba(255, 77, 184, 0.6);
}

.drawer-header.otro .q-icon {
  background: #6C4DFF;
  color: white;
}


/* =========================================================
   ITEMS MENU
========================================================= */
.q-item {
  border-radius: 12px;
  margin: 4px 8px;
  transition: all 0.25s ease;
  color: #E5E7EB;
}

.q-item .q-icon {
  color: #9CA3AF;
  transition: all 0.25s ease;
}

/* Hover */
.q-item:hover {
  background: #1F2937;
  color: #FFFFFF;
}

.q-item:hover .q-icon {
  color: #FFC220;
}


/* =========================================================
   ITEM ACTIVO
========================================================= */
.q-item.q-router-link--active,
.q-item--active {
  background: #FFC220 !important;
  color: #1A1A1A !important;
  font-weight: 600;
}

.q-item.q-router-link--active .q-icon,
.q-item--active .q-icon {
  color: #1A1A1A !important;
}


/* =========================================================
   SEPARADORES
========================================================= */
.q-separator {
  background: #000000;
  height: 1px;
  opacity: 1;
}


/* =========================================================
   LOGO INFERIOR
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
   SCROLLBAR
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
   OVERLAY MOBILE
========================================================= */
.q-drawer__backdrop {
  background: rgba(2, 6, 23, 0.7);
  backdrop-filter: blur(4px);
}


/* =========================================================
   SAFE AREA MOBILE
========================================================= */
@supports (padding-top: env(safe-area-inset-top)) {
  .top-bar {
    padding-top: env(safe-area-inset-top);
    height: calc(56px + env(safe-area-inset-top));
  }
}

:deep(.q-item__section--main) {
  color: #E5E7EB !important;
}

/* =====================================================
   SIDEBAR ITEMS DARK MODE FIX
===================================================== */

/* Item base */
.q-item {
  background: #0F172A !important;   /* ← Fondo oscuro real */
  color: #E5E7EB !important;
  border-radius: 12px;
  margin: 4px 8px;
  transition: all 0.25s ease;
}

/* Texto */
.q-item__label,
.q-item__section--main {
  color: #E5E7EB !important;
  opacity: 1 !important;
}

/* Iconos */
.q-item .q-icon {
  color: #9CA3AF !important;
}

/* Hover */
.q-item:hover {
  background: #1F2937 !important;
  color: #FFFFFF !important;
}

.q-item:hover .q-icon {
  color: #FFC220 !important;
}

/* Activo */
.q-item.q-router-link--active,
.q-item--active {
  background: #FFC220 !important;
  color: #1A1A1A !important;
  font-weight: 600;
}

.q-item.q-router-link--active .q-item__label,
.q-item--active .q-item__label {
  color: #1A1A1A !important;
}

.q-item.q-router-link--active .q-icon,
.q-item--active .q-icon {
  color: #1A1A1A !important;
}


/* =========================================================
   MODO FIESTA SWITCH
========================================================= */
.fiesta-switch-container {
  background: linear-gradient(135deg, #111827, #020617);
  border: 1px solid rgba(255, 194, 32, 0.18);
  border-radius: 14px;
  padding: 10px 14px;
  transition: all 0.3s ease;
}

.fiesta-switch-container:hover {
  border-color: rgba(255, 194, 32, 0.35);
  box-shadow: 0 0 10px rgba(255, 194, 32, 0.12);
}

.fiesta-switch-row {
  width: 100%;
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

.fiesta-badge {
  padding-left: 2px;
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
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
