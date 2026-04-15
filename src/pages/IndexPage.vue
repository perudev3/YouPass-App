<template>
  <q-page class="home">

    <!-- ══════════════════════════════════════════════
         MODO NORMAL — carousel + search fijos
    ══════════════════════════════════════════════ -->
    <div v-if="!modoFiesta" class="fixed-top-zone">
      <q-carousel v-model="slide" animated swipeable infinite autoplay height="210px" class="banner-carousel">
        <q-carousel-slide v-for="event in featuredEvents" :key="event.id">
          <img :src="event.image" class="banner-img" />
        </q-carousel-slide>
      </q-carousel>

      <div class="search-wrapper">
        <div class="search-box">
          <q-input v-model="search" dense borderless placeholder="Buscar en YouPass" class="search-input" />
          <q-btn unelevated label="Buscar" class="search-btn" />
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════
         MODO FIESTA — banner especial
    ══════════════════════════════════════════════ -->
    <div v-if="modoFiesta" class="fiesta-top-zone">
      <div class="fiesta-banner">
        <div class="fiesta-banner-bg" />
        <div class="fiesta-banner-content">
          <div class="fiesta-banner-title">🎉 Modo Fiesta</div>
          <div class="fiesta-banner-sub">Tus eventos activos</div>
        </div>
      </div>

      <div class="search-wrapper">
        <div class="search-box search-box--dark">
          <q-input v-model="search" dense borderless placeholder="Buscar evento..."
            class="search-input search-input--dark" />
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════
         LISTA DE EVENTOS
    ══════════════════════════════════════════════ -->
    <div class="events-scroll" :class="{ 'events-scroll--fiesta': modoFiesta }">

      <!-- Estado vacío -->
      <div v-if="!loading && filteredEvents.length === 0" class="empty-state">
        <q-icon name="event_busy" size="48px" />
        <p>{{ modoFiesta ? 'No tienes eventos activos' : 'No hay eventos disponibles' }}</p>
      </div>

      <div v-for="event in filteredEvents" :key="event.id" class="event-card q-mb-md"
        :class="{ 'event-card--fiesta': modoFiesta }"
        @click="modoFiesta ? selectFiestaEvent(event) : buyTicket(event.id)">
        <!-- IMAGEN DOMINANTE -->
        <div class="event-img-wrap">
          <img :src="event.image" class="event-img" />
          <!-- Overlay gradiente -->
          <div class="event-overlay" />

          <!-- Badge fiesta -->
          <div v-if="modoFiesta" class="fiesta-event-badge">
            <q-icon name="celebration" size="11px" /> Tu entrada
          </div>

          <!-- Info sobre la imagen -->
          <div class="event-info">
            <div class="event-meta-row">
              <span class="event-date-chip">
                <q-icon name="event" size="11px" />
                {{ event.date }}
              </span>
              <span class="event-location-chip">
                <q-icon name="place" size="11px" />
                {{ event.location }}
              </span>
            </div>
            <div class="event-title">{{ event.name }}</div>
            <q-btn v-if="user?.role === 'scanner_puerta' || user?.role === 'scanner_barra'" dense unelevated
              class="scan-btn" icon="qr_code_scanner" label="Escanear" @click.stop="openScanner(event)" />
            <q-btn dense unelevated class="buy-btn" :class="{ 'buy-btn--fiesta': modoFiesta }"
              :label="modoFiesta ? '🍾 Abrir Barra' : 'Comprar entradas'"
              :icon="modoFiesta ? '' : 'confirmation_number'"
              @click.stop="modoFiesta ? selectFiestaEvent(event) : buyTicket(event.id)" />
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════
         DIALOG BARRA — diseño premium
    ══════════════════════════════════════════════ -->
    <q-dialog v-model="barModal" maximized transition-show="slide-up" transition-hide="slide-down">
      <div class="bar-modal">

        <!-- HEADER MODAL -->
        <div class="bar-modal-header">
          <div class="bar-modal-back">
            <q-btn flat round icon="arrow_back" color="white" size="sm" @click="barModal = false" />
          </div>
          <div class="bar-modal-title-col">
            <div class="bar-modal-event">{{ selectedEvent?.name }}</div>
            <div class="bar-modal-title">🍾 {{ categorySelected }}</div>
          </div>
          <div class="bar-modal-cart" v-if="cartCount > 0">
            <q-btn flat round icon="shopping_cart" color="amber" @click="showCart = true">
              <q-badge color="red" floating>{{ cartCount }}</q-badge>
            </q-btn>
          </div>
        </div>

        <!-- CATEGORÍAS TABS -->
        <div class="bar-cats">
          <button v-for="cat in barCategories" :key="cat.key" class="bar-cat-btn"
            :class="{ 'bar-cat-btn--active': categorySelected === cat.label }"
            @click="loadBarItems(cat.key, cat.label)">
            <span class="bar-cat-icon">{{ cat.icon }}</span>
            <span>{{ cat.label }}</span>
          </button>
        </div>

        <!-- PRODUCTOS GRID -->
        <div class="bar-products-scroll">
          <div v-if="loadingBar" class="bar-loading">
            <q-spinner color="amber" size="36px" />
          </div>

          <div v-else-if="barItems.length === 0" class="bar-empty">
            <q-icon name="liquor" size="40px" style="color:#374151" />
            <p>No hay productos en esta categoría</p>
          </div>

          <div v-else class="bar-grid">
            <div v-for="item in barItems" :key="item.id" class="bar-product-card"
              :class="{ 'bar-product-card--active': getCartQty(item.id) > 0 }">
              <!-- Imagen -->
              <div class="bar-product-img-wrap" @click="addToCart(item)">
                <img :src="item.image" class="bar-product-img" />
                <div class="bar-product-img-overlay" />
              </div>

              <!-- Info -->
              <div class="bar-product-info">
                <div class="bar-product-name">{{ item.name }}</div>
                <div class="bar-product-price">S/ {{ item.price }}</div>
              </div>

              <!-- Controles qty -->
              <div class="bar-product-controls">
                <template v-if="getCartQty(item.id) > 0">
                  <button class="bar-qty-btn bar-qty-btn--minus" @click="removeFromCart(item)">
                    <q-icon :name="getCartQty(item.id) === 1 ? 'delete_outline' : 'remove'" size="16px" />
                  </button>
                  <span class="bar-qty-num">{{ getCartQty(item.id) }}</span>
                  <button class="bar-qty-btn bar-qty-btn--plus" @click="addToCart(item)">
                    <q-icon name="add" size="16px" />
                  </button>
                </template>
                <template v-else>
                  <button class="bar-add-btn-full" @click="addToCart(item)">
                    <q-icon name="add" size="16px" />
                    Agregar
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- FOOTER — total + pagar -->
        <div v-if="cartCount > 0" class="bar-footer">
          <div class="bar-footer-total">
            <span class="bar-footer-label">Total</span>
            <span class="bar-footer-amount">S/ {{ cartTotal.toFixed(2) }}</span>
          </div>
          <q-btn unelevated class="bar-pay-btn" @click="checkout">
            <q-icon name="shopping_cart_checkout" class="q-mr-sm" />
            Pagar ({{ cartCount }})
          </q-btn>
        </div>

      </div>
    </q-dialog>

    <q-dialog v-model="scannerOpen" position="bottom">
      <q-card class="scanner-card">

        <!-- HEADER -->
        <q-card-section class="scanner-header">
          <div>
            <div class="text-weight-bold text-white">Escáner QR</div>
            <div class="text-caption text-grey-5">
              {{ scannerEvent?.name }}
            </div>
          </div>

          <q-btn icon="close" flat round color="white" @click="closeScanner" />
        </q-card-section>

        <!-- CAMERA -->
        <div class="scanner-body">
          <div id="reader" class="scanner-view"></div>
        </div>

        <!-- CONTROLES -->
        <q-card-section class="scanner-controls">
          <q-btn :icon="scannerActive ? 'videocam_off' : 'videocam'" :label="scannerActive ? 'Detener' : 'Iniciar'"
            color="amber" unelevated class="full-width" @click="toggleScanner" />
        </q-card-section>

      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { api, Storage } from 'boot/axios'
import Swal from 'sweetalert2'
import { Html5Qrcode } from 'html5-qrcode'

const router = useRouter()
const slide = ref(0)
const modoFiesta = ref(false)
const featuredEvents = ref([])
const loading = ref(false)
const loadingBar = ref(false)
const barItems = ref([])
const search = ref('')
const barModal = ref(false)
const showCart = ref(false)
const selectedEvent = ref(null)
const categorySelected = ref('Bebidas')
const cart = ref([])
const user = ref(null)

const scannerOpen = ref(false)
const scannerEvent = ref(null)
const scannerActive = ref(false)
let qrScanner = null


const openScanner = (event) => {
  scannerEvent.value = event
  scannerOpen.value = true

  setTimeout(() => {
    startScanner()
  }, 400)
}

const startScanner = async () => {
  try {
    if (qrScanner) return

    qrScanner = new Html5Qrcode("reader")

    await qrScanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 220 },
      async (decodedText) => {
        await stopScanner()
        handleQr(decodedText)
      }
    )

    scannerActive.value = true

  } catch (err) {
    console.error(err)
  }
}

const stopScanner = async () => {
  try {
    if (qrScanner && scannerActive.value) {
      await qrScanner.stop()
      await qrScanner.clear()
      qrScanner = null
    }
  } catch (e) {
    console.warn(e)
  }

  scannerActive.value = false
}

const toggleScanner = async () => {
  if (scannerActive.value) {
    await stopScanner()
  } else {
    await startScanner()
  }
}

const closeScanner = async () => {
  await stopScanner()
  scannerOpen.value = false
}

let processingQr = false

const handleQr = async (code) => {
  if (processingQr) return
  processingQr = true

  try {
    await api.post('/auth/tickets/validate', {
      code,
      event_id: scannerEvent.value?.id
    })

    Swal.fire({
      icon: 'success',
      title: 'Acceso permitido 🎉'
    })

  } finally {
    processingQr = false
  }
}

// Categorías de la barra
const barCategories = [
  { key: 'bebidas', label: 'Bebidas', icon: '🍺' },
  { key: 'cocteleria', label: 'Coctelería', icon: '🍹' },
  { key: 'destilados', label: 'Destilados', icon: '🥃' },
]

// ── COMPUTED ───────────────────────────────────────────────
const filteredEvents = computed(() => {
  if (!search.value) return featuredEvents.value
  return featuredEvents.value.filter(e =>
    e.name.toLowerCase().includes(search.value.toLowerCase()) ||
    e.location.toLowerCase().includes(search.value.toLowerCase())
  )
})

const cartCount = computed(() => cart.value.reduce((s, i) => s + i.qty, 0))
const cartTotal = computed(() => cart.value.reduce((s, i) => s + i.price * i.qty, 0))

const getCartQty = (id) => {
  const item = cart.value.find(i => i.id === id)
  return item ? item.qty : 0
}

// ── EVENTOS ────────────────────────────────────────────────
const loadEvents = async () => {
  loading.value = true

  try {
    const me = await api.get('/auth/me')

    user.value = me.data.user

    // 🔥 scanners
    if (
      user.value?.role === 'scanner_puerta' ||
      user.value?.role === 'scanner_barra'
    ) {
      featuredEvents.value = me.data.events
      return
    }

    // 🔥 modo fiesta
    if (modoFiesta.value) {
      const res = await api.get('/auth/my-tickets')
      const events = res.data.map(t => t.event)
      featuredEvents.value = [...new Map(events.map(e => [e.id, e])).values()]
      return
    }

    // 🔥 normal
    const res = await api.get('/auth/events')
    featuredEvents.value = res.data

  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const buyTicket = (id) => router.push(`/event/${id}`)

// ── BARRA ──────────────────────────────────────────────────
const selectFiestaEvent = (event) => {
  selectedEvent.value = event
  cart.value = []
  categorySelected.value = 'Bebidas'
  barModal.value = true
  loadBarItems('bebidas', 'Bebidas')
}

const loadBarItems = async (catKey, catLabel) => {
  if (!selectedEvent.value) return
  loadingBar.value = true
  categorySelected.value = catLabel
  try {
    const res = await api.get(`/auth/event-bar/${selectedEvent.value.id}/${catKey}`)
    barItems.value = res.data
  } catch (error) {
    console.error('Error cargando barra', error)
    barItems.value = []
  } finally {
    loadingBar.value = false
  }
}

const addToCart = (item) => {
  const existing = cart.value.find(i => i.id === item.id)
  if (existing) {
    existing.qty++
  } else {
    cart.value.push({ ...item, qty: 1 })
  }
}

const removeFromCart = (item) => {
  const idx = cart.value.findIndex(i => i.id === item.id)
  if (idx === -1) return
  if (cart.value[idx].qty > 1) {
    cart.value[idx].qty--
  } else {
    cart.value.splice(idx, 1)
  }
}

const checkout = async () => {
  if (cart.value.length === 0) return
  try {
    // Comprar cada item del carrito
    const promises = cart.value.map(item =>
      api.post('/auth/bar/buy', {
        event_id: selectedEvent.value.id,
        bar_item_id: item.id,
        qty: item.qty
      })
    )
    const results = await Promise.all(promises)
    const lastOrder = results[results.length - 1].data.order

    cart.value = []
    barModal.value = false

    await Swal.fire({
      title: '🍾 Pedido realizado',
      html: `<p style="color:#E5E7EB">Muestra este QR en la barra</p><img src="${lastOrder.qr}" style="width:180px;border-radius:12px;margin-top:8px"/>`,
      confirmButtonText: '¡Listo!',
      confirmButtonColor: '#FFC220',
      background: '#0F172A',
      color: '#E5E7EB',
    })
  } catch (error) {
    console.log(error)
    Swal.fire({
      title: 'Error',
      text: 'No se pudo realizar la compra',
      icon: 'error',
      background: '#0F172A',
      color: '#E5E7EB',
    })
  }
}

// ── SYNC MODO FIESTA ───────────────────────────────────────
const handleModoFiesta = async (event) => {
  modoFiesta.value = event.detail
  await loadEvents()
}

onMounted(async () => {
  const savedModo = await Storage.get('modoFiesta')
  modoFiesta.value = savedModo === 'true'
  await loadEvents()
  window.addEventListener('modo-fiesta-changed', handleModoFiesta)
})

onUnmounted(() => {
  window.removeEventListener('modo-fiesta-changed', handleModoFiesta)
})
</script>

<style scoped>
/* ══════════════════════════════════════════════
   PAGE BASE
══════════════════════════════════════════════ */
.home {
  background: #0b0f19;
  height: calc(100vh - 56px);
  position: relative;
  overflow: hidden;
}

/* ══════════════════════════════════════════════
   ZONA FIJA NORMAL
══════════════════════════════════════════════ */
.fixed-top-zone {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  background: #0b0f19;
}

.banner-carousel {
  border-bottom-left-radius: 18px;
  border-bottom-right-radius: 18px;
  overflow: hidden;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.search-wrapper {
  background: #0b0f19;
  padding: 12px;
}

.search-box {
  display: flex;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
}

.search-input {
  flex: 1;
  padding-left: 12px;
}

.search-btn {
  background: #facc15;
  color: #020617;
  font-weight: 700;
  border-radius: 0;
}

/* ══════════════════════════════════════════════
   ZONA FIJA FIESTA
══════════════════════════════════════════════ */
.fiesta-top-zone {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.fiesta-banner {
  position: relative;
  height: 120px;
  overflow: hidden;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

.fiesta-banner-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #1a0a00 0%, #2d1500 40%, #0d0d1a 100%);
}

.fiesta-banner-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(255, 194, 32, 0.18) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(255, 100, 0, 0.12) 0%, transparent 40%);
}

.fiesta-banner-bg::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #FFC220, #FF8C00, #FFC220, transparent);
}

.fiesta-banner-content {
  position: relative;
  z-index: 2;
  padding: 24px 20px 16px;
}

.fiesta-banner-title {
  font-size: 1.5rem;
  font-weight: 900;
  color: #FFC220;
  letter-spacing: -0.5px;
  text-shadow: 0 0 20px rgba(255, 194, 32, 0.4);
}

.fiesta-banner-sub {
  color: #94a3b8;
  font-size: 0.8rem;
  margin-top: 2px;
}

.search-box--dark {
  background: #111827;
  border: 1px solid #1F2937;
}

.search-input--dark :deep(input) {
  color: #E5E7EB;
}

.search-input--dark :deep(input::placeholder) {
  color: #4B5563;
}

/* ══════════════════════════════════════════════
   LISTA EVENTOS
══════════════════════════════════════════════ */
.events-scroll {
  position: absolute;
  top: 270px;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  padding: 12px;
  scrollbar-width: thin;
  scrollbar-color: #1e293b transparent;
}

.events-scroll--fiesta {
  top: 184px;
  /* fiesta-banner (120) + search (64) */
}

.events-scroll::-webkit-scrollbar {
  width: 4px;
}

.events-scroll::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 4px;
}

.events-scroll::-webkit-scrollbar-track {
  background: transparent;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50%;
  color: #374151;
  gap: 10px;
  font-size: 0.85rem;
}

/* ── TARJETAS POSTER ─────────────────────────── */
.event-card {
  border-radius: 18px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.event-card:active {
  transform: scale(0.98);
}

.event-card--fiesta {
  box-shadow: 0 4px 24px rgba(255, 194, 32, 0.12);
}

.event-card--fiesta:active {
  transform: scale(0.97);
}

/* Imagen dominante */
.event-img-wrap {
  position: relative;
  width: 100%;
  height: 190px;
  overflow: hidden;
}

.event-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.event-card:active .event-img {
  transform: scale(1.03);
}

/* Overlay degradado bottom-up */
.event-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom,
      rgba(2, 6, 23, 0.05) 0%,
      rgba(2, 6, 23, 0.3) 40%,
      rgba(2, 6, 23, 0.92) 100%);
}

/* Badge fiesta */
.fiesta-event-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #FFC220;
  color: #020617;
  font-size: 0.62rem;
  font-weight: 900;
  padding: 4px 10px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 3px;
  box-shadow: 0 2px 10px rgba(255, 194, 32, 0.5);
}

/* Info sobre imagen */
.event-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.event-meta-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.event-date-chip,
.event-location-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #cbd5e1;
  font-size: 0.68rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 999px;
}

.event-title {
  font-weight: 900;
  font-size: 1.05rem;
  color: #ffffff;
  line-height: 1.2;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}

.buy-btn {
  align-self: flex-start;
  background: #2563eb !important;
  color: white !important;
  font-weight: 700 !important;
  border-radius: 10px !important;
  font-size: 0.78rem !important;
  padding: 0 14px !important;
  height: 34px !important;
  box-shadow: 0 2px 10px rgba(37, 99, 235, 0.4) !important;
}

.buy-btn--fiesta {
  background: linear-gradient(135deg, #92400e, #b45309) !important;
  color: #FFC220 !important;
  box-shadow: 0 2px 10px rgba(180, 83, 9, 0.4) !important;
}

/* ══════════════════════════════════════════════
   MODAL BARRA
══════════════════════════════════════════════ */
.bar-modal {
  background: #0b0f19;
  height: 100%;
  display: flex;
  flex-direction: column;
  color: white;
}

/* Header */
.bar-modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 16px 12px;
  background: linear-gradient(180deg, #020617 0%, #0b0f19 100%);
  border-bottom: 1px solid rgba(255, 194, 32, 0.15);
  flex-shrink: 0;
}

.bar-modal-title-col {
  flex: 1;
}

.bar-modal-event {
  font-size: 0.72rem;
  color: #94a3b8;
}

.bar-modal-title {
  font-size: 1.1rem;
  font-weight: 900;
  color: #FFC220;
}

/* Categorías */
.bar-cats {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  overflow-x: auto;
  flex-shrink: 0;
  scrollbar-width: none;
}

.bar-cats::-webkit-scrollbar {
  display: none;
}

.bar-cat-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid #1F2937;
  background: #111827;
  color: #9CA3AF;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.bar-cat-btn--active {
  background: #FFC220;
  color: #020617;
  border-color: #FFC220;
  box-shadow: 0 0 12px rgba(255, 194, 32, 0.3);
}

.bar-cat-icon {
  font-size: 1rem;
}

/* Grid productos */
.bar-products-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  scrollbar-width: thin;
  scrollbar-color: #1e293b transparent;
}

.bar-loading,
.bar-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 12px;
  color: #4B5563;
  font-size: 0.85rem;
}

.bar-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.bar-product-card {
  background: #111827;
  border: 1px solid #1F2937;
  border-radius: 16px;
  overflow: hidden;
  cursor: default;
  transition: border-color 0.2s ease;
  position: relative;
  display: flex;
  flex-direction: column;
}

.bar-product-card--active {
  border-color: rgba(255, 194, 32, 0.35);
  box-shadow: 0 0 12px rgba(255, 194, 32, 0.08);
}

.bar-product-img-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: #0A1020;
  overflow: hidden;
  cursor: pointer;
}

.bar-product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.bar-product-img-wrap:active .bar-product-img {
  transform: scale(1.04);
}

.bar-product-img-overlay {
  position: absolute;
  inset: 0;
  background: transparent;
  transition: background 0.2s;
}

.bar-product-img-wrap:active .bar-product-img-overlay {
  background: rgba(255, 194, 32, 0.08);
}

.bar-product-info {
  padding: 10px 10px 6px;
  flex: 1;
}

.bar-product-name {
  font-size: 0.8rem;
  font-weight: 700;
  color: #E5E7EB;
  line-height: 1.2;
  margin-bottom: 4px;
}

.bar-product-price {
  font-size: 0.88rem;
  font-weight: 900;
  color: #FFC220;
}

/* Controles cantidad */
.bar-product-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  padding: 0 10px 10px;
  height: 38px;
}

/* Botón agregar — ocupa todo el ancho cuando qty=0 */
.bar-add-btn-full {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  height: 34px;
  background: #1F2937;
  border: none;
  border-radius: 10px;
  color: #9CA3AF;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.bar-add-btn-full:active {
  background: #FFC220;
  color: #020617;
}

/* Controles +/- cuando hay qty */
.bar-qty-btn {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.bar-qty-btn--minus {
  background: #1F2937;
  color: #EF4444;
}

.bar-qty-btn--minus:active {
  background: #EF4444;
  color: white;
}

.bar-qty-btn--plus {
  background: #FFC220;
  color: #020617;
}

.bar-qty-btn--plus:active {
  background: #F5B300;
}

.bar-qty-num {
  flex: 1;
  text-align: center;
  font-weight: 900;
  font-size: 1rem;
  color: #FFC220;
}

/* Footer carrito */
.bar-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  padding-bottom: max(14px, env(safe-area-inset-bottom));
  background: #020617;
  border-top: 1px solid rgba(255, 194, 32, 0.2);
  flex-shrink: 0;
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.4);
}

.bar-footer-total {
  display: flex;
  flex-direction: column;
}

.bar-footer-label {
  color: #6B7280;
  font-size: 0.72rem;
}

.bar-footer-amount {
  color: #FFC220;
  font-size: 1.2rem;
  font-weight: 900;
}

.bar-pay-btn {
  background: linear-gradient(135deg, #FFC220, #F5B300) !important;
  color: #020617 !important;
  font-weight: 800 !important;
  border-radius: 14px !important;
  height: 48px !important;
  padding: 0 24px !important;
  font-size: 0.9rem !important;
  box-shadow: 0 4px 16px rgba(255, 194, 32, 0.35) !important;
}

.scan-btn {
  margin-top: 6px;
  background: rgba(255, 194, 32, 0.15) !important;
  color: #FFC220 !important;
  border: 1px solid rgba(255, 194, 32, 0.4);
  border-radius: 10px;
  font-size: 0.7rem;
}

.scanner-card {
  width: 100%;
  border-radius: 20px 20px 0 0;
  background: #0b0f19;
  padding-bottom: 12px;
}

.scanner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #1f2937;
}

.scanner-body {
  padding: 12px;
}

.scanner-view {
  width: 100%;
  height: 260px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(255, 194, 32, 0.2);
}

.scanner-controls {
  padding-top: 10px;
}
</style>