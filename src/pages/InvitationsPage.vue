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
          <p class="dialog-subtitle">Ingresa el número WhatsApp del invitado.</p>

          <!-- PHONE INPUT igual al del login -->
          <div class="phone-card">
            <q-select
              v-model="selectedCountry"
              :options="countries"
              option-label="label"
              dense
              borderless
              class="country-select"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <span class="flag">{{ scope.opt.flag }}</span>
                  </q-item-section>
                  <q-item-section>
                    {{ scope.opt.name }} (+{{ scope.opt.code }})
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:selected>
                <div class="selected-wrap">
                  <span class="flag">{{ selectedCountry.flag }}</span>
                  <span class="ccode">+{{ selectedCountry.code }}</span>
                  <q-icon name="keyboard_arrow_down" size="15px" color="grey-6" />
                </div>
              </template>
            </q-select>

            <div class="vsep" />

            <q-input
              v-model="inputPhone"
              placeholder="912 345 678"
              borderless
              dense
              class="phone-input-field"
              input-class="phone-input-native"
              type="tel"
              maxlength="12"
            />
          </div>
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

const countries = [
  { name: 'Chile',     code: '56', flag: '🇨🇱', label: 'Chile' },
  { name: 'Perú',      code: '51', flag: '🇵🇪', label: 'Perú' },
  { name: 'México',    code: '52', flag: '🇲🇽', label: 'México' },
  { name: 'Colombia',  code: '57', flag: '🇨🇴', label: 'Colombia' },
  { name: 'Argentina', code: '54', flag: '🇦🇷', label: 'Argentina' },
  { name: 'España',    code: '34', flag: '🇪🇸', label: 'España' },
]
const selectedCountry = ref(countries[0])

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
  selectedCountry.value = countries[0]
  showDialog.value = true
}

const assignPhone = async () => {
  if (!inputPhone.value) return

  // Combinar código de país + número ingresado
  const fullPhone = selectedCountry.value.code + inputPhone.value.replace(/\s/g, '')

  try {
    const res = await api.post(
      `/auth/invitations/${selectedInv.value.id}/assign`,
      { phone: fullPhone },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    )

    showDialog.value = false

    if (res.data.success) {
      selectedInv.value.guest_phone = fullPhone
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

/* ── DIALOG ── */
.assign-dialog {
  background: #0f172a;
  color: white;
  border-radius: 20px;
  min-width: 320px;
  max-width: 380px;
  width: 90vw;
}

.dialog-title {
  font-weight: 900;
  font-size: 1rem;
  margin-bottom: 4px;
}

.dialog-subtitle {
  font-size: 0.78rem;
  color: #64748b;
  margin: 0 0 14px;
}

/* ── PHONE CARD (mismo estilo que el login) ── */
.phone-card {
  display: flex;
  align-items: center;
  background: #0b1220;
  border: 1px solid #1e293b;
  border-radius: 14px;
  padding: 11px 14px;
}

.country-select { flex-shrink: 0; }
.country-select :deep(.q-field__control)        { padding: 0; min-height: unset; }
.country-select :deep(.q-field__native)         { padding: 0; }
.country-select :deep(.q-field__control:before),
.country-select :deep(.q-field__control:after)  { border: none !important; }

.selected-wrap {
  display: flex;
  align-items: center;
  gap: 5px;
}
.flag  { font-size: 19px; line-height: 1; }
.ccode { font-size: 0.92rem; font-weight: 700; color: #e2e8f0; }

.vsep {
  width: 1px;
  height: 24px;
  background: #1e293b;
  margin: 0 12px;
  flex-shrink: 0;
}

.phone-input-field {
  flex: 1;
}
.phone-input-field :deep(.q-field__control)        { padding: 0; min-height: unset; }
.phone-input-field :deep(.q-field__control:before),
.phone-input-field :deep(.q-field__control:after)  { border: none !important; }
.phone-input-field :deep(.q-field__native),
.phone-input-field :deep(input) {
  color: #f1f5f9 !important;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 0;
}
.phone-input-field :deep(input::placeholder) {
  color: #2a3a55;
}

/* ── BOTÓN ENVIAR ── */
.send-btn {
  background: #facc15;
  color: #020617;
  font-weight: 800;
  border-radius: 10px;
}

/* ── QUASAR DROPDOWN ── */
:deep(.q-menu) {
  background: #0f172a !important;
  border: 1px solid #1e293b !important;
  border-radius: 14px !important;
  box-shadow: 0 12px 40px rgba(0,0,0,0.65) !important;
}
:deep(.q-item) {
  color: #e2e8f0 !important;
  border-radius: 8px;
  margin: 3px 6px;
  font-size: 0.88rem;
}
:deep(.q-item:hover),
:deep(.q-item--active) { background: #1e293b !important; }
</style>