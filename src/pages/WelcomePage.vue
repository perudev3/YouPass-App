<template>
  <div class="welcome">

    <div class="logo-box">
      <img src="/logo-sin-fondo.png" class="logo" />
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

  /* Fondo degradado app eventos */
  background: radial-gradient(
      circle at top,
      #111827,
      #020617 70%
  );

  overflow: hidden;
}

/* CONTENEDOR LOGO */
.logo-box {
  display: flex;
  justify-content: center;
  margin-top: 80px;
  position: relative;
}

/* LOGO */
.logo {
  width: 180px;
  z-index: 2;

  animation: heartbeat 2.2s infinite ease-in-out;

  /* Glow del color del logo */
  filter:
    drop-shadow(0 0 10px rgba(255,194,32,0.45))
    drop-shadow(0 0 20px rgba(255,194,32,0.25));
}

/* ONDA DE LATIDO (círculo atrás) */
.logo-box::before {
  content: "";
  position: absolute;

  width: 200px;
  height: 200px;

  border-radius: 50%;

  background: radial-gradient(
    circle,
    rgba(255,194,32,0.35),
    transparent 70%
  );

  animation: pulseWave 2.2s infinite ease-out;
}

/* BOTONES */
.buttons {
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* LOGIN */
.btn-login {
  background: linear-gradient(
    90deg,
    #FFC220,
    #F5B300
  );

  color: #1A1A1A;
  height: 52px;
  font-weight: 900;
  border-radius: 14px;

  box-shadow:
    0 6px 18px rgba(255,194,32,0.35);
}

/* REGISTER */
.btn-register {
  height: 52px;
  color: white;
  border: 1px solid rgba(255,255,255,0.25);
  border-radius: 14px;

  backdrop-filter: blur(6px);
}

/* =========================
   ANIMACIONES
========================= */

/* Latido logo */
@keyframes heartbeat {
  0%   { transform: scale(1); }
  15%  { transform: scale(1.08); }
  30%  { transform: scale(1); }
  45%  { transform: scale(1.06); }
  60%  { transform: scale(1); }
  100% { transform: scale(1); }
}

/* Onda */
@keyframes pulseWave {
  0% {
    transform: scale(0.8);
    opacity: 0.6;
  }

  70% {
    transform: scale(1.6);
    opacity: 0;
  }

  100% {
    opacity: 0;
  }
}

</style>
