<template>
  <div class="welcome">

    <div class="logo-box">
      <img src="/logo.png" class="logo" />
    </div>

    <div class="buttons">
      <q-btn
        label="INICIAR SESIÓN"
        class="btn-login"
        unelevated
        @click="goLogin"
      />

      <q-btn
        label="REGISTRARSE"
        outline
        class="btn-register"
        @click="goRegister"
      />
    </div>

  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goLogin = () => {
  router.push('/login-phone')
}

const goRegister = () => {
  router.push('/login-phone')
}
</script>

<style scoped>
.welcome {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px 20px;
  background: #000; /* color app */
}

.logo-box {
  display: flex;
  justify-content: center;
  margin-top: 80px;
}

.logo {
  width: 180px;
}

.buttons {
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.btn-login {
  background: #ff0040;
  color: white;
  height: 50px;
  font-weight: bold;
  border-radius: 10px;
}

.btn-register {
  height: 50px;
  color: white;
  border: 1px solid white;
  border-radius: 10px;
}
</style>
