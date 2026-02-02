<template>
  <q-page class="otp-page">


    <!-- CONTENIDO -->
    <div class="q-pa-lg">

      <div class="back-btn" @click="$router.back()">
        <q-icon name="arrow_back" size="24px" />
      </div>

      <h5 class="title">
        Ingresa el código<br />de verificación
      </h5>

      <p class="subtitle">
        Enviamos un código SMS al número<br />
        +56 {{ phone }}
      </p>

        <div class="otp-display">
            {{ otp || '• • • • • •' }}
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
            label="Verificar"
            unelevated
            rounded
            @click="verify"
        />
    </div>


  </q-page>
</template>
<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'


const route = useRoute()
const router = useRouter()


const phone = route.query.phone
const otp = ref('')

const keys = [
  '1','2','3',
  '4','5','6',
  '7','8','9',
  '','0','del'
]

const pressKey = (key) => {
  if (key === 'del') {
    otp.value = otp.value.slice(0, -1)
    return
  }
  if (!key) return
  if (otp.value.length >= 6) return

  otp.value += key
}

const verify = async () => {
  if (otp.value.length !== 6) {
    alert('Código inválido')
    return
  }

  try {
    const res = await axios.post('http://127.0.0.1:8000/api/auth/verify-otp', {
      phone,
      code: otp.value
    })

    // Guardar token
    if (res.data.token) {
      localStorage.setItem('token', res.data.token)

      // 🔥 AVISAR A TODA LA APP
      window.dispatchEvent(new Event('auth-changed'))
    }


    // Usuario nuevo → completar perfil
    if (res.data.needs_profile) {
      router.push('/register-profile')
    } else {
      window.location.replace('/')
    }

  } catch {
    alert('Código incorrecto')
  }
}

</script>


<style scoped>

.otp-page {
  min-height: 100vh;
  background: #020617;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.otp-display {
  font-size: 2rem;
  letter-spacing: 10px;
  margin: 24px 0;
  text-align: center;
}


.keypad {
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

/* BOTONES NUMÉRICOS */
.key {
  height: 64px;
  background: #0f172a;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 600;
  color: white;
  user-select: none;
}

/* EFECTO TAP */
.key:active {
  background: #1e293b;
}

/* BOTÓN SIGUIENTE */
.btn-next {
  grid-column: span 3;
  height: 52px;
  margin-top: 8px;
  background: white;
  color: #020617;
  font-weight: 800;
  border-radius: 14px;
}


</style>