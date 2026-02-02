<template>
  <q-page class="login-page flex column justify-between">

    <!-- CONTENIDO -->
    <div class="q-pa-lg">

      <div class="back-btn">
        <q-icon
            name="arrow_back"
            size="24px"
            @click="$router.back()"
        />
      </div>

      <h5 class="title">
        ¿Puedes darnos tu<br />número telefónico?
      </h5>

      <p class="subtitle">
        Te vamos a enviar un código para verificar que realmente eres tú.
      </p>

      <!-- PAÍS -->
      <div class="country">
        CL +56
      </div>

      <!-- INPUT VISUAL -->
      <div class="phone-display">
        {{ formattedPhone || '9 5558 4205' }}
      </div>

    </div>

    <!-- KEYPAD -->
    <div class="keypad">

      <div
        v-for="key in keys"
        :key="key"
        class="key"
        @click="pressKey(key)"
      >
        <span v-if="key !== 'del'">{{ key }}</span>
        <q-icon v-else name="backspace" size="22px" />
      </div>

      <q-btn
        class="btn-next"
        label="Siguiente"
        unelevated
        rounded
        @click="submit"
      />

    </div>

  </q-page>
</template>


<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const phone = ref('')

const keys = [
  '1','2','3',
  '4','5','6',
  '7','8','9',
  '','0','del'
]

const pressKey = (key) => {
  if (key === 'del') {
    phone.value = phone.value.slice(0, -1)
    return
  }
  if (!key) return
  if (phone.value.length >= 9) return

  phone.value += key
}

const formattedPhone = computed(() => {
  return phone.value.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1 ')
})

const submit = async () => {
  if (phone.value.length < 9) {
    alert('Ingresa un número válido')
    return
  }

  try {
    await axios.post('http://127.0.0.1:8000/api/auth/send-otp', {
      phone: phone.value
    })
  } catch (error) {
    console.error(error)
    alert('No se pudo enviar el código')
    return
  }

  // navegación fuera del try/catch
  router.push({
    name: 'verify-otp',
    query: { phone: phone.value }
  })
}

</script>


<style scoped>
.login-page {
  background: #020617;
  color: white;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ---------- CONTENIDO SUPERIOR ---------- */
.q-pa-lg {
  flex-shrink: 0;
}

.back-btn {
  margin-bottom: 16px;
}

.title {
  font-weight: 800;
  line-height: 1.25;
}

.subtitle {
  color: #94a3b8;
  font-size: 0.85rem;
  margin: 10px 0 16px;
}

.country {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-bottom: 6px;
}

.phone-display {
  font-size: 1.9rem;
  letter-spacing: 2px;
}

/* ---------- KEYPAD ---------- */
.keypad {
  flex: 1;
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(4, 1fr) auto;
  gap: 14px;
}

/* TECLAS */
.key {
  background: #0f172a;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  user-select: none;
}

/* BOTÓN */
.btn-next {
  grid-column: span 3;
  height: 48px;
  background: white;
  color: black;
  font-weight: 700;
}

.key:active {
  background: #1e293b;
  transform: scale(0.96);
}

</style>
