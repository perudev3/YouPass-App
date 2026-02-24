<template>
  <q-page class="invitations-page">

    <div class="header">
      <div class="title">Mis Invitaciones</div>
      <div class="subtitle">Eventos a los que fuiste invitado</div>
    </div>

    <div v-if="loading" class="loading">
      <q-spinner color="yellow" size="40px" />
    </div>

    <div v-else-if="invitations.length === 0" class="empty">
      <q-icon name="mail_outline" size="48px" />
      <p>No tienes invitaciones aún</p>
    </div>

    <div v-else>
      <q-card
        v-for="inv in invitations"
        :key="inv.id"
        flat
        class="inv-card"
      >
        <!-- IMAGEN EVENTO -->
        <div class="event-img">
          <img :src="inv.event?.image" />
          <div class="inv-badge">
            <q-icon name="mail" size="12px" />
            Invitación
          </div>
        </div>

        <!-- INFO -->
        <div class="info">
          <div class="event-name">{{ inv.event?.name }}</div>

          <div class="meta">
            <q-icon name="event" size="13px" />
            <span>{{ inv.event?.date }}</span>
            <span class="dot">•</span>
            <span>{{ inv.event?.location }}</span>
          </div>

          <div class="host-row">
            <q-icon name="person" size="13px" color="yellow" />
            <span>Invitado por <strong>{{ inv.host_name }}</strong></span>
          </div>

          <div class="seat-row">
            <q-icon name="table_bar" size="13px" color="green" />
            <span>Mesa {{ inv.seat_id }}</span>
          </div>
        </div>

        <!-- STATUS / ACCIONES -->
        <div class="actions">

          <!-- PENDIENTE -->
          <div v-if="inv.status === 'sent'" class="action-buttons">
            <q-btn
              unelevated
              class="accept-btn"
              icon="check"
              label="Aceptar"
              @click="respond(inv, 'accepted')"
            />
            <q-btn
              flat
              class="decline-btn"
              icon="close"
              label="Declinar"
              @click="respond(inv, 'declined')"
            />
          </div>

          <!-- ACEPTADA → mostrar QR -->
          <div v-else-if="inv.status === 'accepted'" class="qr-section">
            <q-badge color="green" class="q-mb-sm">✓ Aceptada</q-badge>
            <canvas 
                :ref="el => { if(el) { qrCanvas[inv.id] = el; generateQR(inv) } }" 
                class="qr-canvas" 
            />
            <div class="inv-code">{{ inv.code }}</div>
          <!--   <q-btn
              flat size="sm"
              icon="download"
              label="Descargar QR"
              class="download-btn"
              @click="downloadQR(inv)"
            /> -->
          </div>

          <!-- DECLINADA -->
          <div v-else-if="inv.status === 'declined'" class="declined-box">
            <q-icon name="cancel" color="red" size="24px" />
            <span>Invitación declinada</span>
          </div>

          <!-- USADA -->
          <div v-else-if="inv.status === 'used'" class="used-box">
            <q-icon name="check_circle" color="grey" size="24px" />
            <span>Ya ingresaste al evento</span>
          </div>

        </div>

      </q-card>
    </div>

  </q-page>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { api } from 'boot/axios'
import QRCode from 'qrcode'

const invitations = ref([])
const loading = ref(true)
const qrCanvas = ref({})

watch(invitations, async () => {
  await nextTick()
  await nextTick() // doble nextTick para asegurar que el DOM esté listo
  invitations.value
    .filter(i => i.status === 'accepted')
    .forEach(inv => generateQR(inv))
}, { deep: true })

const loadInvitations = async () => {
  try {
    const res = await api.get('/auth/my-invitations', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    invitations.value = res.data
    // 🔥 Ya no necesitas generar QRs aquí, el :ref lo hace solo

  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const respond = async (inv, status) => {
  try {
    const res = await api.post(
      `/auth/invitations/${inv.id}/respond`,
      { status },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    )

    if (res.data.success) {
      inv.status = status
      // 🔥 Ya no necesitas generar QR aquí, el :ref lo hace solo
    }
  } catch (e) {
    console.error(e)
    alert('Error al responder invitación')
  }
}

const generateQR = async (inv) => {
  const canvas = qrCanvas.value[inv.id]
  if (!canvas) return
  await QRCode.toCanvas(canvas, inv.code, {
    width: 160,
    margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' }
  })
}


/* const downloadQR = async (inv) => {
  const url = await QRCode.toDataURL(inv.code, { width: 300, margin: 2 })
  const link = document.createElement('a')
  link.href = url
  link.download = `invitacion-${inv.code}.png`
  link.click()
} */

onMounted(loadInvitations)
</script>

<style scoped>
.invitations-page {
  background: #0b0f19;
  color: white;
  padding: 16px;
  padding-bottom: 80px;
}

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

.loading, .empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: #94a3b8;
  gap: 12px;
}

/* CARD */
.inv-card {
  background: #020617;
  border-radius: 16px;
  margin-bottom: 16px;
  overflow: hidden;
}

/* IMAGEN */
.event-img {
  position: relative;
}

.event-img img {
  width: 100%;
  height: 130px;
  object-fit: cover;
}

.inv-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #facc15;
  color: #020617;
  font-size: 0.7rem;
  font-weight: 900;
  padding: 4px 10px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* INFO */
.info {
  padding: 14px 14px 0;
}

.event-name {
  font-weight: 900;
  font-size: 1rem;
  margin-bottom: 6px;
}

.meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 6px;
}

.host-row, .seat-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  margin-bottom: 4px;
  color: #cbd5e1;
}

/* ACTIONS */
.actions {
  padding: 14px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.accept-btn {
  background: #16a34a;
  color: white;
  font-weight: 800;
  border-radius: 10px;
  flex: 1;
}

.decline-btn {
  color: #ef4444;
  font-weight: 800;
  border-radius: 10px;
  flex: 1;
  border: 1px solid #ef4444;
}

/* QR */
.qr-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.qr-canvas {
  border-radius: 12px;
  background: white;
  padding: 8px;
}

.inv-code {
  font-size: 0.75rem;
  color: #94a3b8;
  letter-spacing: 2px;
}

.download-btn {
  color: #facc15;
  font-weight: 700;
}

/* DECLINED / USED */
.declined-box, .used-box {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 0.85rem;
  padding: 4px 0;
}
</style>