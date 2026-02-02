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
    <q-drawer
      v-model="leftDrawerOpen"
      side="left"
      overlay
      bordered
      class="drawer"
    >
      <div class="drawer-header">
        <div class="drawer-logo">YouPass</div>
      </div>

      <q-list padding>

        <q-item clickable to="/">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>Inicio</q-item-section>
        </q-item>

        <q-item clickable>
          <q-item-section avatar>
            <q-icon name="event" />
          </q-item-section>
          <q-item-section>Eventos</q-item-section>
        </q-item>

        <q-item clickable>
          <q-item-section avatar>
            <q-icon name="confirmation_number" />
          </q-item-section>
          <q-item-section>Mis entradas</q-item-section>
        </q-item>

        <q-item clickable>
          <q-item-section avatar>
            <q-icon name="local_offer" />
          </q-item-section>
          <q-item-section>Promociones</q-item-section>
        </q-item>

        <q-separator spaced />

        <q-item clickable>
          <q-item-section avatar>
            <q-icon name="help_outline" />
          </q-item-section>
          <q-item-section>Ayuda</q-item-section>
        </q-item>

        <q-item clickable to="/login-phone">
          <q-item-section avatar>
            <q-icon name="login" />
          </q-item-section>
          <q-item-section>Iniciar sesión</q-item-section>
        </q-item>

      </q-list>
    </q-drawer>

    <!-- PÁGINAS -->
    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const leftDrawerOpen = ref(false)
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
