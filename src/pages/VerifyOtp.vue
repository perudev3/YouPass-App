<template>
  <q-page class="otp-page">

    <!-- HEADER ZONE -->
    <div class="zone-header">

      <button class="back-btn" @click="$router.back()">
        <q-icon name="arrow_back" size="18px" />
      </button>

      <p class="eyebrow">Verificación</p>
      <h1 class="title">Código de<br /><span class="accent">verificación</span></h1>
      <p class="subtitle">
        Enviamos un SMS al número<br />
        <span class="phone-highlight">+{{ phone }}</span>
      </p>

      <!-- OTP DISPLAY -->
      <div class="otp-card">
        <div class="otp-slots">
          <div v-for="n in 6" :key="n" class="otp-slot" :class="{
            'otp-slot--filled': otp.length >= n,
            'otp-slot--active': otp.length === n - 1
          }">
            <span v-if="otp[n - 1]">{{ otp[n - 1] }}</span>
            <span v-else class="dot">·</span>
          </div>
        </div>
      </div>

    </div>

    <!-- KEYPAD ZONE -->
    <div class="zone-keypad">

      <div class="keypad">
        <button v-for="(key, i) in keys" :key="i" class="key"
          :class="{ 'key--ghost': key === '', 'key--del': key === 'del' }" @click="pressKey(key)">
          <q-icon v-if="key === 'del'" name="backspace" size="21px" />
          <span v-else-if="key">{{ key }}</span>
        </button>
      </div>

      <button class="btn-next" :class="{ 'btn-next--on': otp.length === 6 }" :disabled="loading || otp.length !== 6"
        @click="verify">
        <q-spinner v-if="loading" size="18px" color="dark" :thickness="3" />
        <template v-else>
          <span>Verificar</span>
          <q-icon name="arrow_forward" size="16px" />
        </template>
      </button>

    </div>

  </q-page>
</template>


<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from 'boot/axios'
import { Preferences } from '@capacitor/preferences'

const route = useRoute()
const router = useRouter()

const phone = route.query.phone
const otp = ref('')
const loading = ref(false)

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']

const pressKey = (key) => {
  if (key === 'del') { otp.value = otp.value.slice(0, -1); return }
  if (!key || otp.value.length >= 6) return
  otp.value += key
}

const verify = async () => {
  if (otp.value.length !== 6) { alert('Código inválido'); return }
  if (loading.value) return   // ← guard extra

  loading.value = true

  try {
    const res = await api.post('/auth/verify-otp', { phone, code: otp.value })

    if (res.data.token) {
      await Preferences.set({
        key: 'token',
        value: res.data.token
      })

      await Preferences.set({
        key: 'user',
        value: JSON.stringify(res.data.user)
      })
      window.dispatchEvent(new Event('auth-changed'))
    }

    if (res.data.needs_profile) {
      router.push('/register-profile')
    } else {
      router.replace('/home')
    }

  } catch (e) {
    alert('Error: ' + (e?.response?.status || e?.message || JSON.stringify(e)))
    loading.value = false
  }
}
</script>


<style scoped>
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PAGE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.otp-page {
  background: #020617;
  color: #f1f5f9;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  -webkit-tap-highlight-color: transparent;
  font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ZONE HEADER
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.zone-header {
  padding: clamp(16px, 5vw, 28px) clamp(20px, 6vw, 32px) clamp(12px, 3vw, 20px);
  padding-top: max(clamp(16px, 5vw, 28px), env(safe-area-inset-top));
  padding-left: max(clamp(20px, 6vw, 32px), env(safe-area-inset-left));
  padding-right: max(clamp(20px, 6vw, 32px), env(safe-area-inset-right));
  flex-shrink: 0;
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
  margin-bottom: clamp(16px, 4vw, 28px);
  transition: background 0.15s, transform 0.1s;
}

.back-btn:active {
  background: #1e293b;
  transform: scale(0.92);
}

/* EYEBROW */
.eyebrow {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: #C9A24D;
  margin: 0 0 10px;
}

/* TITLE */
.title {
  font-size: clamp(1.6rem, 7vw, 2.2rem);
  font-weight: 800;
  line-height: 1.18;
  letter-spacing: -0.03em;
  margin: 0 0 8px;
  color: #f8fafc;
}

.accent {
  color: #C9A24D;
}

/* SUBTITLE */
.subtitle {
  font-size: clamp(0.78rem, 3.2vw, 0.875rem);
  color: #64748b;
  margin: 0 0 clamp(14px, 4vw, 22px);
  line-height: 1.6;
}

.phone-highlight {
  color: #e2e8f0;
  font-weight: 600;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   OTP CARD — 6 slots individuales
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.otp-card {
  background: #0b1220;
  border: 1px solid #1e293b;
  border-radius: 16px;
  padding: clamp(14px, 3.5vw, 20px) clamp(14px, 4vw, 20px);
}

.otp-slots {
  display: flex;
  gap: clamp(7px, 2.5vw, 12px);
  justify-content: center;
}

.otp-slot {
  flex: 1;
  max-width: 48px;
  aspect-ratio: 1 / 1.1;
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(1.1rem, 5vw, 1.5rem);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: #f1f5f9;
  transition: border-color 0.2s, background 0.2s;
}

.otp-slot--filled {
  border-color: #C9A24D;
  background: rgba(201, 162, 77, 0.07);
}

/* slot activo = el siguiente a llenar */
.otp-slot--active {
  border-color: #C9A24D;
  box-shadow: 0 0 0 3px rgba(201, 162, 77, 0.15);
}

.dot {
  color: #1e293b;
  font-size: 1.4rem;
  line-height: 1;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ZONE KEYPAD
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.zone-keypad {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: clamp(10px, 2.5vw, 18px) clamp(20px, 6vw, 32px) 0;
  padding-left: max(clamp(20px, 6vw, 32px), env(safe-area-inset-left));
  padding-right: max(clamp(20px, 6vw, 32px), env(safe-area-inset-right));
  gap: clamp(10px, 2.5vw, 14px);
  justify-content: flex-end;
}

/* KEYPAD GRID */
.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(4, clamp(52px, 11vw, 72px));
  gap: clamp(8px, 2vw, 12px);
}

/* KEY */
.key {
  background: #0d1526;
  border: 1px solid #1a2540;
  border-radius: clamp(12px, 3vw, 16px);
  color: #e2e8f0;
  font-size: clamp(1.1rem, 5vw, 1.45rem);
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
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

.key--del {
  color: #475569;
}

.key--del:active {
  color: #f1f5f9;
  background: #1e293b;
  transform: scale(0.91);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BTN VERIFICAR
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
.btn-next {
  width: 100%;
  height: 52px;
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
  margin-bottom: clamp(10px, 3vw, 18px);
  transition: background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.1s;
}

.btn-next--on {
  background: #C9A24D;
  color: #020617;
  border-color: transparent;
  box-shadow: 0 4px 22px rgba(201, 162, 77, 0.30);
}

.btn-next--on:active {
  transform: scale(0.97);
  box-shadow: 0 2px 10px rgba(201, 162, 77, 0.15);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LANDSCAPE COMPACTO
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
@media (orientation: landscape) and (max-height: 500px) {

  .eyebrow,
  .subtitle {
    display: none;
  }

  .title {
    font-size: 1.2rem;
    margin-bottom: 6px;
  }

  .zone-header {
    padding-top: 10px;
    padding-bottom: 8px;
  }

  .otp-card {
    padding: 10px 14px;
  }

  .keypad {
    grid-template-rows: repeat(4, clamp(40px, 9vw, 52px));
    gap: 6px;
  }

  .btn-next {
    height: 44px;
    margin-bottom: 6px;
  }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TABLET / DESKTOP
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
@media (min-width: 520px) {
  .otp-page {
    max-width: 420px;
    margin: 0 auto;
  }
}

.btn-next:disabled {
  pointer-events: none;
  opacity: 0.85;   /* leve para que se note que está procesando */
}
</style>