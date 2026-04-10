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

      <!-- =========================
           MAPA ASIENTOS
      ========================= -->
      <div class="section-title">Venta de entradas Vip</div>

      <!-- =========================
          MAPA ASIENTOS PRO
      ========================= -->
      <div class="seat-map">

        <!-- DJ VIP (ARRIBA ESCENARIO) -->
        <div class="dj-vip-row">
          <div
            v-for="seat in vipCenterSeats"
            :key="seat.id"
            class="seat vip-center"
            :class="{ selected: seat.selected, sold: seat.sold }"
            @click="toggleSeat(seat, 'vipCenter')"
          >
            <span v-if="seat.sold" class="sold-x">✕</span>
            <span v-else>{{ seat.label }}</span>
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
            <div class="block-title">Mesa VIP</div>
            <div class="vip-table">
              <div
                v-for="seat in leftVipSeats"
                :key="seat.id"
                class="seat vip"
                :class="{ selected: seat.selected, sold: seat.sold }"
                @click="toggleSeat(seat, 'vipLeft')"
              >
                <span v-if="seat.sold" class="sold-x">✕</span>
                <span v-else>{{ seat.label }}</span>
              </div>
            </div>
          </div>

          <!-- CENTRO DJ -->
          <div class="dj-area"></div>

          <!-- VIP DERECHA -->
          <div class="vip-side">
            <div class="block-title">Mesa VIP</div>
            <div class="vip-table">
              <div
                v-for="seat in rightVipSeats"
                :key="seat.id"
                class="seat vip"
                :class="{ selected: seat.selected, sold: seat.sold }"
                @click="toggleSeat(seat, 'vipRight')"
              >
                <span v-if="seat.sold" class="sold-x">✕</span>
                <span v-else>{{ seat.label }}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      <!-- =========================
           PRECIO VIP
      ========================= -->
      <div v-if="vipTicket" class="vip-price-card">
        <div class="vip-price-left">
          <div class="vip-price-icon">
            <q-icon name="star" size="18px" />
          </div>
          <div>
            <div class="vip-price-label">Entrada VIP</div>
            <div class="vip-price-sub">{{ selectedVipCount }} mesa(s) {{ selectedVipCount !== 1 ? 's' : '' }} seleccionado{{ selectedVipCount !== 1 ? 's' : '' }}</div>
          </div>
        </div>
        <div class="vip-price-right">
          <div class="vip-price-amount">S/ {{ vipTicket.price }}</div>
          <div class="vip-price-unit">por asiento</div>
        </div>
      </div>

      <!-- leyenda de asientos -->
      <div class="seat-legend">
        <div class="legend-item">
          <div class="legend-dot available-vip"></div>
          <span>Disponible</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot selected-dot"></div>
          <span>Seleccionado</span>
        </div>
        <div class="legend-item">
          <div class="legend-dot sold-dot"></div>
          <span>Vendido</span>
        </div>
      </div>


      <!-- =========================
           TICKETS NORMALES
      ========================= -->
      <div class="section-title" style="margin-top: 24px;">Venta de entradas normales</div>

      <q-card
        v-for="ticket in normalTickets"
        :key="ticket.id"
        flat
        class="ticket-card"
      >
        <div class="row items-center justify-between">

          <div class="ticket-info">
            <div class="ticket-name">{{ ticket.name }}</div>
            <div class="ticket-price-tag">
              <span class="ticket-currency">S/</span>
              <span class="ticket-amount">{{ ticket.price }}</span>
              <span class="ticket-unit">por entrada</span>
            </div>
          </div>

          <div class="qty-control">
            <button
              class="qty-btn minus"
              :disabled="!cart[ticket.id]"
              @click="removeTicket(ticket)"
            >
              <q-icon name="remove" size="16px" />
            </button>

            <div class="qty-display">
              <span class="qty-number">{{ cart[ticket.id] || 0 }}</span>
            </div>

            <button
              class="qty-btn plus"
              :disabled="(cart[ticket.id] || 0) >= 10 || (cart[ticket.id] || 0) >= ticket.stock"
              @click="addTicket(ticket)"
            >
              <q-icon name="add" size="16px" />
            </button>
          </div>

        </div>

        <!-- subtotal por ticket si hay cantidad -->
        <div v-if="cart[ticket.id]" class="ticket-subtotal">
          <span>{{ cart[ticket.id] }} × S/ {{ ticket.price }}</span>
          <span class="subtotal-amount">S/ {{ (cart[ticket.id] * ticket.price).toFixed(2) }}</span>
        </div>

      </q-card>

    </div>

    <!-- FIXED BUY BAR -->
    <div class="buy-bar">
      <div class="total-block">
        <span class="total-label">Total</span>
        <strong class="total-amount">S/ {{ total.toFixed(2) }}</strong>
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
import Swal from 'sweetalert2'
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
    sold: false
  }))
}

const vipSeats = ref(createSeats('VIP', 21))

// 🎧 DJ → 5 asientos
const vipCenterSeats = ref(vipSeats.value.slice(0, 5))

// 🍾 VIP Mesa izquierda → 8
const leftVipSeats = ref(vipSeats.value.slice(5, 13))

// 🍾 VIP Mesa derecha → 8
const rightVipSeats = ref(vipSeats.value.slice(13, 21))

/* =========================
   COMPUTED HELPERS
========================= */

// Ticket VIP (para mostrar precio)
const vipTicket = computed(() =>
  tickets.value.find(t => t.name.toLowerCase().includes('vip'))
)

// Tickets normales (no VIP)
const normalTickets = computed(() =>
  tickets.value.filter(t => !t.name.toLowerCase().includes('vip'))
)

// Cuántos asientos VIP seleccionados
const selectedVipCount = computed(() =>
  vipSeats.value.filter(s => s.selected).length
)

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

  if (zone === 'vipCenter' || zone === 'vipLeft' || zone === 'vipRight') {
    ticket = tickets.value.find(t => t.name.toLowerCase().includes('vip'))
  }

  if (!ticket) {
    console.error('❌ Ticket no encontrado para zona:', zone)
    return
  }

  if (seat.selected) {
    addTicket(ticket)
  } else {
    removeTicket(ticket)
  }
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
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })

    event.value = res.data
    tickets.value = res.data.ticket_types || []

    const soldSeats = res.data.sold_seats || []
    vipSeats.value.forEach(seat => {
      seat.sold = soldSeats.includes(seat.id)
    })

  } catch (error) {
    console.error('Error cargando evento', error)
  } finally {
    loading.value = false
  }
}

const addTicket = (ticket) => {
  const qty = cart.value[ticket.id] || 0
  const maxQty = Math.min(10, ticket.stock)

  if (qty >= maxQty) {
    if (qty >= ticket.stock) {
      Swal.fire({
        toast: true,
        position: 'top',
        icon: 'warning',
        title: 'Stock agotado para este tipo de entrada',
        showConfirmButton: false,
        timer: 2000,
        background: '#0F172A',
        color: '#E5E7EB',
      })
    } else {
      Swal.fire({
        toast: true,
        position: 'top',
        icon: 'info',
        title: 'Máximo 10 entradas por compra',
        showConfirmButton: false,
        timer: 2000,
        background: '#0F172A',
        color: '#E5E7EB',
      })
    }
    return
  }

  cart.value = { ...cart.value, [ticket.id]: qty + 1 }
}

const removeTicket = (ticket) => {
  if (!cart.value[ticket.id]) return

  const newQty = cart.value[ticket.id] - 1
  const newCart = { ...cart.value }

  if (newQty <= 0) {
    delete newCart[ticket.id]
  } else {
    newCart[ticket.id] = newQty
  }

  cart.value = newCart
}

const buyTickets = async () => {
  if (total.value === 0) {
    await Swal.fire({
      title: 'Sin entradas',
      text: 'Selecciona al menos una entrada para continuar.',
      icon: 'warning',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#FFC220',
      background: '#0F172A',
      color: '#E5E7EB',
      iconColor: '#FFC220',
    })
    return
  }

  const selectedSeats = vipSeats.value
    .filter(s => s.selected)
    .map(s => s.id)

  try {
    const res = await api.post(
      '/auth/create-transaction',
      {
        event_id: Number(event.value.id),
        items: cart.value,
        total: total.value,
        seats: selectedSeats
      },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    )

    window.location.href = `${res.data.url}?token=${res.data.token}`

    if (res.data.success) {
      await Swal.fire({
        title: '¡Compra exitosa! 🎉',
        html: `
          <p style="color:#9CA3AF; margin-bottom:8px">Tu entrada está lista</p>
          <p style="color:#FFC220; font-size:1.4rem; font-weight:900">S/ ${total.value.toFixed(2)}</p>
        `,
        icon: 'success',
        confirmButtonText: 'Ver mis tickets',
        confirmButtonColor: '#FFC220',
        background: '#0F172A',
        color: '#E5E7EB',
        iconColor: '#4ADE80',
      })

      cart.value = {}
      router.push('/my-tickets')
    }
  } catch (error) {
    const msg = error.response?.data?.message || 'Ocurrió un error al procesar tu compra.'

    await Swal.fire({
      title: 'Error en la compra',
      text: msg,
      icon: 'error',
      confirmButtonText: 'Intentar de nuevo',
      confirmButtonColor: '#FFC220',
      background: '#0F172A',
      color: '#E5E7EB',
      iconColor: '#EF4444',
    })
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
  padding-bottom: 100px;
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
  font-size: 0.95rem;
  letter-spacing: 0.03em;
  margin-bottom: 14px;
  color: #e2e8f0;
}

/* =========================
   SEAT MAP PRO
========================= */

.seat-map {
  background: #020617;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 16px;
}

.stage-dj {
  background: linear-gradient(90deg, #475569, #1e293b);
  border-radius: 14px;
  padding: 16px;
  text-align: center;
  margin-bottom: 40px;
}

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

.map-area {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  align-items: center;
  gap: 20px;
}

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

.block-title {
  font-size: 0.75rem;
  font-weight: 900;
  color: #22c55e;
}

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

.seat.vip {
  background: #14532d;
}

.seat.vip-center {
  border: 2px solid #facc15;
  background: linear-gradient(180deg, #22c55e, #15803d);
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.6);
}

.seat:hover {
  transform: scale(1.1);
}

.seat.selected {
  background: #facc15;
  color: #020617;
  box-shadow: 0 0 12px rgba(250, 204, 21, 0.8);
}

.seat.sold {
  background: #475569;
  opacity: 0.5;
  cursor: not-allowed;
}

.sold-x {
  color: #ef4444;
  font-size: 0.9rem;
  font-weight: 900;
}

/* =========================
   VIP PRICE CARD
========================= */

.vip-price-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #0d2d1a 0%, #052010 100%);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 16px;
  padding: 14px 18px;
  margin-bottom: 12px;
}

.vip-price-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.vip-price-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #22c55e;
  flex-shrink: 0;
}

.vip-price-label {
  font-weight: 800;
  font-size: 0.9rem;
  color: #e2e8f0;
}

.vip-price-sub {
  font-size: 0.72rem;
  color: #22c55e;
  margin-top: 2px;
  font-weight: 600;
}

.vip-price-right {
  text-align: right;
}

.vip-price-amount {
  font-size: 1.35rem;
  font-weight: 900;
  color: #facc15;
  line-height: 1;
}

.vip-price-unit {
  font-size: 0.68rem;
  color: #64748b;
  margin-top: 2px;
}

/* =========================
   SEAT LEGEND
========================= */

.seat-legend {
  display: flex;
  gap: 18px;
  justify-content: center;
  margin-bottom: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  color: #94a3b8;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 4px;
}

.available-vip {
  background: linear-gradient(180deg, #22c55e, #15803d);
}

.selected-dot {
  background: #facc15;
}

.sold-dot {
  background: #475569;
  opacity: 0.6;
}

/* =========================
   TICKET CARD (NORMAL)
========================= */

.ticket-card {
  background: #020617;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 14px 16px;
  margin-bottom: 12px;
  transition: border-color 0.2s;
}

.ticket-card:has(.qty-number:not(:empty)[style]) {
  border-color: rgba(250, 204, 21, 0.2);
}

.ticket-info {
  flex: 1;
}

.ticket-name {
  font-weight: 700;
  font-size: 0.9rem;
  color: #e2e8f0;
  margin-bottom: 4px;
}

.ticket-price-tag {
  display: flex;
  align-items: baseline;
  gap: 3px;
}

.ticket-currency {
  font-size: 0.75rem;
  color: #facc15;
  font-weight: 700;
}

.ticket-amount {
  font-size: 1.15rem;
  font-weight: 900;
  color: #facc15;
  line-height: 1;
}

.ticket-unit {
  font-size: 0.68rem;
  color: #475569;
  font-weight: 500;
}

/* QUANTITY CONTROL */
.qty-control {
  display: flex;
  align-items: center;
  gap: 0;
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.qty-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}

.qty-btn:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.06);
  color: #e2e8f0;
}

.qty-btn.plus:not(:disabled) {
  color: #facc15;
}

.qty-btn.plus:not(:disabled):hover {
  background: rgba(250, 204, 21, 0.1);
}

.qty-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.qty-display {
  width: 36px;
  text-align: center;
  border-left: 1px solid rgba(255,255,255,0.06);
  border-right: 1px solid rgba(255,255,255,0.06);
}

.qty-number {
  font-size: 0.9rem;
  font-weight: 900;
  color: #e2e8f0;
}

/* SUBTOTAL ROW */
.ticket-subtotal {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 0.78rem;
  color: #64748b;
}

.subtotal-amount {
  color: #facc15;
  font-weight: 800;
  font-size: 0.88rem;
}

/* =========================
   BUY BAR
========================= */

.buy-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(2, 6, 23, 0.95);
  backdrop-filter: blur(12px);
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.total-block {
  display: flex;
  flex-direction: column;
}

.total-label {
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.total-amount {
  font-size: 1.3rem;
  font-weight: 900;
  color: #facc15;
  line-height: 1;
}

.buy-btn {
  background: #facc15;
  color: #020617;
  font-weight: 800;
  border-radius: 12px;
  padding: 0 24px;
  height: 44px;
  font-size: 0.9rem;
}

.buy-btn:disabled {
  opacity: 0.35;
}
</style>