<template>
  <q-page class="config-page">

    <!-- BG GLOW -->
    <div class="bg-glow bg-glow--top" />
    <div class="bg-glow bg-glow--bottom" />

    <div class="config-container q-pa-md">

      <!-- TÍTULO -->
      <div class="page-header q-mb-lg">
        <div class="page-title-row row items-center q-gutter-sm">
          <q-icon name="settings" class="page-title-icon" />
          <h1 class="page-title">Configuración</h1>
        </div>
        <p class="page-subtitle">Administra tu perfil y métodos de pago</p>
      </div>

      <!-- ======================= INFORMACIÓN PERSONAL ======================= -->
      <section class="config-section q-mb-lg">
        <div class="section-label row items-center q-gutter-xs q-mb-md">
          <q-icon name="person_outline" size="16px" class="section-label-icon" />
          <span>Información Personal</span>
        </div>

        <div class="config-card">

          <!-- AVATAR + NOMBRE RÁPIDO -->
          <div class="avatar-row row items-center q-gutter-md q-mb-lg">
            <div class="avatar-wrapper">
              <q-icon :name="profileIcon" class="avatar-icon" />
              <div class="avatar-ring" />
            </div>
            <div class="column">
              <span class="avatar-name">{{ form.name || 'Tu nombre' }}</span>
              <span class="avatar-sub">{{ form.email || 'tu@email.com' }}</span>
            </div>
          </div>

          <!-- NOMBRE -->
          <div class="field-group q-mb-md">
            <label class="field-label">Nombre completo</label>
            <div class="custom-input-wrapper">
              <q-icon name="badge" class="input-prefix-icon" />
              <input
                v-model="form.name"
                class="custom-input"
                placeholder="Ej. Carlos Mendoza"
                type="text"
              />
            </div>
          </div>

          <!-- EMAIL -->
          <div class="field-group q-mb-md">
            <label class="field-label">Correo electrónico</label>
            <div class="custom-input-wrapper">
              <q-icon name="alternate_email" class="input-prefix-icon" />
              <input
                v-model="form.email"
                class="custom-input"
                placeholder="tu@email.com"
                type="email"
              />
            </div>
          </div>

          <!-- INSTAGRAM -->
          <div class="field-group q-mb-lg">
            <label class="field-label">Instagram</label>
            <div class="custom-input-wrapper instagram-wrapper">
              <span class="input-prefix-text">@</span>
              <input
                v-model="form.instagram"
                class="custom-input"
                placeholder="tu_usuario"
                type="text"
                @input="sanitizeInstagram"
              />
              <div v-if="form.instagram" class="instagram-badge">
                <q-icon name="check_circle" size="16px" />
              </div>
            </div>
            <p class="field-hint">Usamos tu Instagram para menciones en historias de eventos 🎉</p>
          </div>

          <!-- GUARDAR PERFIL -->
          <q-btn
            class="save-btn full-width"
            :loading="saving.profile"
            @click="saveProfile"
          >
            <q-icon name="save" class="q-mr-sm" />
            Guardar cambios
          </q-btn>

        </div>
      </section>

      <!-- ======================= MÉTODOS DE PAGO ======================= -->
      <section class="config-section q-mb-lg">
        <div class="section-label row items-center q-gutter-xs q-mb-md">
          <q-icon name="credit_card" size="16px" class="section-label-icon" />
          <span>Métodos de Pago</span>
        </div>

        <!-- TARJETAS GUARDADAS -->
        <div v-if="savedCards.length" class="saved-cards q-mb-md">
          <div
            v-for="(card, i) in savedCards"
            :key="i"
            class="saved-card-item row items-center justify-between q-mb-sm"
          >
            <div class="row items-center q-gutter-sm">
              <!-- BRAND ICON -->
              <div class="card-brand-icon" :class="card.brand">
                <span>{{ card.brand === 'visa' ? 'VISA' : card.brand === 'mastercard' ? 'MC' : '●●' }}</span>
              </div>
              <div class="column">
                <span class="card-number-masked">•••• •••• •••• {{ card.last4 }}</span>
                <span class="card-expiry">Vence {{ card.expiry }}</span>
              </div>
            </div>
            <div class="row items-center q-gutter-xs">
              <q-badge v-if="card.default" class="default-badge">Principal</q-badge>
              <q-btn flat round dense icon="delete_outline" class="delete-card-btn"
                @click="removeCard(i)" />
            </div>
          </div>
        </div>

        <!-- FORMULARIO NUEVA TARJETA -->
        <div class="config-card card-form">

          <div class="card-preview q-mb-lg">
            <div class="credit-card" :class="{ 'card-flipped': cardFlipped }">
              <!-- FRONT -->
              <div class="card-face card-front">
                <div class="card-chip" />
                <div class="card-number-display">
                  {{ formattedCardNumber || '•••• •••• •••• ••••' }}
                </div>
                <div class="card-bottom-row row justify-between items-end">
                  <div class="column">
                    <span class="card-label-small">Titular</span>
                    <span class="card-holder-display">{{ newCard.holder.toUpperCase() || 'NOMBRE APELLIDO' }}</span>
                  </div>
                  <div class="column items-end">
                    <span class="card-label-small">Vence</span>
                    <span class="card-expiry-display">{{ newCard.expiry || 'MM/AA' }}</span>
                  </div>
                </div>
                <div class="card-brand-watermark">{{ detectedBrand.toUpperCase() }}</div>
              </div>
              <!-- BACK -->
              <div class="card-face card-back">
                <div class="card-stripe" />
                <div class="card-cvv-area row items-center justify-end q-pr-md">
                  <div class="cvv-box">
                    <span class="cvv-label">CVV</span>
                    <span class="cvv-value">{{ newCard.cvv || '•••' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- NÚMERO -->
          <div class="field-group q-mb-md">
            <label class="field-label">Número de tarjeta</label>
            <div class="custom-input-wrapper">
              <q-icon name="credit_card" class="input-prefix-icon" />
              <input
                v-model="newCard.number"
                class="custom-input card-number-input"
                placeholder="0000 0000 0000 0000"
                type="tel"
                maxlength="19"
                @input="formatCardNumber"
              />
              <div v-if="detectedBrand" class="brand-detector">
                <span class="brand-chip">{{ detectedBrand }}</span>
              </div>
            </div>
          </div>

          <!-- TITULAR -->
          <div class="field-group q-mb-md">
            <label class="field-label">Nombre del titular</label>
            <div class="custom-input-wrapper">
              <q-icon name="person" class="input-prefix-icon" />
              <input
                v-model="newCard.holder"
                class="custom-input"
                placeholder="Como aparece en la tarjeta"
                type="text"
                @input="newCard.holder = newCard.holder.toUpperCase()"
              />
            </div>
          </div>

          <!-- VENCIMIENTO + CVV -->
          <div class="row q-gutter-md q-mb-lg">
            <div class="field-group col">
              <label class="field-label">Vencimiento</label>
              <div class="custom-input-wrapper">
                <q-icon name="event" class="input-prefix-icon" />
                <input
                  v-model="newCard.expiry"
                  class="custom-input"
                  placeholder="MM/AA"
                  type="tel"
                  maxlength="5"
                  @input="formatExpiry"
                />
              </div>
            </div>
            <div class="field-group col">
              <label class="field-label">CVV</label>
              <div class="custom-input-wrapper">
                <q-icon name="password" class="input-prefix-icon" />
                <input
                  v-model="newCard.cvv"
                  class="custom-input"
                  placeholder="•••"
                  type="tel"
                  maxlength="4"
                  @focus="cardFlipped = true"
                  @blur="cardFlipped = false"
                />
              </div>
            </div>
          </div>

          <!-- SET DEFAULT -->
          <div class="row items-center justify-between q-mb-lg default-toggle-row">
            <div class="column">
              <span class="default-toggle-label">Establecer como tarjeta principal</span>
              <span class="default-toggle-hint">Se usará por defecto al comprar</span>
            </div>
            <q-toggle v-model="newCard.isDefault" color="amber" keep-color />
          </div>

          <!-- AVISO SEGURIDAD -->
          <div class="security-notice row items-center q-gutter-sm q-mb-lg">
            <q-icon name="verified_user" class="security-icon" />
            <span class="security-text">Tu información está encriptada con SSL 256-bit. No almacenamos el CVV.</span>
          </div>

          <q-btn
            class="save-btn full-width"
            :loading="saving.card"
            @click="saveCard"
          >
            <q-icon name="add_card" class="q-mr-sm" />
            Agregar tarjeta
          </q-btn>

        </div>
      </section>

      <!-- DANGER ZONE -->
      <!-- <section class="config-section q-mb-xl">
        <div class="section-label row items-center q-gutter-xs q-mb-md">
          <q-icon name="warning_amber" size="16px" style="color: #EF4444" />
          <span style="color: #EF4444">Zona de peligro</span>
        </div>
        <div class="config-card danger-card">
          <div class="row items-center justify-between">
            <div class="column">
              <span class="danger-title">Eliminar cuenta</span>
              <span class="danger-sub">Esta acción es irreversible. Se borrarán todos tus datos.</span>
            </div>
            <q-btn flat class="danger-btn" @click="confirmDelete">
              <q-icon name="delete_forever" class="q-mr-xs" />
              Eliminar
            </q-btn>
          </div>
        </div>
      </section> -->

    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted  } from 'vue'

defineOptions({ name: 'UserConfigurations' })
import { api } from 'boot/axios'
import Swal from 'sweetalert2'


// ── FORM PERFIL ────────────────────────────────────────────
const form = ref({
  name: '',
  email: '',
  instagram: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const saving = ref({ profile: false, password: false, card: false })

// ── INSTAGRAM ──────────────────────────────────────────────
const sanitizeInstagram = () => {
  form.value.instagram = form.value.instagram.replace('@', '').replace(/\s/g, '')
}

// ── PERFIL ICON ────────────────────────────────────────────
const profileIcon = computed(() => 'account_circle')

// ── TARJETA ────────────────────────────────────────────────
const cardFlipped = ref(false)
const savedCards = ref([])

const newCard = ref({
  number: '',
  holder: '',
  expiry: '',
  cvv: '',
  isDefault: true,
})

const formattedCardNumber = computed(() => newCard.value.number)

const detectedBrand = computed(() => {
  const n = newCard.value.number.replace(/\s/g, '')
  if (/^4/.test(n)) return 'VISA'
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'MASTERCARD'
  if (/^3[47]/.test(n)) return 'AMEX'
  return ''
})

const formatCardNumber = () => {
  let v = newCard.value.number.replace(/\D/g, '').slice(0, 16)
  newCard.value.number = v.replace(/(.{4})/g, '$1 ').trim()
}

const formatExpiry = () => {
  let v = newCard.value.expiry.replace(/\D/g, '').slice(0, 4)
  if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2)
  newCard.value.expiry = v
}

// ── ACCIONES ───────────────────────────────────────────────
const saveProfile = async () => {

  saving.value.profile = true

  try {

    await api.post('/auth/profile', {
      name: form.value.name,
      email: form.value.email,
      birth_date: form.value.birth_date,
      gender: form.value.gender,
      instagram: form.value.instagram
    })

    await Swal.fire({
      title: 'Perfil actualizado',
      icon: 'success'
    })

  } catch (e) {

    Swal.fire({
      title: 'Error',
      text: e.response?.data?.message || 'No se pudo actualizar el perfil',
      icon: 'error'
    })

  } finally {
    saving.value.profile = false
  }
}


const saveCard = async () => {

  const raw = newCard.value.number.replace(/\s/g,'')

  if(raw.length < 15){
    Swal.fire({title:'Número inválido',icon:'warning'})
    return
  }

  if(!detectedBrand.value){
    Swal.fire({
      title:'Tarjeta no reconocida',
      text:'Solo aceptamos Visa, Mastercard o Amex',
      icon:'warning'
    })
    return
  }

  saving.value.card = true

  try {

    const res = await api.post('/auth/cards',{
      brand: detectedBrand.value.toLowerCase(),
      last4: raw.slice(-4),
      expiry: newCard.value.expiry,
      holder: newCard.value.holder,
      is_default: newCard.value.isDefault
    })

    savedCards.value.push(res.data)

  } catch(e){
    console.error(e)
  }

}

const removeCard = (i) => {
  savedCards.value.splice(i, 1)
}

/* const confirmDelete = async () => {
  const result = await Swal.fire({
    title: '¿Eliminar tu cuenta?',
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#EF4444',
    cancelButtonColor: '#374151',
    background: '#0F172A',
    color: '#E5E7EB',
  })
  if (result.isConfirmed) {
    // api.delete('/auth/account')
  }
}
 */

 const loadProfile = async () => {
  try {

    const res = await api.get('/auth/me')

    const user = res.data.user

    form.value.name = user.name || ''
    form.value.email = user.email || ''
    form.value.instagram = user.instagram || ''
    form.value.birth_date = user.birth_date || ''
    form.value.gender = user.gender || ''

  } catch (e) {
    console.error(e)
  }
}

const loadCards = async () => {
  try {
    const res = await api.get('/auth/cards')
    savedCards.value = res.data.cards ?? []
  } catch (e) {
    console.error('Error cargando tarjetas:', e)
    savedCards.value = [] // valor seguro por defecto
  }
}

onMounted(() => {
  loadProfile()
  loadCards()
})
</script>

<style scoped>
/* =========================================================
   PAGE BASE
========================================================= */
.config-page {
  background: #020617;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.config-container {
  max-width: 520px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  padding-bottom: 60px;
}

/* GLOW BG */
.bg-glow {
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}
.bg-glow--top {
  width: 320px; height: 320px;
  top: -80px; right: -80px;
  background: radial-gradient(circle, rgba(255,194,32,0.07) 0%, transparent 70%);
}
.bg-glow--bottom {
  width: 280px; height: 280px;
  bottom: 80px; left: -60px;
  background: radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%);
}

/* =========================================================
   HEADER
========================================================= */
.page-header { padding-top: 8px; }

.page-title-row { }

.page-title-icon {
  font-size: 24px;
  color: #FFC220;
  filter: drop-shadow(0 0 8px rgba(255,194,32,0.5));
}

.page-title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #FFFFFF;
  line-height: 1;
}

.page-subtitle {
  margin: 4px 0 0 36px;
  color: #6B7280;
  font-size: 0.82rem;
}

/* =========================================================
   SECTION LABELS
========================================================= */
.section-label {
  color: #9CA3AF;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.2px;
}
.section-label-icon { color: #FFC220; }

/* =========================================================
   CARDS
========================================================= */
.config-card {
  background: linear-gradient(145deg, #111827, #0D1525);
  border: 1px solid rgba(255,194,32,0.12);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04);
  transition: border-color 0.3s;
}
.config-card:hover {
  border-color: rgba(255,194,32,0.22);
}

/* =========================================================
   AVATAR ROW
========================================================= */
.avatar-wrapper {
  position: relative;
  width: 52px; height: 52px;
}
.avatar-icon {
  font-size: 52px;
  color: #FFC220;
  filter: drop-shadow(0 0 10px rgba(255,194,32,0.5));
}
.avatar-ring {
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 2px solid rgba(255,194,32,0.35);
  animation: ring-pulse 3s ease-in-out infinite;
}
@keyframes ring-pulse {
  0%,100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.9; transform: scale(1.05); }
}

.avatar-name { color: #FFFFFF; font-weight: 700; font-size: 0.95rem; }
.avatar-sub  { color: #6B7280; font-size: 0.78rem; }

/* =========================================================
   FIELDS
========================================================= */
.field-label {
  display: block;
  color: #9CA3AF;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 6px;
}

.custom-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #0A1020;
  border: 1px solid #1F2937;
  border-radius: 12px;
  padding: 0 12px;
  height: 48px;
  transition: all 0.25s ease;
}
.custom-input-wrapper:focus-within {
  border-color: #FFC220;
  box-shadow: 0 0 0 3px rgba(255,194,32,0.1);
}
.custom-input-wrapper.input-error {
  border-color: #EF4444;
  box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
}

.input-prefix-icon {
  color: #4B5563;
  font-size: 18px;
  margin-right: 10px;
  flex-shrink: 0;
  transition: color 0.25s;
}
.custom-input-wrapper:focus-within .input-prefix-icon { color: #FFC220; }

.input-prefix-text {
  color: #FFC220;
  font-size: 1rem;
  font-weight: 700;
  margin-right: 6px;
  flex-shrink: 0;
}

.custom-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #E5E7EB;
  font-size: 0.9rem;
  font-family: inherit;
}
.custom-input::placeholder { color: #374151; }

.instagram-wrapper { position: relative; }
.instagram-badge {
  color: #4ADE80;
  display: flex;
  align-items: center;
}

.field-hint  { color: #4B5563; font-size: 0.72rem; margin-top: 5px; }
.field-error { color: #EF4444; font-size: 0.72rem; margin-top: 5px; }

/* =========================================================
   PASSWORD TOGGLE INSIDE INPUT
========================================================= */
.pass-toggle {
  color: #4B5563 !important;
  margin-right: -6px;
}
.pass-toggle:hover { color: #FFC220 !important; }

/* =========================================================
   STRENGTH BAR
========================================================= */
.strength-bar-container {
  display: flex;
  align-items: center;
  gap: 10px;
}
.strength-bar {
  flex: 1;
  height: 4px;
  background: #1F2937;
  border-radius: 4px;
  overflow: hidden;
}
.strength-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease, background 0.4s ease;
}
.strength-weak   { background: #EF4444; color: #EF4444; }
.strength-fair   { background: #F59E0B; color: #F59E0B; }
.strength-good   { background: #3B82F6; color: #3B82F6; }
.strength-strong { background: #4ADE80; color: #4ADE80; }
.strength-label  { font-size: 0.72rem; font-weight: 600; min-width: 48px; }

/* =========================================================
   SAVE BTN
========================================================= */
.save-btn {
  background: linear-gradient(135deg, #FFC220, #F5B300) !important;
  color: #1A1A1A !important;
  font-weight: 700 !important;
  font-size: 0.88rem !important;
  letter-spacing: 0.3px !important;
  border-radius: 12px !important;
  height: 48px !important;
  border: none !important;
  box-shadow: 0 4px 16px rgba(255,194,32,0.3) !important;
  transition: all 0.25s ease !important;
}
.save-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 6px 20px rgba(255,194,32,0.45) !important;
}
.save-btn:active { transform: translateY(0) !important; }

/* =========================================================
   SAVED CARDS
========================================================= */
.saved-card-item {
  background: #0A1020;
  border: 1px solid #1F2937;
  border-radius: 14px;
  padding: 12px 14px;
  transition: border-color 0.2s;
}
.saved-card-item:hover { border-color: rgba(255,194,32,0.25); }

.card-brand-icon {
  width: 44px; height: 28px;
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 0.65rem;
}
.card-brand-icon.visa       { background: #1A1F71; color: #FFF; }
.card-brand-icon.mastercard { background: #EB001B; color: #FFF; }
.card-brand-icon.amex       { background: #007BC1; color: #FFF; }
.card-brand-icon.default    { background: #1F2937; color: #9CA3AF; }

.card-number-masked { color: #E5E7EB; font-size: 0.85rem; font-family: monospace; letter-spacing: 1px; }
.card-expiry        { color: #6B7280; font-size: 0.72rem; }

.default-badge { background: rgba(255,194,32,0.15) !important; color: #FFC220 !important; font-size: 0.68rem !important; }
.delete-card-btn { color: #4B5563 !important; }
.delete-card-btn:hover { color: #EF4444 !important; }

/* =========================================================
   CREDIT CARD PREVIEW (3D FLIP)
========================================================= */
.card-preview {
  perspective: 1000px;
  height: 180px;
}

.credit-card {
  width: 100%; height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 18px;
}
.credit-card.card-flipped { transform: rotateY(180deg); }

.card-face {
  position: absolute;
  inset: 0;
  border-radius: 18px;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  padding: 18px 22px;
  overflow: hidden;
}

.card-front {
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 40%, #0F172A 100%);
  border: 1px solid rgba(255,194,32,0.25);
  box-shadow: 0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06);
}
.card-front::before {
  content: '';
  position: absolute;
  top: -40px; right: -40px;
  width: 200px; height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,194,32,0.08) 0%, transparent 60%);
}

.card-back {
  background: linear-gradient(135deg, #1E293B, #0F172A);
  border: 1px solid rgba(255,194,32,0.15);
  transform: rotateY(180deg);
}

.card-chip {
  width: 38px; height: 28px;
  background: linear-gradient(135deg, #FFC220, #F5B300);
  border-radius: 5px;
  margin-bottom: 14px;
  box-shadow: 0 2px 6px rgba(255,194,32,0.4);
  position: relative;
}
.card-chip::before {
  content: '';
  position: absolute;
  inset: 5px;
  border: 1px solid rgba(0,0,0,0.3);
  border-radius: 2px;
}

.card-number-display {
  color: #E5E7EB;
  font-family: 'Courier New', monospace;
  font-size: 1.05rem;
  letter-spacing: 3px;
  margin-bottom: 14px;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
}

.card-label-small { color: #6B7280; font-size: 0.6rem; text-transform: uppercase; letter-spacing: 1px; }
.card-holder-display { color: #FFFFFF; font-size: 0.78rem; font-weight: 600; letter-spacing: 1px; margin-top: 2px; max-width: 160px; overflow: hidden; white-space: nowrap; }
.card-expiry-display { color: #FFFFFF; font-size: 0.78rem; font-weight: 600; margin-top: 2px; }

.card-brand-watermark {
  position: absolute;
  bottom: 16px; right: 22px;
  color: rgba(255,194,32,0.35);
  font-size: 1.1rem;
  font-weight: 900;
  letter-spacing: 2px;
}

/* BACK */
.card-stripe {
  position: absolute;
  top: 40px; left: 0; right: 0;
  height: 40px;
  background: #000;
}
.card-cvv-area {
  position: absolute;
  top: 100px; left: 0; right: 0;
}
.cvv-box {
  background: #E5E7EB;
  border-radius: 4px;
  padding: 6px 14px;
  display: flex; flex-direction: column; align-items: center;
}
.cvv-label { color: #374151; font-size: 0.6rem; font-weight: 700; text-transform: uppercase; }
.cvv-value { color: #111827; font-family: monospace; font-weight: 700; font-size: 1rem; letter-spacing: 4px; }

/* CARD FORM TWEAKS */
.card-form { }

.brand-detector {
  display: flex; align-items: center;
}
.brand-chip {
  background: rgba(255,194,32,0.15);
  color: #FFC220;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 1px;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid rgba(255,194,32,0.3);
}

.card-number-input { letter-spacing: 2px; font-family: monospace; }

/* =========================================================
   DEFAULT TOGGLE ROW
========================================================= */
.default-toggle-row {
  background: #0A1020;
  border: 1px solid #1F2937;
  border-radius: 12px;
  padding: 12px 14px;
}
.default-toggle-label { color: #E5E7EB; font-size: 0.85rem; font-weight: 500; }
.default-toggle-hint  { color: #4B5563; font-size: 0.72rem; }

/* =========================================================
   SECURITY NOTICE
========================================================= */
.security-notice {
  background: rgba(74,222,128,0.05);
  border: 1px solid rgba(74,222,128,0.15);
  border-radius: 10px;
  padding: 10px 14px;
}
.security-icon { color: #4ADE80 !important; font-size: 16px; }
.security-text { color: #6B7280; font-size: 0.72rem; line-height: 1.4; }

/* =========================================================
   BETA BADGE
========================================================= */
.beta-badge {
  background: rgba(99,102,241,0.2) !important;
  color: #818CF8 !important;
  font-size: 0.6rem !important;
  letter-spacing: 0.5px !important;
  border: 1px solid rgba(99,102,241,0.3) !important;
}

/* =========================================================
   DANGER ZONE
========================================================= */
.danger-card {
  border-color: rgba(239,68,68,0.2) !important;
  background: linear-gradient(145deg, #150d0d, #0D0A0A) !important;
}
.danger-card:hover { border-color: rgba(239,68,68,0.4) !important; }

.danger-title { color: #F87171; font-weight: 600; font-size: 0.88rem; }
.danger-sub   { color: #6B7280; font-size: 0.75rem; }

.danger-btn {
  color: #EF4444 !important;
  border: 1px solid rgba(239,68,68,0.3) !important;
  border-radius: 10px !important;
  font-size: 0.8rem !important;
  font-weight: 600 !important;
  transition: all 0.2s !important;
}
.danger-btn:hover {
  background: rgba(239,68,68,0.1) !important;
  border-color: #EF4444 !important;
}
</style>