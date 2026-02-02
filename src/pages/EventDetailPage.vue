<template>
  <q-page class="event-detail">

    <!-- HERO IMAGE -->
    <div class="hero">
      <img :src="event.image" />
    </div>

    <!-- INFO -->
    <div class="content">

      <div class="title">{{ event.name }}</div>

      <div class="meta">
        <q-icon name="event" size="16px" />
        <span>{{ event.date }}</span>
        <span class="dot">•</span>
        <span>{{ event.location }}</span>
      </div>

    <!-- ACCESO SOCIO -->
    <div class="section-title">Acceso socio</div>

    <div class="socio-grid">
        <q-card flat class="socio-card">
            <q-icon name="confirmation_number" size="28px" />
            <div class="socio-text">Mis Tickets</div>
        </q-card>

        <q-card flat class="socio-card">
            <q-icon name="celebration" size="28px" />
            <div class="socio-text">Modo Fiesta</div>
        </q-card>

        <q-card flat class="socio-card">
            <q-icon name="table_bar" size="28px" />
            <div class="socio-text">Compra Mesa VIP</div>
        </q-card>

        <q-card flat class="socio-card">
            <q-icon name="headphones" size="28px" />
            <div class="socio-text">Compra DJ VIP</div>
        </q-card>
    </div>


    <!-- TICKETS -->
      <div class="section-title">Entradas</div>

      <q-card
        v-for="ticket in tickets"
        :key="ticket.id"
        flat
        class="ticket-card"
      >
        <div class="row items-center justify-between">

          <div>
            <div class="ticket-name">{{ ticket.name }}</div>
            <div class="ticket-price">S/ {{ ticket.price }}</div>
          </div>

          <q-btn
            round
            dense
            icon="add"
            class="add-btn"
            @click="addTicket(ticket)"
          />
        </div>
      </q-card>

    </div>

    <!-- FIXED BUY BAR -->
    <div class="buy-bar">
      <div class="total">
        Total: <strong>S/ {{ total }}</strong>
      </div>

      <q-btn
        unelevated
        class="buy-btn"
        label="Comprar ahora"
      />
    </div>

  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const event = ref({
  id: route.params.id,
  name: 'Concierto Pop 2026',
  date: '24 Ene 2026',
  location: 'Estadio Nacional',
  image: 'https://source.unsplash.com/900x600/?concert'
})

const tickets = ref([
  { id: 1, name: 'General', price: 80 },
  { id: 2, name: 'VIP', price: 150 }
])

const cart = ref([])

const addTicket = (ticket) => {
  cart.value.push(ticket)
}

const total = computed(() =>
  cart.value.reduce((sum, t) => sum + t.price, 0)
)
</script>

<style scoped>
.event-detail {
  background: #0b0f19;
  color: white;
  padding-bottom: 90px;
}

/* HERO */
.hero img {
  width: 100%;
  height: 240px;
  object-fit: cover;
}

/* CONTENT */
.content {
  padding: 16px;
}

.title {
  font-size: 1.3rem;
  font-weight: 900;
  margin-bottom: 6px;
}

.meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #94a3b8;
  margin-bottom: 20px;
}

.dot {
  margin: 0 4px;
}

/* SECTION */
.section-title {
  font-weight: 800;
  margin-bottom: 10px;
}

/* TICKET */
.ticket-card {
  background: #020617;
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 12px;
}

.ticket-name {
  font-weight: 700;
}

.ticket-price {
  font-size: 0.8rem;
  color: #94a3b8;
}

.add-btn {
  background: #2563eb;
  color: white;
}

/* BUY BAR */
.buy-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #020617;
  padding: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255,255,255,0.08);
}

.total {
  font-size: 0.95rem;
}

.buy-btn {
  background: #facc15;
  color: #020617;
  font-weight: 800;
  border-radius: 12px;
}

/* ACCESO SOCIO */
.socio-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}

.socio-card {
  background: #020617;
  border-radius: 16px;
  aspect-ratio: 1 / 1;   /* 🔥 ESTO LOS HACE CUADRADOS */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.socio-card q-icon {
  color: #facc15;
  margin-bottom: 10px;
}

.socio-text {
  font-size: 0.8rem;
  font-weight: 800;
  text-align: center;
  line-height: 1.2;
}

</style>
