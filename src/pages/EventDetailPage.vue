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

<!-- =========================
     MAPA ASIENTOS
========================= -->
<div class="section-title">Selecciona tus asientos</div>

    <!-- =========================
        MAPA ASIENTOS PRO
    ========================= -->
    <div class="seat-map">

      <!-- =========================
          DJ VIP (ARRIBA ESCENARIO)
      ========================= -->
      <div class="dj-vip-row">

        <div
          v-for="seat in vipCenterSeats"
          :key="seat.id"
          class="seat vip-center"
          :class="{ selected: seat.selected, sold: seat.sold }"
          @click="toggleSeat(seat, 'vipCenter')"
        >
          {{ seat.label }}
        </div>

      </div>


      <!-- ESCENARIO -->
      <div class="stage-dj">
        <div class="dj">🎧 DJ</div>
      </div>

      <!-- MAPA CENTRAL -->
      <div class="map-area">

        <!-- VIP IZQUIERDA -->
        <div class="vip-side">
          <div class="block-title">VIP Mesa</div>
          <div class="vip-table">
              <div
                v-for="seat in leftVipSeats"
                :key="seat.id"
                class="seat vip"
                :class="{ selected: seat.selected, sold: seat.sold }"
                @click="toggleSeat(seat, 'vipLeft')"
              >
                {{ seat.label }}
              </div>
          </div>
        </div>

        <!-- CENTRO DJ -->
         <div class="dj-area">
         
          <!-- <div
            v-for="(seat, index) in vipCenterSeats"
            :key="seat.id"
            class="seat vip-center dj-seat"
            :class="[
              `pos-${index+1}`,
              { selected: seat.selected }
            ]"
            @click="toggleSeat(seat)"
          >
            {{ seat.number }}
          </div> -->

        </div>


        <!-- VIP DERECHA -->
        <div class="vip-side">
          <div class="block-title">VIP Mesa</div>
          <div class="vip-table">
            <div
              v-for="seat in rightVipSeats"
              :key="seat.id"
              class="seat vip"
              :class="{ selected: seat.selected, sold: seat.sold }"
              @click="toggleSeat(seat, 'vipRight')"
            >
              {{ seat.label }}
            </div>
          </div>
        </div>

      </div>

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

          <div class="row items-center q-gutter-sm">

            <span class="qty">
              {{ cart[ticket.id] || 0 }}
            </span>

          </div>

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
        :disable="total === 0"
        @click="buyTickets"
      />

    </div>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from 'boot/axios' 

const route = useRoute()
const router = useRouter()

/* =========================
   SEAT DATA
========================= */

const createSeats = (prefix, total) => {
  return Array.from({ length: total }, (_, i) => ({
    id: `${prefix}-${i + 1}`,
    label: i + 1,
    selected: false,
    sold: false // luego viene de DB
  }))
}

// Total 21 asientos
const vipSeats = ref(createSeats('VIP', 21))

// 🎧 DJ → 5 asientos
const vipCenterSeats = ref(vipSeats.value.slice(0, 5))

// 🍾 VIP Mesa izquierda → 8
const leftVipSeats = ref(vipSeats.value.slice(5, 13))

// 🍾 VIP Mesa derecha → 8
const rightVipSeats = ref(vipSeats.value.slice(13, 21))


/* =========================
   TOGGLE SEAT
========================= */
const toggleSeat = (seat, zone) => {

  if (seat.sold) return

  if (!tickets.value.length) {
    console.warn('Tickets aún no cargados')
    return
  }

  seat.selected = !seat.selected

  let ticket = null

  // 🎧 DJ = VIP
  if (zone === 'vipCenter') {
    ticket = tickets.value.find(t =>
      t.name.toLowerCase().includes('vip')
    )
  }

  // 🍾 Mesas = VIP también
  if (zone === 'vipLeft' || zone === 'vipRight') {
    ticket = tickets.value.find(t =>
      t.name.toLowerCase().includes('vip')
    )
  }

  if (!ticket) {
    console.error('❌ Ticket no encontrado para zona:', zone)
    console.log('Tickets disponibles:', tickets.value)
    return
  }

  if (seat.selected) {
    addTicket(ticket)
  } else {
    removeTicket(ticket)
  }

  console.log('🛒 Cart:', cart.value)
}


/* =========================
   STATE
========================= */
const event = ref({})
const tickets = ref([])
const cart = ref({})
const loading = ref(true)

const total = computed(() => {
  return tickets.value.reduce((sum, t) => {
    const qty = cart.value[t.id] || 0
    return sum + qty * t.price
  }, 0)
})


/* =========================
   LOAD EVENT FROM API
========================= */
const loadEvent = async () => {
  try {
    const { id } = route.params

   const res = await api.get(`/auth/events/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )

    event.value = res.data
    tickets.value = res.data.ticket_types || []

  } catch (error) {
    console.error('Error cargando evento', error)
  } finally {
    loading.value = false
  }
}

const addTicket = (ticket) => {
  const qty = cart.value[ticket.id] || 0

  if (qty >= ticket.stock) {
    alert('Stock máximo alcanzado')
    return
  }

  cart.value[ticket.id] = qty + 1
}

const removeTicket = (ticket) => {
  if (!cart.value[ticket.id]) return

  cart.value[ticket.id]--

  if (cart.value[ticket.id] <= 0) {
    delete cart.value[ticket.id]
  }
}


const buyTickets = async () => {
  if (total.value === 0) {
    alert('Selecciona al menos una entrada')
    return
  }

  try {
    const res = await api.post('/auth/purchases',
      {
        event_id: Number(event.value.id),
        items: cart.value,
        total: total.value
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )

    if (res.data.success) {
      alert('Compra realizada con éxito 🎉')
      cart.value = {}
      router.push('/my-tickets')
    }

  } catch (error) {
    console.error(error)
    alert('Error al comprar')
  }
}


onMounted(() => {
  loadEvent()
})

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

/* =========================
   MAPA EVENTO
========================= */

.map-container {
  background: #020617;
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 24px;
  text-align: center;
}

/* ESCENARIO */
.stage {
  background: linear-gradient(
    90deg,
    #334155,
    #1e293b
  );

  border-radius: 12px;
  padding: 10px;
  font-weight: 800;
  font-size: 0.75rem;
  margin-bottom: 20px;

  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;

  color: #facc15;
}

/* GRID ZONAS */
.zones {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* ZONA BASE */
.zone {
  border-radius: 14px;
  padding: 26px 10px;
  font-weight: 900;
  font-size: 0.85rem;
  cursor: pointer;
  transition: 0.25s;
  user-select: none;
}

/* VIP */
.zone.vip {
  background: linear-gradient(
    180deg,
    #22c55e,
    #15803d
  );
}

/* GENERAL */
.zone.general {
  background: linear-gradient(
    180deg,
    #60a5fa,
    #2563eb
  );
}

/* HOVER */
.zone:hover {
  transform: scale(1.05);
}

/* ACTIVA */
.zone.active {
  outline: 3px solid #facc15;
  transform: scale(1.08);
  box-shadow:
    0 0 20px rgba(250,204,21,0.5);
}


/* =========================
   SEAT MAP PRO
========================= */

.seat-map {
  background: #020617;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
}

/* ESCENARIO */
.stage-dj {
  background: linear-gradient(90deg,#475569,#1e293b);
  border-radius: 14px;
  padding: 16px;
  text-align: center;
  margin-bottom: 40px;
}

/* =========================
   DJ VIP FILA
========================= */

.dj-vip-row {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}


.dj {
  background: #111827;
  color: #facc15;
  font-weight: 900;
  width: 140px;
  margin: auto;
  padding: 10px 0;
  border-radius: 8px;
}

/* AREA CENTRAL */
.map-area {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  align-items: center;
  gap: 20px;
}

/* LADOS VIP */
.vip-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.vip-table {
  display: grid;
  grid-template-columns: repeat(2, 44px);
  gap: 4px;
  justify-content: center;
}


/* TITULO */
.block-title {
  font-size: 0.75rem;
  font-weight: 900;
  color: #22c55e;
}

/* CENTRO VIP */
.vip-center-grid {
  display: grid;
  grid-template-columns: repeat(3, 60px);
  gap: 16px;
  justify-content: center;
}


/* ASIENTOS */
.seat {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 900;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  transition: 0.2s;
}

/* VIP LATERAL */
.seat.vip {
  background: #14532d;
}

/* VIP CENTRO */
.seat.vip-center {
  border: 2px solid #facc15;
  background: linear-gradient(180deg,#22c55e,#15803d);
  box-shadow: 0 0 10px rgba(34,197,94,0.6);
}

/* HOVER */
.seat:hover {
  transform: scale(1.1);
}

/* SELECTED */
.seat.selected {
  background: #facc15;
  color: #020617;
  box-shadow: 0 0 12px rgba(250,204,21,0.8);
}

/* SOLD */
.seat.sold {
  background: #475569;
  opacity: 0.5;
  cursor: not-allowed;
}

</style>
