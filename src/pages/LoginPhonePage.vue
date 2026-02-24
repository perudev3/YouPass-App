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
        Digita tu<br />número telefónico
      </h5>

      <p class="subtitle">
        Te enviaremos un código para verificar que realmente eres tú.
      </p>

      <!-- PHONE INPUT PRO -->
      <div class="phone-input-row">

        <!-- SELECT PAÍS -->
        <q-select
          v-model="selectedCountry"
          :options="countries"
          option-label="label"
          dense
          borderless
          class="country-select"
        >
          <!-- OPCIÓN -->
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

          <!-- SELECCIONADO -->
          <template v-slot:selected>
            <div class="row items-center no-wrap">
              <span class="flag q-mr-xs">
                {{ selectedCountry.flag }}
              </span>
              +{{ selectedCountry.code }}
            </div>
          </template>
        </q-select>

        <!-- NÚMERO -->
        <div class="phone-display">
          {{ formattedPhone || '9 5558 4205' }}
        </div>

      </div>


    </div>

    <!-- KEYPAD -->
    <div class="keypad">

      <div
          v-for="(key, index) in keys"
          :key="index"
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
import { api } from 'boot/axios' 
import { useRouter } from 'vue-router'

const router = useRouter()

const phone = ref('')

const countries = [
  { name: 'Chile', code: '56', flag: '🇨🇱', label: 'Chile' },
  { name: 'Perú', code: '51', flag: '🇵🇪', label: 'Perú' },
  { name: 'México', code: '52', flag: '🇲🇽', label: 'México' },
  { name: 'Colombia', code: '57', flag: '🇨🇴', label: 'Colombia' },
  { name: 'Argentina', code: '54', flag: '🇦🇷', label: 'Argentina' },
  { name: 'España', code: '34', flag: '🇪🇸', label: 'España' },
]

const selectedCountry = ref(countries[0])

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

const fullPhone = selectedCountry.value.code + phone.value
  try {
    await api.post('/auth/send-otp', {
      phone: fullPhone
    })
  } catch (error) {
  alert("ERROR COMPLETO:", error)

  if (error.response) {
    alert(
      "STATUS: " + error.response.status +
      "\nDATA: " + JSON.stringify(error.response.data)
    )
  } else {
    alert("ERROR SIN RESPONSE: " + error.message)
  }

  return
}

  // navegación fuera del try/catch
  router.push({
    name: 'verify-otp',
    query: { phone: fullPhone }
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


.phone-input-row {
  display: flex;
  align-items: center;
  background: #0f172a;
  border-radius: 16px;
  padding: 12px 14px;
  gap: 10px;
}

/* SELECT */
.country-select {
  min-width: 95px;
  border-right: 1px solid #1e293b;
  padding-right: 8px;
}

/* BANDERA */
.flag {
  font-size: 18px;
}

/* NÚMERO */
.phone-display {
  font-size: 1.9rem;
  letter-spacing: 2px;
  flex: 1;
}


</style>
