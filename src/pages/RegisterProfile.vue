<template>
  <q-page class="register-page flex flex-center">

    <div class="register-wrapper">

      <!-- Decorative top accent -->
      <div class="gold-bar" />

      <div class="register-inner q-pa-xl">

        <!-- Header -->
        <div class="header-block q-mb-lg">
          <div class="step-chip">Paso único</div>
          <h4 class="title">Completa tu perfil</h4>
          <p class="subtitle">Solo necesitas hacerlo una vez para acceder a todos los eventos</p>
        </div>

        <q-form @submit="submit" class="form-stack">

          <!-- Name -->
          <div class="field-group">
            <label class="field-label">Nombres y Apellidos <span class="req">*</span></label>
            <q-input
              v-model="form.name"
              placeholder="ej. María García López"
              outlined
              dense
              color="amber"
              bg-color="surface"
              input-class="field-input"
              class="custom-input"
            >
              <template #prepend>
                <q-icon name="person_outline" color="amber-6" size="18px" />
              </template>
            </q-input>
          </div>

          <!-- Email -->
          <div class="field-group">
            <label class="field-label">Correo electrónico <span class="req">*</span></label>
            <q-input
              v-model="form.email"
              type="email"
              placeholder="tu@correo.com"
              outlined
              dense
              color="amber"
              bg-color="surface"
              input-class="field-input"
              class="custom-input"
            >
              <template #prepend>
                <q-icon name="mail_outline" color="amber-6" size="18px" />
              </template>
            </q-input>
          </div>

          <!-- Row: Birth date + Gender -->
          <div class="two-col">
            <div class="field-group">
              <label class="field-label">Fecha de nacimiento <span class="req">*</span></label>
              <q-input
                v-model="form.birth_date"
                type="date"
                outlined
                dense
                color="amber"
                bg-color="surface"
                input-class="field-input"
                class="custom-input"
              >
                <template #prepend>
                  <q-icon name="cake" color="amber-6" size="18px" />
                </template>
              </q-input>
            </div>

            <div class="field-group">
              <label class="field-label">Género <span class="req">*</span></label>
              <q-select
                v-model="form.gender"
                :options="genderOptions"
                option-label="label"
                option-value="value"
                emit-value
                map-options
                outlined
                dense
                color="amber"
                bg-color="surface"
                class="custom-input"
                popup-content-class="gender-popup"
              >
                <template #prepend>
                  <q-icon name="wc" color="amber-6" size="18px" />
                </template>
                <template #selected-item="scope">
                  <span class="field-input">{{ scope.opt.label || 'Seleccionar' }}</span>
                </template>
              </q-select>
            </div>
          </div>

          <!-- Instagram (optional) -->
          <div class="field-group">
            <label class="field-label">
              Instagram
              <span class="optional-tag">opcional</span>
            </label>
            <q-input
              v-model="form.instagram"
              placeholder="@tu_usuario"
              outlined
              dense
              color="amber"
              bg-color="surface"
              input-class="field-input"
              class="custom-input"
            >
            </q-input>
          </div>

          <!-- Divider -->
          <div class="divider" />

          <!-- Submit -->
          <q-btn
            label="Guardar y continuar"
            unelevated
            size="md"
            class="btn-submit"
            type="submit"
            :loading="loading"
            no-caps
          >
            <template #loading>
              <q-spinner-dots color="dark" size="20px" />
            </template>
            <q-icon name="arrow_forward" size="18px" class="q-ml-sm" />
          </q-btn>

          <p class="privacy-note">
            <q-icon name="lock_outline" size="13px" class="q-mr-xs" />
            Tu información está segura y no se comparte con terceros
          </p>

        </q-form>

      </div>

    </div>

  </q-page>
</template>


<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const $q = useQuasar()
const loading = ref(false)

const genderOptions = [
  { label: 'Hombre', value: 'Hombre' },
  { label: 'Mujer', value: 'Mujer' },
]

const form = ref({
  name: '',
  email: '',
  birth_date: '',
  gender: '',
  instagram: ''
})

const submit = async () => {
  if (!form.value.name || !form.value.email || !form.value.birth_date || !form.value.gender) {
    $q.notify({
      message: 'Completa todos los campos obligatorios',
      color: 'negative',
      icon: 'warning',
      position: 'top',
      timeout: 2500
    })
    return
  }

  loading.value = true

  try {
    await api.post('/auth/register-profile', form.value, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })

    $q.notify({
      message: '¡Perfil guardado correctamente!',
      color: 'positive',
      icon: 'check_circle',
      position: 'top',
      timeout: 1500
    })

    setTimeout(() => window.location.replace('/'), 1500)

  } catch {
    $q.notify({
      message: 'Error al guardar el perfil. Intenta de nuevo.',
      color: 'negative',
      icon: 'error_outline',
      position: 'top',
      timeout: 3000
    })
  } finally {
    loading.value = false
  }
}
</script>


<style scoped>
/* ─── Page ─────────────────────────────────────────── */
.register-page {
  min-height: 100vh;
  background: #020617;
  background-image:
    radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201, 162, 77, 0.08) 0%, transparent 70%),
    radial-gradient(ellipse 40% 30% at 80% 100%, rgba(15, 23, 42, 0.8) 0%, transparent 60%);
  padding: 24px 16px;
}

/* ─── Card wrapper ──────────────────────────────────── */
.register-wrapper {
  width: 100%;
  max-width: 460px;
  background: #0f172a;
  border-radius: 24px;
  border: 1px solid rgba(201, 162, 77, 0.15);
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.03),
    0 32px 64px rgba(0, 0, 0, 0.5),
    0 8px 24px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  position: relative;
}

/* ─── Gold top accent ───────────────────────────────── */
.gold-bar {
  height: 3px;
  background: linear-gradient(90deg, transparent 0%, #C9A24D 30%, #FFC220 60%, #C9A24D 80%, transparent 100%);
}

.register-inner {
  padding: 32px 32px 28px;
}

/* ─── Header ────────────────────────────────────────── */
.header-block {
  margin-bottom: 28px;
}

.step-chip {
  display: inline-flex;
  align-items: center;
  background: rgba(201, 162, 77, 0.12);
  border: 1px solid rgba(201, 162, 77, 0.3);
  color: #C9A24D;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-radius: 20px;
  padding: 4px 12px;
  margin-bottom: 14px;
}

.title {
  color: #f8fafc;
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 8px;
  line-height: 1.2;
}

.subtitle {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.5;
}

/* ─── Form ──────────────────────────────────────────── */
.form-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* ─── Field group ───────────────────────────────────── */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #94a3b8;
}

.req {
  color: #C9A24D;
  margin-left: 2px;
}

.optional-tag {
  font-size: 10px;
  font-weight: 500;
  color: #475569;
  text-transform: lowercase;
  letter-spacing: 0;
  margin-left: 6px;
  background: rgba(71, 85, 105, 0.2);
  padding: 1px 7px;
  border-radius: 10px;
}

/* ─── Quasar input overrides ────────────────────────── */
.custom-input :deep(.q-field__control) {
  background: #1e293b !important;
  border-radius: 10px !important;
  border: 1px solid rgba(255, 255, 255, 0.07) !important;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.custom-input :deep(.q-field__control:hover) {
  border-color: rgba(201, 162, 77, 0.3) !important;
}

.custom-input :deep(.q-field--focused .q-field__control) {
  border-color: rgba(201, 162, 77, 0.6) !important;
  box-shadow: 0 0 0 3px rgba(201, 162, 77, 0.1) !important;
}

.custom-input :deep(.q-field__native),
.custom-input :deep(.q-field__input),
.field-input {
  color: #e2e8f0 !important;
  font-size: 14px !important;
}

.custom-input :deep(.q-field__native::placeholder) {
  color: #475569 !important;
}

/* Date input native color */
.custom-input :deep(input[type="date"]) {
  color-scheme: dark;
}

/* ─── Divider ───────────────────────────────────────── */
.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.05);
  margin: 4px 0;
}

/* ─── Submit button ─────────────────────────────────── */
.btn-submit {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, #C9A24D 0%, #FFC220 50%, #C9A24D 100%) !important;
  background-size: 200% 100% !important;
  color: #020617 !important;
  font-weight: 800 !important;
  font-size: 0.95rem !important;
  letter-spacing: 0.01em;
  border-radius: 12px !important;
  border: none !important;
  transition: all 0.3s ease !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-submit:hover {
  background-position: right center !important;
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(201, 162, 77, 0.35) !important;
}

.btn-submit:active {
  transform: translateY(0px);
}

/* ─── Privacy note ──────────────────────────────────── */
.privacy-note {
  text-align: center;
  font-size: 11.5px;
  color: #475569;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

/* ─── Gender popup dark ─────────────────────────────── */
:global(.gender-popup) {
  background: #1e293b !important;
  border: 1px solid rgba(201, 162, 77, 0.2) !important;
  border-radius: 12px !important;
}

:global(.gender-popup .q-item) {
  color: #e2e8f0 !important;
  font-size: 14px !important;
}

:global(.gender-popup .q-item:hover) {
  background: rgba(201, 162, 77, 0.08) !important;
}

/* ─── Mobile ────────────────────────────────────────── */
@media (max-width: 480px) {
  .register-inner {
    padding: 24px 20px 20px;
  }

  .two-col {
    grid-template-columns: 1fr;
  }

  .title {
    font-size: 1.35rem;
  }
}
</style>