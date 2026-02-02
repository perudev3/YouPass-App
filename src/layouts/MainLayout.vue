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
        <span class="logo">YouPass</span>
      </q-toolbar>
    </q-header>


    <!-- DRAWER -->
    <q-drawer v-model="leftDrawerOpen" side="left" bordered class="drawer">

      <!-- PERFIL -->
      <div v-if="isAuthenticated" class="drawer-header row items-center q-gutter-sm">
        <q-icon :name="profileIcon" size="32px" />
        <div class="column">
          <span class="text-weight-bold">{{ user.name }}</span>
          <span class="text-caption">Mi perfil</span>
        </div>
      </div>

      <q-list padding>

        <q-item clickable to="/">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>Inicio</q-item-section>
        </q-item>

        <q-item clickable to="/entrada-general">
          <q-item-section avatar>
            <q-icon name="confirmation_number" />
          </q-item-section>
          <q-item-section>Compra Entrada General</q-item-section>
        </q-item>

        <q-item clickable to="/entrada-vip">
          <q-item-section avatar>
            <q-icon name="stars" />
          </q-item-section>
          <q-item-section>Compra Entrada VIP</q-item-section>
        </q-item>

        <q-item clickable to="/modo-fiesta">
          <q-item-section avatar>
            <q-icon name="celebration" />
          </q-item-section>
          <q-item-section>Modo Fiesta</q-item-section>
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
          v-if="!loadingAuth && !isAuthenticated"
          clickable
          to="/login-phone"
        >
          <q-item-section avatar>
            <q-icon name="login" />
          </q-item-section>
          <q-item-section>Iniciar sesión</q-item-section>
        </q-item>

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
        <img src="/logo-youpass.svg" width="120" />
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
import axios from 'axios'

const leftDrawerOpen = ref(false)
const user = ref(null)
const loadingAuth = ref(true)

const token = ref(localStorage.getItem('token'))

const loadUser = async () => {
  if (!token.value) {
    user.value = null
    loadingAuth.value = false
    return
  }

  try {
    axios.defaults.headers.common.Authorization = `Bearer ${token.value}`
    const res = await axios.get('http://127.0.0.1:8000/api/auth/me')
    user.value = res.data
  } catch (error) {
    localStorage.removeItem('token')
    console.log(error)
    token.value = null
    user.value = null
  } finally {
    loadingAuth.value = false
  }
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

onMounted(() => {
  loadUser()

  window.addEventListener('auth-changed', loadUser)
})


onUnmounted(() => {
  window.removeEventListener('auth-changed', loadUser)
})
</script>

<style scoped>
.top-bar {
  height: 56px;
  background: #020617;
  color: white;
}

.logo {
  font-weight: 900;
  font-size: 1.2rem;
}

/* DRAWER */
.drawer {
  background: #020617;
  color: white;
}

.drawer-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.drawer-logo {
  font-weight: 900;
  font-size: 1.4rem;
}
</style>
