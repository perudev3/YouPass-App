<template>
  <q-page class="bar-purchases-page">

    <!-- HEADER -->
    <div class="page-header">
      <div class="header-inner row items-center q-gutter-sm">
        <div class="header-icon">
          <q-icon name="local_bar" size="20px" color="dark" />
        </div>
        <span class="header-title">Mis compras del bar</span>
      </div>
    </div>

    <!-- STATS -->
    <div class="stats-grid q-pa-md">
      <div class="stat-card">
        <div class="stat-val">{{ orders.length }}</div>
        <div class="stat-lbl">Total pedidos</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">{{ pendingCount }}</div>
        <div class="stat-lbl">Pendientes</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">{{ formatPrice(totalSpent) }}</div>
        <div class="stat-lbl">Gastado</div>
      </div>
    </div>

    <!-- FILTERS -->
    <div class="filters-row q-px-md">
      <div
        v-for="f in filters"
        :key="f.value"
        class="filter-chip"
        :class="{ 'filter-chip--active': activeFilter === f.value }"
        @click="activeFilter = f.value"
      >
        {{ f.label }}
      </div>
    </div>

    <!-- COUNT LABEL -->
    <div class="count-label q-px-md q-pb-sm">
      {{ filteredOrders.length }} pedido{{ filteredOrders.length !== 1 ? 's' : '' }}
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="flex flex-center q-py-xl">
      <q-spinner color="amber" size="36px" />
    </div>

    <!-- EMPTY STATE -->
    <div v-else-if="!loading && filteredOrders.length === 0" class="empty-state">
      <div class="empty-icon">
        <q-icon name="local_bar" size="30px" color="grey-7" />
      </div>
      <div class="empty-title">Sin pedidos aquí</div>
      <div class="empty-sub">No tienes compras en esta categoría</div>
    </div>

    <!-- ORDERS LIST -->
    <div v-else class="orders-list q-px-md">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="order-card"
      >
        <!-- TOP ROW -->
        <div class="order-top row items-start no-wrap q-pa-sm q-pa-md-md">
          <div class="item-icon flex flex-center">
            <q-icon :name="barIcon(order.bar_item?.category)" size="24px" color="amber" />
          </div>
          <div class="order-info col q-mx-sm">
            <div class="order-name">{{ order.bar_item?.name ?? 'Ítem de bar' }}</div>
            <div class="order-event">{{ order.event?.name ?? '—' }}</div>
            <div class="order-meta row items-center q-gutter-x-sm q-mt-xs">
              <span class="order-price">{{ formatPrice(order.price * order.quantity) }}</span>
              <span class="qty-badge">x{{ order.quantity }}</span>
              <span class="status-badge" :class="statusClass(order.status)">
                {{ statusLabel(order.status) }}
              </span>
            </div>
          </div>
          <div class="order-date">{{ formatDate(order.created_at) }}</div>
        </div>

        <!-- BOTTOM ROW -->
        <div class="order-bottom row items-center justify-between q-px-md q-py-sm">
          <div class="row items-center q-gutter-x-xs">
            <span class="code-label">Código</span>
            <span class="code-val">{{ order.code }}</span>
          </div>
          <q-btn
            v-if="order.status !== 'cancelled'"
            flat
            dense
            no-caps
            size="sm"
            class="qr-btn"
            icon="qr_code_2"
            label="Ver QR"
            @click="openQR(order)"
          />
        </div>
      </div>
    </div>

    <!-- QR MODAL -->
    <q-dialog v-model="qrModal" persistent>
      <q-card class="qr-dialog-card">
        <q-card-section class="text-center q-pb-none">
          <div class="qr-item-name">{{ selectedOrder?.bar_item?.name ?? 'Ítem de bar' }}</div>
          <div class="qr-event-name">{{ selectedOrder?.event?.name }}</div>
        </q-card-section>

        <q-card-section class="flex flex-center q-py-md">
          <div class="qr-frame">
            <q-img
              v-if="selectedOrder?.qr_code"
              :src="selectedOrder.qr_code"
              width="180px"
              height="180px"
              fit="contain"
            />
            <div v-else class="qr-placeholder flex flex-center">
              <q-spinner color="amber" size="32px" />
            </div>
          </div>
        </q-card-section>

        <q-card-section class="text-center q-pt-none q-pb-sm">
          <div class="qr-code-text">{{ selectedOrder?.code }}</div>
          <span class="status-badge q-mt-xs" :class="statusClass(selectedOrder?.status)">
            {{ statusLabel(selectedOrder?.status) }}
          </span>
        </q-card-section>

        <q-card-actions align="center" class="q-pb-md">
          <q-btn
            flat no-caps
            label="Cerrar"
            class="qr-close-btn"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'boot/axios'

// ── STATE ──────────────────────────────────────────────────
const orders      = ref([])
const loading     = ref(true)
const activeFilter = ref('all')
const qrModal     = ref(false)
const selectedOrder = ref(null)

const filters = [
  { value: 'all',       label: 'Todos' },
  { value: 'pending',   label: 'Pendientes' },
  { value: 'used',      label: 'Usados' },
  { value: 'cancelled', label: 'Cancelados' },
]

// ── COMPUTED ───────────────────────────────────────────────
const filteredOrders = computed(() => {
  if (activeFilter.value === 'all') return orders.value
  return orders.value.filter(o => o.status === activeFilter.value)
})

const pendingCount = computed(() =>
  orders.value.filter(o => o.status === 'pending').length
)

const totalSpent = computed(() =>
  orders.value.reduce((acc, o) => acc + (o.price * o.quantity), 0)
)

// ── HELPERS ────────────────────────────────────────────────
function statusLabel(status) {
  const map = { pending: 'Pendiente', used: 'Usado', cancelled: 'Cancelado' }
  return map[status] ?? status
}

function statusClass(status) {
  const map = {
    pending:   'status--pending',
    used:      'status--used',
    cancelled: 'status--cancelled',
  }
  return map[status] ?? ''
}

function barIcon(category) {
  const map = {
    bebidas:    'local_bar',
    cocteles:   'wine_bar',
    cervezas:   'sports_bar',
    agua:       'water_drop',
    snacks:     'fastfood',
    comida:     'restaurant',
  }
  return map[category?.toLowerCase()] ?? 'local_bar'
}

function formatPrice(val) {
  return '$' + Number(val).toLocaleString('es-CL')
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── ACTIONS ────────────────────────────────────────────────
function openQR(order) {
  selectedOrder.value = order
  qrModal.value = true
}

// ── API ────────────────────────────────────────────────────
const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await api.get('/auth/bar-orders/my')
    orders.value = res.data.orders ?? []
  } catch (err) {
    console.error('Error cargando pedidos del bar:', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchOrders)
</script>

<style scoped>
.bar-purchases-page {
  background: #020617;
  min-height: 100vh;
  color: #E5E7EB;
}

/* HEADER */
.page-header {
  background: linear-gradient(90deg, #020617 0%, #0F172A 60%, #020617 100%);
  border-bottom: 1px solid #1F2937;
  padding: 16px;
  position: relative;
}
.page-header::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; width: 100%; height: 2px;
  background: linear-gradient(90deg, transparent, #FFC220, #F5B300, #FFC220, transparent);
}
.header-inner { padding: 0; }
.header-icon {
  width: 34px; height: 34px;
  background: #FFC220; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
}
.header-title {
  font-size: 17px; font-weight: 500; color: #fff;
}

/* STATS */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.stat-card {
  background: #111827;
  border: 1px solid #1F2937;
  border-radius: 12px;
  padding: 12px 8px;
  text-align: center;
}
.stat-val { font-size: 20px; font-weight: 500; color: #FFC220; }
.stat-lbl { font-size: 11px; color: #6B7280; margin-top: 3px; }

/* FILTERS */
.filters-row {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 12px;
  scrollbar-width: none;
}
.filters-row::-webkit-scrollbar { display: none; }
.filter-chip {
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px; font-weight: 500;
  cursor: pointer;
  border: 1px solid #374151;
  color: #9CA3AF;
  background: #111827;
  transition: all 0.2s ease;
}
.filter-chip--active {
  background: #FFC220;
  color: #1A1A1A;
  border-color: #FFC220;
}

/* COUNT */
.count-label {
  font-size: 12px;
  color: #4B5563;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* ORDERS */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 24px;
}

.order-card {
  background: #0F172A;
  border: 1px solid #1F2937;
  border-radius: 16px;
  overflow: hidden;
  transition: border-color 0.2s ease;
}
.order-card:hover { border-color: rgba(255,194,32,0.3); }

.item-icon {
  width: 44px; height: 44px;
  background: #111827;
  border: 1px solid #1F2937;
  border-radius: 12px;
  flex-shrink: 0;
}
.order-name  { font-size: 15px; font-weight: 500; color: #F9FAFB; }
.order-event { font-size: 12px; color: #6B7280; margin-top: 2px; }
.order-price { font-size: 14px; font-weight: 500; color: #FFC220; }

.qty-badge {
  font-size: 11px; color: #9CA3AF;
  background: #111827;
  border: 1px solid #374151;
  border-radius: 6px; padding: 1px 7px;
}

.status-badge {
  display: inline-block;
  font-size: 11px; font-weight: 500;
  border-radius: 6px; padding: 2px 8px;
}
.status--pending   { background: rgba(255,194,32,0.12); color: #FFC220;  border: 1px solid rgba(255,194,32,0.3); }
.status--used      { background: rgba(74,222,128,0.10); color: #4ADE80;  border: 1px solid rgba(74,222,128,0.3); }
.status--cancelled { background: rgba(239,68,68,0.10);  color: #F87171;  border: 1px solid rgba(239,68,68,0.3); }

.order-date { font-size: 11px; color: #4B5563; flex-shrink: 0; }

.order-bottom {
  border-top: 1px solid #1F2937;
  padding: 10px 16px;
}
.code-label { font-size: 11px; color: #4B5563; }
.code-val {
  font-size: 12px; font-weight: 500;
  color: #9CA3AF;
  font-family: monospace;
  letter-spacing: 0.05em;
}
.qr-btn {
  background: #111827 !important;
  border: 1px solid #374151 !important;
  color: #9CA3AF !important;
  border-radius: 10px !important;
  padding: 4px 12px !important;
}
.qr-btn:hover {
  background: rgba(255,194,32,0.1) !important;
  border-color: rgba(255,194,32,0.4) !important;
  color: #FFC220 !important;
}

/* EMPTY STATE */
.empty-state {
  text-align: center;
  padding: 56px 24px;
}
.empty-icon {
  width: 64px; height: 64px;
  background: #111827;
  border: 1px solid #1F2937;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
}
.empty-title { font-size: 16px; font-weight: 500; color: #6B7280; }
.empty-sub   { font-size: 13px; color: #374151; margin-top: 4px; }

/* QR DIALOG */
.qr-dialog-card {
  background: #0F172A !important;
  border: 1px solid rgba(255,194,32,0.25) !important;
  border-radius: 20px !important;
  width: 90vw; max-width: 320px;
  box-shadow: 0 0 32px rgba(255,194,32,0.1) !important;
}
.qr-item-name  { font-size: 16px; font-weight: 500; color: #F9FAFB; }
.qr-event-name { font-size: 13px; color: #6B7280; margin-top: 4px; }
.qr-frame {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  display: inline-block;
}
.qr-placeholder {
  width: 180px; height: 180px;
}
.qr-code-text {
  font-size: 13px;
  font-family: monospace;
  color: #9CA3AF;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}
.qr-close-btn {
  background: #1F2937 !important;
  border: 1px solid #374151 !important;
  color: #E5E7EB !important;
  border-radius: 12px !important;
  padding: 8px 32px !important;
  font-size: 14px !important;
  width: 80%;
}
.qr-close-btn:hover { background: #374151 !important; }
</style>