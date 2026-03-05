<template>
  <q-page class="invitations-page">

    <div class="header">
      <q-btn flat icon="arrow_back" color="white" @click="router.back()" />
      <div>
        <div class="title">Invitados</div>
        <div class="subtitle">Mesa {{ seatId }} · {{ usedCount }}/10 invitados</div>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <q-spinner color="yellow" size="40px" />
    </div>

    <div v-else>
      <div
        v-for="inv in invitations"
        :key="inv.id"
        class="inv-card"
      >
        <div class="inv-left">
          <q-icon
            :name="inv.guest_phone ? 'person' : 'person_outline'"
            size="24px"
            :color="inv.guest_phone ? 'green' : 'grey'"
          />
          <div>
            <div class="inv-phone">
              {{ inv.guest_phone || 'Sin asignar' }}
            </div>
            <q-badge
              :color="inv.status === 'used' ? 'grey' : inv.guest_phone ? 'green' : 'orange'"
            >
              {{ inv.status === 'used' ? 'Ingresó' : inv.guest_phone ? 'Enviado' : 'Disponible' }}
            </q-badge>
          </div>
        </div>

        <div class="inv-actions">
          <!-- Si ya tiene invitado, reenviar -->
          <q-btn
            v-if="inv.guest_phone"
            flat round icon="whatsapp"
            color="green"
            @click="shareWhatsApp(inv)"
          />

          <!-- Si no, asignar -->
          <q-btn
            v-else
            flat round icon="person_add"
            color="yellow"
            @click="openAssign(inv)"
          />
        </div>

      </div>
    </div>

    <!-- DIALOG ASIGNAR NÚMERO -->
    <q-dialog v-model="showDialog">
      <q-card class="assign-dialog">
        <q-card-section>
          <div class="dialog-title">Agregar invitado</div>
          <q-input
            v-model="inputPhone"
            label="Número WhatsApp"
            placeholder="+56912345678"
            dark filled
            class="q-mt-md"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            unelevated label="Enviar invitación"
            class="send-btn"
            @click="assignPhone"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from 'boot/axios'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()

const ticketId = route.params.ticketId
const invitations = ref([])
const loading = ref(true)
const showDialog = ref(false)
const inputPhone = ref('')
const selectedInv = ref(null)
const seatId = ref('')

const usedCount = computed(() =>
  invitations.value.filter(i => i.guest_phone).length
)

const loadInvitations = async () => {
  try {
    const res = await api.get(`/auth/tickets/${ticketId}/invitations`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    invitations.value = res.data.invitations
    seatId.value = res.data.seat_id
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const openAssign = (inv) => {
  selectedInv.value = inv
  inputPhone.value = ''
  showDialog.value = true
}

const assignPhone = async () => {
  if (!inputPhone.value) return

  try {
    const res = await api.post(
      `/auth/invitations/${selectedInv.value.id}/assign`,
      { phone: inputPhone.value },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    )

    showDialog.value = false

    if (res.data.success) {
      selectedInv.value.guest_phone = inputPhone.value
      selectedInv.value.status = 'sent'

      if (res.data.whatsapp) {
        await Swal.fire({
          icon: 'success',
          title: '¡Invitación enviada!',
          text: `Se envió el WhatsApp a ${res.data.phone}`,
          background: '#0f172a',
          color: '#ffffff',
          confirmButtonColor: '#facc15',
          confirmButtonText: 'OK'
        })
      } else {
        await Swal.fire({
          icon: 'warning',
          title: 'Invitación guardada',
          text: 'Pero no se pudo enviar el WhatsApp. Intenta reenviar.',
          background: '#0f172a',
          color: '#ffffff',
          confirmButtonColor: '#facc15',
          confirmButtonText: 'Entendido'
        })
      }
    }
  } catch (e) {
    console.error(e)
    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo asignar el invitado. Intenta de nuevo.',
      background: '#0f172a',
      color: '#ffffff',
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Cerrar'
    })
  }
}


onMounted(loadInvitations)
</script>

<style scoped>
.invitations-page {
  background: #0b0f19;
  color: white;
  padding: 16px;
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.title {
  font-size: 1.2rem;
  font-weight: 900;
}

.subtitle {
  font-size: 0.8rem;
  color: #94a3b8;
}

.loading {
  display: flex;
  justify-content: center;
  padding-top: 60px;
}

.inv-card {
  background: #020617;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.inv-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.inv-phone {
  font-weight: 700;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.assign-dialog {
  background: #0f172a;
  color: white;
  border-radius: 16px;
  min-width: 300px;
}

.dialog-title {
  font-weight: 900;
  font-size: 1rem;
}

.send-btn {
  background: #facc15;
  color: #020617;
  font-weight: 800;
  border-radius: 10px;
}
</style>