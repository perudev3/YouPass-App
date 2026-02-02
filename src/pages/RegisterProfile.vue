<template>
  <q-page class="register-page flex flex-center">

    <q-card class="register-card">

      <div class="q-pa-lg">

        <h5 class="title">Completa tu perfil</h5>
        <p class="subtitle">Este paso solo se realiza una vez</p>

        <q-form @submit="submit" class="q-gutter-md">

          <q-input
            v-model="form.name"
            label="Nombres y Apellidos"
            outlined
            dense
            color="primary"
            label-color="grey-4"
            input-class="text-white"
          />

          <q-input
            v-model="form.email"
            label="Correo electrónico"
            type="email"
            outlined
            dense
            color="primary"
            label-color="grey-4"
            input-class="text-white"
          />

          <q-input
            v-model="form.birthdate"
            label="Fecha de nacimiento"
            type="date"
            outlined
            dense
            color="primary"
            label-color="grey-4"
            input-class="text-white"
          />

          <q-select
            v-model="form.gender"
            label="Género"
            :options="['Hombre', 'Mujer']"
            outlined
            dense
            color="primary"
            label-color="grey-4"
            options-dark
          />

          <q-input
            v-model="form.instagram"
            label="Instagram"
            prefix="@"
            outlined
            dense
            color="primary"
            label-color="grey-4"
            input-class="text-white"
          />

          <q-btn
            label="Guardar y continuar"
            unelevated
            rounded
            size="lg"
            class="btn-submit"
            type="submit"
            :loading="loading"
          />

        </q-form>

      </div>

    </q-card>

  </q-page>
</template>


<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)

const form = ref({
  name: '',
  email: '',
  birthdate: '',
  gender: '',
  instagram: ''
})

const submit = async () => {
  if (
    !form.value.name ||
    !form.value.email ||
    !form.value.birthdate ||
    !form.value.gender
  ) {
    alert('Completa todos los campos obligatorios')
    return
  }

  loading.value = true

  try {
    await axios.post(
      'http://127.0.0.1:8000/api/auth/register-profile',
      form.value,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )

    router.replace('/home')

  } catch {
    alert('Error al guardar perfil')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: #020617;
}

/* CARD */
.register-card {
  width: 100%;
  max-width: 420px;
  background: #0f172a;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

/* TEXTOS */
.title {
  color: white;
  font-weight: 800;
  margin-bottom: 4px;
}

.subtitle {
  color: #94a3b8;
  font-size: 0.85rem;
  margin-bottom: 24px;
}

/* BOTÓN */
.btn-submit {
  width: 100%;
  margin-top: 12px;
  background: white;
  color: #020617;
  font-weight: 800;
  border-radius: 14px;
}
</style>
