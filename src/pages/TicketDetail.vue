<template>
  <q-page class="ticket-detail">

    <div class="top">
      <q-btn
        flat
        round
        icon="arrow_back"
        color="white"
        @click="$router.back()"
      />
    </div>

    <div class="content">

      <div class="event-name">{{ ticket.event.name }}</div>
      <div class="ticket-type">{{ ticket.ticket_type }}</div>

      <div class="status" :class="ticket.status">
        {{ statusLabel(ticket.status) }}
      </div>

      <!-- QR -->
      <div class="qr-wrapper">
        <img :src="ticket.qr" />
      </div>

      <div class="hint">
        Presenta este código en el ingreso
      </div>

    </div>

  </q-page>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const ticket = ref(null)

const statusLabel = (status) => {
  if (status === 'valid') return 'Válido'
  if (status === 'used') return 'Usado'
  if (status === 'cancelled') return 'Cancelado'
}

onMounted(() => {
  // ticket enviado desde MyTickets
  if (!route.params.ticket) {
    router.push('/my-tickets')
    return
  }

  ticket.value = JSON.parse(route.params.ticket)

  // 🔆 brillo máximo (mobile)
  if (navigator.wakeLock) {
    navigator.wakeLock.request('screen')
  }
})
</script>
<style scoped>
.ticket-detail {
  background: #020617;
  color: white;
  min-height: 100vh;
}

.top {
  padding: 10px;
}

.content {
  padding: 20px;
  text-align: center;
}

.event-name {
  font-size: 1.2rem;
  font-weight: 900;
}

.ticket-type {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-bottom: 10px;
}

.status {
  display: inline-block;
  margin-bottom: 20px;
  padding: 6px 14px;
  font-size: 0.75rem;
  font-weight: 900;
  border-radius: 999px;
}

.status.valid {
  background: #16a34a;
}

.status.used {
  background: #475569;
}

.status.cancelled {
  background: #dc2626;
}

.qr-wrapper {
  margin: 30px 0;
}

.qr-wrapper img {
  width: 280px;
  max-width: 90%;
}

.hint {
  font-size: 0.75rem;
  color: #94a3b8;
}

</style>