<template>
  <q-page class="scan-page">

    <div class="header">
      <q-btn flat round icon="arrow_back" color="white" @click="$router.back()" />
      <div class="title">Validar Ticket</div>
    </div>

    <!-- SCAN -->
    <qrcode-stream @decode="onDecode" />

    <!-- RESULT -->
    <div v-if="result" class="result" :class="result.type">
      {{ result.message }}
    </div>

  </q-page>
</template>
<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { QrcodeStream } from 'vue-qrcode-reader'

const result = ref(null)
let locked = false

const onDecode = async (code) => {
  if (locked) return
  locked = true

  try {
    const res = await axios.post(
      'http://127.0.0.1:8000/api/auth/tickets/validate',
      { code },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )

    console.log(res)
    result.value = {
      type: 'success',
      message: '✔ Ticket válido'
    }

  } catch (error) {
    result.value = {
      type: 'error',
      message: error.response?.data?.message || 'Error'
    }
  }

  setTimeout(() => {
    result.value = null
    locked = false
  }, 3000)
}
</script>
<style scoped>

.scan-page {
  background: black;
  color: white;
}

.header {
  display: flex;
  align-items: center;
  padding: 10px;
}

.title {
  margin-left: 10px;
  font-weight: 900;
}

.result {
  position: fixed;
  bottom: 20px;
  left: 20px;
  right: 20px;
  padding: 16px;
  text-align: center;
  font-weight: 900;
  border-radius: 12px;
}

.result.success {
  background: #16a34a;
}

.result.error {
  background: #dc2626;
}
</style>