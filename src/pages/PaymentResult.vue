<template>
  <q-page class="result-page">
    <div class="result-card">

      <!-- SUCCESS -->
      <template v-if="status === 'success'">
        <div class="icon-wrap success">
          <q-icon name="check_circle" size="64px" color="positive" />
        </div>
        <div class="result-title">¡Pago exitoso! 🎉</div>
        <div class="result-sub">Tu entrada está lista en "Mis tickets"</div>
        <q-btn unelevated class="result-btn" label="Ver mis tickets" @click="router.push('/my-tickets')" />
      </template>

      <!-- CANCELLED -->
      <template v-else-if="status === 'cancelled'">
        <div class="icon-wrap warn">
          <q-icon name="cancel" size="64px" color="warning" />
        </div>
        <div class="result-title">Pago cancelado</div>
        <div class="result-sub">Cancelaste el pago en Transbank. Puedes intentarlo de nuevo.</div>
        <q-btn unelevated class="result-btn" label="Volver al evento" @click="router.back()" />
      </template>

      <!-- REJECTED / ERROR -->
      <template v-else>
        <div class="icon-wrap error">
          <q-icon name="error" size="64px" color="negative" />
        </div>
        <div class="result-title">Pago rechazado</div>
        <div class="result-sub">No se pudo procesar tu pago. Verifica tus datos e inténtalo de nuevo.</div>
        <q-btn unelevated class="result-btn" label="Volver al evento" @click="router.back()" />
      </template>

    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route  = useRoute()
const router = useRouter()

const status = computed(() => route.query.status ?? 'error')
</script>

<style scoped>
.result-page {
  background: #0b0f19;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
.result-card {
  text-align: center;
  padding: 40px 24px;
}
.icon-wrap { margin-bottom: 20px; }
.result-title {
  font-size: 1.4rem;
  font-weight: 900;
  color: #e2e8f0;
  margin-bottom: 8px;
}
.result-sub {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 28px;
}
.result-btn {
  background: #facc15;
  color: #020617;
  font-weight: 800;
  border-radius: 12px;
  padding: 0 28px;
  height: 46px;
}
</style>