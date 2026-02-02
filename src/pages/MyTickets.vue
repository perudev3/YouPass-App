<template>
  <q-page class="my-tickets">

    <div class="header">
      <div class="title">Mis Tickets</div>
      <div class="subtitle">Presenta el QR en el ingreso</div>
    </div>

    <div v-if="loading" class="loading">
      <q-spinner color="yellow" size="40px" />
    </div>

    <div v-else-if="tickets.length === 0" class="empty">
      <q-icon name="confirmation_number" size="48px" />
      <p>No tienes tickets aún</p>
    </div>

    <q-card
      v-for="ticket in tickets"
      :key="ticket.id"
      flat
      class="ticket-card"
    >
      <!-- EVENT IMAGE -->
      <div class="event-img">
        <img :src="ticket.event.image" />
      </div>

      <!-- INFO -->
      <div class="info">
        <div class="event-name">{{ ticket.event.name }}</div>

        <div class="meta">
          <q-icon name="event" size="14px" />
          <span>{{ ticket.event.date }}</span>
          <span class="dot">•</span>
          <span>{{ ticket.event.location }}</span>
        </div>

        <div class="ticket-type">
          {{ ticket.ticket_type }}
        </div>

        <div
          class="status"
          :class="ticket.status"
        >
          {{ statusLabel(ticket.status) }}
        </div>
      </div>

      <!-- QR -->
      <div class="qr">
        <img
          v-if="ticket.qr"
          :src="ticket.qr"
        />
      </div>
    </q-card>

  </q-page>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const tickets = ref([])
const loading = ref(true)

const loadTickets = async () => {
  const token = localStorage.getItem('token')

  if (!token) {
    router.push('/login-phone')
    return
  }

  try {
    const res = await axios.get(
      'http://127.0.0.1:8000/api/auth/my-tickets',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    tickets.value = res.data
  } catch (error) {
    console.error(error)
    alert('Error cargando tickets')
  } finally {
    loading.value = false
  }
}

const statusLabel = (status) => {
  if (status === 'valid') return 'Válido'
  if (status === 'used') return 'Usado'
  if (status === 'cancelled') return 'Cancelado'
}

onMounted(loadTickets)
</script>

<style scoped>
.my-tickets {
  background: #0b0f19;
  color: white;
  padding: 16px;
}

/* HEADER */
.header {
  margin-bottom: 20px;
}

.title {
  font-size: 1.4rem;
  font-weight: 900;
}

.subtitle {
  font-size: 0.8rem;
  color: #94a3b8;
}

/* STATES */
.loading,
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: #94a3b8;
}

/* CARD */
.ticket-card {
  background: #020617;
  border-radius: 16px;
  margin-bottom: 16px;
  overflow: hidden;
}

/* EVENT IMAGE */
.event-img img {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

/* INFO */
.info {
  padding: 14px;
}

.event-name {
  font-weight: 900;
  margin-bottom: 6px;
}

.meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 8px;
}

.dot {
  margin: 0 4px;
}

.ticket-type {
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 6px;
}

/* STATUS */
.status {
  font-size: 0.7rem;
  font-weight: 900;
  width: fit-content;
  padding: 4px 10px;
  border-radius: 999px;
}

.status.valid {
  background: #16a34a;
  color: white;
}

.status.used {
  background: #475569;
  color: white;
}

.status.cancelled {
  background: #dc2626;
  color: white;
}

/* QR */
.qr {
  padding: 12px;
  display: flex;
  justify-content: center;
  background: #020617;
}

.qr img {
  width: 140px;
}

</style>