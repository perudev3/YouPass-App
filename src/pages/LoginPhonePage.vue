<template>
  <q-page class="login-page">

    <!-- HEADER ZONE -->
    <div class="zone-header">

      <button class="back-btn" @click="$router.back()">
        <q-icon name="arrow_back" size="18px" />
      </button>

      <p class="eyebrow">Verificación · Paso 1 de 2</p>
      <h1 class="title">Tu número<br /><span class="accent">de celular</span></h1>
      <p class="subtitle">Te enviaremos un código para confirmar que eres tú.</p>

      <!-- PHONE INPUT -->
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

        <div class="phone-display">
          <span v-if="!phone" class="ph-placeholder">_ _ _  _ _ _  _ _ _</span>
          <span v-else class="ph-value">{{ formattedPhone }}</span>
        </div>
      </div>

    </div>

    <!-- KEYPAD ZONE -->
    <div class="zone-keypad">

      <div class="keypad">
        <button
          v-for="(key, i) in keys"
          :key="i"
          class="key"
          :class="{ 'key--ghost': key === '', 'key--del': key === 'del' }"
          @click="pressKey(key)"
        >
          <q-icon v-if="key === 'del'" name="backspace" size="21px" />
          <span v-else-if="key">{{ key }}</span>
        </button>
      </div>

      <button
        class="btn-next"
        :class="{ 'btn-next--on': phone.length >= 9 }"
        @click="submit"
      >
        <span>Siguiente</span>
        <q-icon name="arrow_forward" size="16px" />
      </button>

    </div>

  </q-page>
</template>


<script setup>
import { ref, computed } from 'vue'
import { api } from 'boot/axios'
import { useRouter } from 'vue-router'

const router  = useRouter()
const phone   = ref('')

const countries = [
  { name: 'Chile',     code: '56', flag: '🇨🇱', label: 'Chile' },
  { name: 'Perú',      code: '51', flag: '🇵🇪', label: 'Perú' },
  { name: 'México',    code: '52', flag: '🇲🇽', label: 'México' },
  { name: 'Colombia',  code: '57', flag: '🇨🇴', label: 'Colombia' },
  { name: 'Argentina', code: '54', flag: '🇦🇷', label: 'Argentina' },
  { name: 'España',    code: '34', flag: '🇪🇸', label: 'España' },
]
const selectedCountry = ref(countries[0])

const keys = ['1','2','3','4','5','6','7','8','9','','0','del']

const pressKey = (key) => {
  if (key === 'del') { phone.value = phone.value.slice(0, -1); return }
  if (!key || phone.value.length >= 9) return
  phone.value += key
}

const formattedPhone = computed(() =>
  phone.value.replace(/(\d{3})(\d{0,3})(\d{0,3})/, (_, a, b, c) =>
    [a, b, c].filter(Boolean).join(' ')
  )
)

const submit = async () => {
  if (phone.value.length < 9) { alert('Ingresa un número válido'); return }
  const fullPhone = selectedCountry.value.code + phone.value
  try {
    await api.post('/auth/send-otp', { phone: fullPhone })
  } catch (err) {
    alert(err.response
      ? `STATUS: ${err.response.status}\nDATA: ${JSON.stringify(err.response.data)}`
      : `ERROR: ${err.message}`)
    return
  }
  router.push({ name: 'verify-otp', query: { phone: fullPhone } })
}
</script>


<style scoped>
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   RESET & PAGE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.login-page {
  background: #020617;
  color: #f1f5f9;

  /* ✅ Ocupa exactamente la altura del viewport disponible */
  min-height: 100%;
  display: flex;
  flex-direction: column;

  /* ✅ Safe-area inferior gestionada aquí una sola vez */
  padding-bottom: max(16px, env(safe-area-inset-bottom));

  -webkit-tap-highlight-color: transparent;
  font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ZONE HEADER
   ✅ flex-shrink: 1 → cede espacio en pantallas pequeñas
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.zone-header {
  flex-shrink: 0;           /* No colapsa — tiene contenido mínimo necesario */
  padding: clamp(12px, 4vw, 24px) clamp(20px, 6vw, 32px) clamp(10px, 2.5vw, 18px);
  padding-top: max(clamp(12px, 4vw, 24px), env(safe-area-inset-top));
  padding-left: max(clamp(20px, 6vw, 32px), env(safe-area-inset-left));
  padding-right: max(clamp(20px, 6vw, 32px), env(safe-area-inset-right));
}

/* BACK */
.back-btn {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: #0f172a;
  border: 1px solid #1e293b;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-bottom: clamp(12px, 3vw, 22px);
  transition: background 0.15s, transform 0.1s;
}
.back-btn:active { background: #1e293b; transform: scale(0.92); }

/* EYEBROW */
.eyebrow {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: #C9A24D;
  margin: 0 0 8px;
}

/* TITLE */
.title {
  font-size: clamp(1.5rem, 6.5vw, 2.1rem);
  font-weight: 800;
  line-height: 1.18;
  letter-spacing: -0.03em;
  margin: 0 0 6px;
  color: #f8fafc;
}
.accent { color: #C9A24D; }

/* SUBTITLE */
.subtitle {
  font-size: clamp(0.75rem, 3vw, 0.875rem);
  color: #64748b;
  margin: 0 0 clamp(10px, 3vw, 18px);
  line-height: 1.5;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PHONE CARD
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.phone-card {
  display: flex;
  align-items: center;
  background: #0b1220;
  border: 1px solid #1e293b;
  border-radius: 16px;
  padding: clamp(10px, 2.5vw, 15px) clamp(12px, 3.5vw, 18px);
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
  margin: 0 clamp(10px, 3vw, 16px);
  flex-shrink: 0;
}

.phone-display {
  flex: 1;
  font-size: clamp(1.2rem, 5vw, 1.65rem);
  font-weight: 700;
  letter-spacing: 0.1em;
  font-variant-numeric: tabular-nums;
}
.ph-placeholder { color: #2a1f00; }
.ph-value       { color: #f1f5f9; }

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ZONE KEYPAD
   ✅ flex: 1 + flex-direction: column + justify-content: space-between
      → el keypad y el botón llenan TODO el espacio restante
      → sin gaps fijos que causen espacios raros
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.zone-keypad {
  flex: 1;
  display: flex;
  flex-direction: column;
  /* ✅ space-between: keypad arriba, botón pegado abajo */
  justify-content: space-between;

  padding: clamp(8px, 2vw, 16px) clamp(20px, 6vw, 32px) 0;
  padding-left: max(clamp(20px, 6vw, 32px), env(safe-area-inset-left));
  padding-right: max(clamp(20px, 6vw, 32px), env(safe-area-inset-right));
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   KEYPAD GRID
   ✅ grid-auto-rows: 1fr → las 4 filas se reparten
      el alto disponible de forma equitativa
      Sin alturas fijas que puedan exceder la pantalla
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  /* ✅ CAMBIO CLAVE: 1fr en lugar de clamp fijo */
  grid-template-rows: repeat(4, 1fr);
  gap: clamp(6px, 1.8vw, 11px);
  /* ✅ El keypad ocupa el espacio disponible pero con un máximo sensato */
  flex: 1;
  /* Cap para tablets/desktop — en móvil ocupa lo necesario */
  max-height: min(65vh, 380px);
}

/* KEY BASE */
.key {
  background: #0d1526;
  border: 1px solid #1a2540;
  border-radius: clamp(11px, 2.5vw, 15px);
  color: #e2e8f0;
  font-size: clamp(1rem, 4.5vw, 1.4rem);
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  /* ✅ Sin height explícita — la controla el grid */
  min-height: 0;           /* ← necesario para que 1fr funcione en algunos browsers */
  transition: background 0.1s, transform 0.1s;
}
.key:active:not(.key--ghost) {
  background: #1e293b;
  transform: scale(0.91);
}
.key--ghost {
  background: transparent;
  border-color: transparent;
  pointer-events: none;
}
.key--del { color: #475569; }
.key--del:active { color: #f1f5f9; background: #1e293b; transform: scale(0.91); }

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BOTÓN SIGUIENTE
   ✅ margin-bottom: 0 → el padding-bottom del page
      ya maneja la distancia al safe-area/nav bar
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.btn-next {
  width: 100%;
  height: clamp(46px, 10vw, 54px);
  border-radius: 16px;
  border: 1px solid #1e293b;
  background: #0f172a;
  color: #334155;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  flex-shrink: 0;
  /* ✅ margin-bottom maneja la separación del safe-area */
  margin-top: clamp(6px, 1.5vw, 10px);
  margin-bottom: clamp(8px, 2.5vw, 16px);
  transition: background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.1s;
}
.btn-next--on {
  background: #C9A24D;
  color: #020617;
  border-color: transparent;
  box-shadow: 0 4px 22px rgba(201,162,77,0.30);
}
.btn-next--on:active {
  transform: scale(0.97);
  box-shadow: 0 2px 10px rgba(201,162,77,0.15);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   QUASAR DROPDOWN
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
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

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LANDSCAPE — PANTALLAS PEQUEÑAS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
@media (orientation: landscape) and (max-height: 500px) {
  .eyebrow, .subtitle { display: none; }
  .title { font-size: 1.15rem; margin-bottom: 5px; }
  .zone-header { padding-top: 10px; padding-bottom: 6px; }
  .keypad { max-height: 55vh; }
  .btn-next { height: 42px; }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TABLET / DESKTOP — centrado y acotado
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
@media (min-width: 520px) {
  .login-page {
    max-width: 420px;
    margin: 0 auto;
  }
}
</style>